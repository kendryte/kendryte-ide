/**
 * Defines base class for CMake drivers
 */
/** */

import { CMakeExecutable } from '@cmt/cmake/cmake-executable';
import * as path from 'path';
import * as vscode from 'vscode';

import * as api from './api';
import * as expand from './expand';
import { CMakeGenerator, getVSKitEnvironment, Kit, kitChangeNeedsClean } from './kit';
import * as logging from './logging';
import { fs } from './pr';
import * as proc from './proc';
import * as util from './util';
import { ConfigureArguments, VariantOption } from './variant';
import { DirectoryContext } from './workspace';
import { concatBinaryPath } from '@cmt/platform';
import { findItem } from '@cmt/util';

const log = logging.createLogger('driver');

/**
 * Base class for CMake drivers.
 *
 * CMake drivers are separated because different CMake version warrant different
 * communication methods. Older CMake versions need to be driven by the command
 * line, but newer versions may be controlled via CMake server, which provides
 * a much richer interface.
 *
 * This class defines the basis for what a driver must implement to work.
 */
export abstract class CMakeDriver implements vscode.Disposable {
  /**
   * Do the configuration process for the current project.
   *
   * @returns The exit code from CMake
   */
  protected abstract doConfigure(extra_args: string[], consumer?: proc.OutputConsumer): Promise<number>;

  /**
   * Perform a clean configure. Deletes cached files before running the config
   * @param consumer The output consumer
   */
  abstract cleanConfigure(consumer?: proc.OutputConsumer): Promise<number>;

  protected doPreBuild(): Promise<boolean> {
    return Promise.resolve(true);
  }

  protected doPostBuild(): Promise<boolean> {
    return Promise.resolve(true);
  }

  /**
   * Check if we need to reconfigure, such as if an important file has changed
   */
  abstract checkNeedsReconfigure(): Promise<boolean>;

  /**
   * List of targets known to CMake
   */
  abstract get targets(): api.Target[];

  /**
   * List of executable targets known to CMake
   */
  abstract get executableTargets(): api.ExecutableTarget[];

  /**
   * Do any necessary disposal for the driver. For the CMake Server driver,
   * this entails shutting down the server process and closing the open pipes.
   *
   * The reason this is separate from the regular `dispose()` is so that the
   * driver shutdown may be `await`ed on to ensure full shutdown.
   */
  abstract asyncDispose(): Promise<void>;

  /**
   * Construct the driver. Concrete instances should provide their own creation
   * routines.
   */
  protected constructor(public readonly cmake: CMakeExecutable, readonly ws: DirectoryContext) {
  }

  /**
   * Dispose the driver. This disposes some things synchronously, but also
   * calls the `asyncDispose()` method to start any asynchronous shutdown.
   */
  dispose() {
    log.debug('Disposing base CMakeDriver');
    this.asyncDispose();
    this._projectNameChangedEmitter.dispose();
  }

  /**
   * The environment variables required by the current kit
   */
  private _kitEnvironmentVariables = new Map<string, string>();

  /**
   * Get the environment variables required by the current Kit
   */
  getKitEnvironmentVariablesObject(): proc.EnvironmentVariables {
    return util.reduce(this._kitEnvironmentVariables.entries(), {}, (acc, [key, value]) => ({ ...acc, [key]: value }));
  }

  /**
   * Get the environment variables that should be set at CMake-configure time.
   */
  async getConfigureEnvironment(): Promise<proc.EnvironmentVariables> {
    return util.mergeEnvironment(
      this.getKitEnvironmentVariablesObject(),
      await this.getExpandedEnvironment(),
      await this.getBaseConfigureEnvironment(),
      this._variantEnv,
    );
  }

  /**
   * Event fired when the name of the CMake project is discovered or changes
   */
  get onProjectNameChanged() {
    return this._projectNameChangedEmitter.event;
  }

  private readonly _projectNameChangedEmitter = new vscode.EventEmitter<string>();

  public get projectName(): string {
    return this.ws.state.projectName || 'Unknown Project';
  }

  protected doSetProjectName(v: string) {
    this.ws.state.projectName = v;
    this._projectNameChangedEmitter.fire(v);
  }

  /**
   * The current Kit. Starts out `null`, but once set, is never `null` again.
   * We do some separation here to protect ourselves: The `_baseKit` property
   * is `private`, so derived classes cannot change it, except via
   * `_setBaseKit`, which only allows non-null kits. This prevents the derived
   * classes from resetting the kit back to `null`.
   */
  private _kit: Kit|null = null;

  /**
   * Get the environment and apply any needed
   * substitutions before returning it.
   */
  async getExpandedEnvironment(): Promise<{[key: string]: string}> {
    const env = {} as {[key: string]: string};
    const opts = this.expansionOptions;
    await Promise.resolve(util.objectPairs(this.ws.config.environment)
                              .forEach(async ([key, value]) => env[key] = await expand.expandString(value, opts)));
    return env;
  }

  /**
   * Get the configure environment and apply any needed
   * substitutions before returning it.
   */
  async getBaseConfigureEnvironment(): Promise<{[key: string]: string}> {
    const config_env = {} as {[key: string]: string};
    const opts = this.expansionOptions;
    await Promise.resolve(
      util.objectPairs(this.ws.config.configureEnvironment)
          .forEach(async ([key, value]) => config_env[key] = await expand.expandString(value, opts)));
    return config_env;
  }

  /**
   * Get the vscode root workspace folder.
   *
   * @returns Returns the vscode root workspace folder. Returns `null` if no folder is open or the folder uri is not a
   * `file://` scheme.
   */
  private get _workspaceRootPath() {
    if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders[0].uri.scheme !== 'file') {
      return null;
    }
    return util.normalizePath(vscode.workspace.workspaceFolders[0].uri.fsPath);
  }

  /**
   * The options that will be passed to `expand.expandString` for this driver.
   */
  get expansionOptions(): expand.ExpansionOptions {
    const ws_root = this._workspaceRootPath || '.';
    const user_dir = process.platform === 'win32'? process.env['HOMEPATH']! : process.env['HOME']!;

    // Fill in default replacements
    const vars: expand.ExpansionVars = {
      workspaceRoot: ws_root,
      workspaceFolder: ws_root,
      buildType: this.currentBuildType,
      workspaceRootFolderName: path.basename(ws_root),
      generator: this.generatorName || 'null',
      projectName: this.projectName,
      userHome: user_dir,
    };

    // Update Variant replacements
    const variantSettings = this.ws.state.activeVariantSettings;
    if (variantSettings) {
      variantSettings.forEach((value: string, key: string) => {
        if (key != 'buildType') {
          vars[key] = value;
        } else {
          vars['buildLabel'] = value;
        }
      });
    }

    return { vars };
  }

  executeCommand(command: string, args: string[], consumer?: proc.OutputConsumer, options?: proc.ExecutionOptions): proc.Subprocess {
    const cur_env = process.env as proc.EnvironmentVariables;
    const env = util.mergeEnvironment(
      cur_env,
      this.getKitEnvironmentVariablesObject(),
      (options && options.environment)? options.environment : {},
    );
    const exec_options = { ...options, environment: env };
    log.warning('CMake exec options are (without environment): ', JSON.stringify(options));
    return proc.execute(command, args, consumer, exec_options);
  }

  /**
   * Change the current kit. This lets the driver reload, if necessary.
   * @param kit The new kit
   */
  async setKit(kit: Kit): Promise<void> {
    log.info(`Switching to kit: ${kit.name}`);
    const needs_clean = kitChangeNeedsClean(kit, this._kit);
    await this.doSetKit(needs_clean, async () => {
      await this._setKit(kit);
    });
  }

  private async _setKit(kit: Kit): Promise<void> {
    this._kit = Object.seal({ ...kit });
    log.debug('CMakeDriver Kit set to', kit.name);

    this._kitEnvironmentVariables = new Map();
    if (this._kit.environmentVariables) {
      util.objectPairs(this._kit.environmentVariables).forEach(([k, v]) => this._kitEnvironmentVariables.set(k, v));
    }
    if (this._kit.visualStudio && this._kit.visualStudioArchitecture) {
      const vars = await getVSKitEnvironment(this._kit);
      if (!vars) {
        log.error('Invalid VS environment:', this._kit.name);
        log.error('We couldn\'t find the required environment variables');
      } else {
        vars.forEach((val, key) => this._kitEnvironmentVariables.set(key, val));
      }
    }
  }

  protected abstract doSetKit(needsClean: boolean, cb: () => Promise<void>): Promise<void>;

  abstract compilationInfoForFile(filepath: string): Promise<api.CompilationInfo|null>;

  /**
   * The CMAKE_BUILD_TYPE to use
   */
  private _variantBuildType: string = 'Debug';

  /**
   * The arguments to pass to CMake during a configuration according to the current variant
   */
  private _variantConfigureSettings: ConfigureArguments = {};

  /**
   * Determine if we set BUILD_SHARED_LIBS to TRUE or FALSE
   */
  private _variantLinkage: ('static'|'shared'|null) = null;

  /**
   * Environment variables defined by the current variant
   */
  private _variantEnv: proc.EnvironmentVariables = {};

  /**
   * Change the current options from the variant.
   * @param opts The new options
   */
  async setVariantOptions(opts: VariantOption) {
    log.debug('Setting new variant', opts.long || '(Unnamed)');
    this._variantBuildType = opts.buildType || this._variantBuildType;
    this._variantConfigureSettings = opts.settings || this._variantConfigureSettings;
    this._variantLinkage = opts.linkage || null;
    this._variantEnv = opts.env || {};
    await this._refreshExpansions();
  }

  /**
   * Is the driver busy? ie. running a configure/build/test
   */
  get isBusy() {
    return this._isBusy;
  }

  protected _isBusy: boolean = false;

  /**
   * The source directory, where the root CMakeLists.txt lives.
   *
   * @note This is distinct from the config values, since we do variable
   * substitution.
   */
  get sourceDir(): string {
    return this._sourceDirectory;
  }

  private _sourceDirectory = '';

  protected doRefreshExpansions(cb: () => Promise<void>): Promise<void> {
    return cb();
  }

  private async _refreshExpansions() {
    await this.doRefreshExpansions(async () => {
      const opts = this.expansionOptions;
      this._sourceDirectory = util.normalizePath(await expand.expandString(this.ws.config.sourceDirectory, opts));
      this._binaryDir = util.normalizePath(await expand.expandString(this.ws.config.buildDirectory, opts));

      const installPrefix = this.ws.config.installPrefix;
      if (installPrefix) {
        this._installDir = util.normalizePath(await expand.expandString(installPrefix, opts));
      }
    });
  }

  /**
   * Path to where the root CMakeLists.txt file should be
   */
  get mainListFile(): string {
    const file = path.join(this.sourceDir, 'CMakeLists.txt');
    return util.normalizePath(file);
  }

  /**
   * Path to where the root CMakeLists.txt file should be
   */
  get buildDir(): string {
    const file = path.join(this.sourceDir, 'build');
    return util.normalizePath(file);
  }

  /**
   * Directory where build output is stored.
   */
  get binaryDir(): string {
    return this._binaryDir;
  }

  private _binaryDir = '';

  /**
   * Directory where the targets will be installed.
   */
  get installDir(): string|null {
    return this._installDir;
  }

  private _installDir: string|null = null;

  /**
   * @brief Get the path to the CMakeCache file in the build directory
   */
  get cachePath(): string {
    // TODO: Cache path can change if build dir changes at runtime
    const file = path.join(this.binaryDir, 'CMakeCache.txt');
    return util.normalizePath(file);
  }

  /**
   * Get the current build type, according to the current selected variant.
   *
   * This is the value passed to CMAKE_BUILD_TYPE or --config for multiconf
   */
  get currentBuildType(): string {
    return this._variantBuildType;
  }

  get isMultiConf(): boolean {
    return this.generatorName? util.isMultiConfGenerator(this.generatorName) : false;
  }

  /**
   * Get the name of the current CMake generator, or `null` if we have not yet
   * configured the project.
   */
  abstract get generatorName(): string|null;

  get allTargetName(): string {
    const gen = this.generatorName;
    if (gen && (gen.includes('Visual Studio') || gen.toLowerCase().includes('xcode'))) {
      return 'ALL_BUILD';
    } else {
      return 'all';
    }
  }

  /**
   * The ID of the current compiler, as best we can tell
   */
  get compilerID(): string|null {
    const entries = this.cmakeCacheEntries;
    const languages = ['CXX', 'C', 'CUDA'];
    for (const lang of languages) {
      const entry = entries.get(`CMAKE_${lang}_COMPILER`);
      if (!entry) {
        continue;
      }
      const compiler = entry.value as string;
      if (compiler.endsWith('cl.exe')) {
        return 'MSVC';
      } else if (/g(cc|\+\+)/.test(compiler)) {
        return 'GNU';
      } else if (/clang(\+\+)?[^/]*/.test(compiler)) {
        return 'Clang';
      }
    }
    return null;
  }

  get linkerID(): string|null {
    const entries = this.cmakeCacheEntries;
    const entry = entries.get('CMAKE_LINKER');
    if (!entry) {
      return null;
    }
    const linker = entry.value as string;
    if (linker.endsWith('link.exe')) {
      return 'MSVC';
    } else if (linker.endsWith('ld')) {
      return 'GNU';
    }
    return null;
  }

  private async testHaveCommand(program: string, args: string[] = ['--version']): Promise<boolean> {
    const child = this.executeCommand(program, args, undefined, { silent: true });
    try {
      const result = await child.result;
      return result.retc == 0;
    } catch (e) {
      const e2: NodeJS.ErrnoException = e;
      if (e2.code == 'ENOENT') {
        return false;
      }
      throw e;
    }
  }

  getPreferredGenerators(): CMakeGenerator[] {
    const user_preferred = this.ws.config.preferredGenerators.map(g => ({ name: g }));
    if (this._kit && this._kit.preferredGenerator) {
      // The kit has a preferred generator attached as well
      user_preferred.push(this._kit.preferredGenerator);
    }
    return user_preferred;
  }

  /**
   * Picks the best generator to use on the current system
   */
  async getBestGenerator(): Promise<CMakeGenerator|null> {
    // User can override generator with a setting
    const user_generator = this.ws.config.generator;
    if (user_generator) {
      log.debug(`Using generator from user configuration: ${user_generator}`);
      return {
        name: user_generator,
        platform: this.ws.config.platform || undefined,
        toolset: this.ws.config.toolset || undefined,
      };
    }
    log.debug('Trying to detect generator supported by system');
    const platform = process.platform;
    const candidates = this.getPreferredGenerators();
    for (const gen of candidates) {
      const gen_name = gen.name;
      const generator_present = await (async (): Promise<boolean> => {
        if (gen_name == 'Ninja') {
          return await this.testHaveCommand('ninja') || this.testHaveCommand('ninja-build');
        }
        if (gen_name == 'MinGW Makefiles') {
          return platform === 'win32' && this.testHaveCommand('mingw32-make');
        }
        if (gen_name == 'NMake Makefiles') {
          return platform === 'win32' && this.testHaveCommand('nmake', ['/?']);
        }
        if (gen_name == 'Unix Makefiles') {
          return this.testHaveCommand('make');
        }
        return false;
      })();
      if (!generator_present) {
        const vsMatch = /^(Visual Studio \d{2} \d{4})($|\sWin64$|\sARM$)/.exec(gen.name);
        if (platform === 'win32' && vsMatch) {
          return {
            name: vsMatch[1],
            platform: gen.platform || vsMatch[2],
            toolset: gen.toolset,
          };
        }
        if (gen.name.toLowerCase().startsWith('xcode') && platform === 'darwin') {
          return gen;
        }
        continue;
      } else {
        return gen;
      }
    }
    vscode.window.showErrorMessage(
      `Unable to determine what CMake generator to use.
Please install or configure a preferred generator, or update settings.json or your Kit configuration.`);
    return null;
  }

  private readonly _onReconfiguredEmitter = new vscode.EventEmitter<void>();

  get onReconfigured(): vscode.Event<void> {
    return this._onReconfiguredEmitter.event;
  }

  async configure(extra_args: string[], consumer?: proc.OutputConsumer): Promise<number> {
    const pre_check_ok = await this._beforeConfigureOrBuild();
    if (!pre_check_ok) {
      return -1;
    }

    const settings = { ...this.ws.config.configureSettings };

    const _makeFlag = (key: string, cmval: util.CMakeValue) => {
      switch (cmval.type) {
      case 'UNKNOWN':
        return `-D${key}=${cmval.value}`;
      default:
        return `-D${key}:${cmval.type}=${cmval.value}`;
      }
    };

    util.objectPairs(this._variantConfigureSettings).forEach(([key, value]) => settings[key] = value);
    if (this._variantLinkage !== null) {
      settings.BUILD_SHARED_LIBS = this._variantLinkage === 'shared';
    }

    // Always export so that we have compile_commands.json
    settings.CMAKE_EXPORT_COMPILE_COMMANDS = true;

    if (!this.isMultiConf) {
      // Mutliconf generators do not need the CMAKE_BUILD_TYPE property
      settings.CMAKE_BUILD_TYPE = this.currentBuildType;
    }

    // Only use the installPrefix config if the user didn't
    // provide one via configureSettings
    if (!settings.CMAKE_INSTALL_PREFIX && this.installDir) {
      await this._refreshExpansions();
      settings.CMAKE_INSTALL_PREFIX = this.installDir;
    }

    const settings_flags
      = util.objectPairs(settings).map(([key, value]) => _makeFlag(key, util.cmakeify(value as string)));
    const flags = ['--no-warn-unused-cli'].concat(extra_args, this.ws.config.configureArgs);

    console.assert(!!this._kit);
    if (!this._kit) {
      throw new Error('No kit is set!');
    }
    if (this._kit.compilers) {
      log.debug('Using compilers in', this._kit.name, 'for configure');
      flags.push(
        ...util.objectPairs(this._kit.compilers).map(([lang, comp]) => `-DCMAKE_${lang}_COMPILER:FILEPATH=${comp}`));
    }

    settings.MAIX_IDE = 'yes';
    const { production, root } = await this.getSdkPath();
    settings.SDK_ROOT = root;
    if (production) {
      settings.PRODUCTION = 'yes';
    }

    if (this._kit.toolchainFile) {

      log.debug('Using CMake toolchain', this._kit.name, 'for configuring');
      flags.push(`-DCMAKE_TOOLCHAIN_FILE=${this._kit.toolchainFile}`);
    }
    if (this._kit.cmakeSettings) {
      flags.push(...util.objectPairs(this._kit.cmakeSettings).map(([key, val]) => _makeFlag(key, util.cmakeify(val))));
    }

    flags.push(_makeFlag(`TOOLCHAIN`, {
      type: 'PATH',
      value: this._kit.toolchainBinaryPath,
    }));
    const needEnv = [
      ['C_COMPILER', 'gcc'],
      ['CXX_COMPILER', 'g++'],
      ['LINKER', 'ld'],
      ['AR', 'ar'],
      ['CXX_COMPILER_AR', 'ar'],
      ['C_COMPILER_AR', 'ar'],
      ['OBJCOPY', 'objcopy'],
      ['STRIP', 'strip'],
    ];
    for (const [vName, val] of needEnv) {
      flags.push(_makeFlag(`CMAKE_${vName}`, {
        type: 'FILEPATH',
        value: concatBinaryPath(this._kit.toolchainBinaryPath, val),
      }));
    }

    flags.push('-DCMAKE_C_COMPILER_WORKS=1');
    flags.push('-DCMAKE_CXX_COMPILER_WORKS=1');

    // Get expanded configure environment
    const expanded_configure_env = await this.getConfigureEnvironment();

    // Expand all flags
    const final_flags = flags.concat(settings_flags);
    const opts = this.expansionOptions;
    const expanded_flags_promises = final_flags.map(
      async (value: string) => expand.expandString(value, { ...opts, envOverride: expanded_configure_env }));
    const expanded_flags = await Promise.all(expanded_flags_promises);
    log.debug('CMake flags are', JSON.stringify(expanded_flags));

    const retc = await this.patchCMakeList(() => {
      return this.doConfigure(expanded_flags, consumer);
    });
    this._onReconfiguredEmitter.fire();
    await this._refreshExpansions();
    return retc;
  }

  async build(target: string, consumer?: proc.OutputConsumer): Promise<number|null> {
    log.info('CMake Build: ' + target);
    const pre_build_ok = await this.doPreBuild();
    if (!pre_build_ok) {
      log.info('CMake Pre-Build failed.');
      return -1;
    }

    const child = await this.patchCMakeList(() => {
      return this._doCMakeBuild(target, consumer);
    });

    if (!child) {
      return -1;
    }
    const post_build_ok = await this.doPostBuild();
    if (!post_build_ok) {
      log.info('CMake Post-Build failed.');
      return -1;
    }
    await this._refreshExpansions();
    return (await child.result).retc;
  }

  /**
   * Execute pre-configure/build tasks to check if we are ready to run a full
   * configure. This should be called by a derived driver before any
   * configuration tasks are run
   */
  private async _beforeConfigureOrBuild(): Promise<boolean> {
    log.debug('Runnnig pre-configure checks and steps');
    if (this._isBusy) {
      if (this.ws.config.autoRestartBuild) {
        log.debug('Stopping current CMake task.');
        vscode.window.showInformationMessage('Stopping current CMake task and starting new build.');
        await this.stopCurrentProcess();
      } else {
        log.debug('No configuring: We\'re busy.');
        vscode.window.showErrorMessage('A CMake task is already running. Stop it before trying to configure.');
        return false;
      }
    }

    if (!this.sourceDir) {
      log.debug('No configuring: There is no source directory.');
      vscode.window.showErrorMessage('You do not have a source directory open');
      return false;
    }

    const cmake_list = this.mainListFile;
    if (!await fs.exists(cmake_list)) {
      log.debug('No configuring: There is no ', cmake_list);
      const ret = await vscode.commands.executeCommand('cmake.quickStart', cmake_list);
      if (ret !== 0) {
        vscode.window.showErrorMessage(`Build canceled: configure return ${ret}.`);
        return false;
      }
    }

    return true;
  }

  /**
   * The currently running process. We keep a handle on it so we can stop it
   * upon user request
   */
  private _currentProcess: proc.Subprocess|null = null;

  private async _doCMakeBuild(target: string, consumer?: proc.OutputConsumer): Promise<proc.Subprocess|null> {
    const ok = await this._beforeConfigureOrBuild();
    if (!ok) {
      log.error('CMake Pre-Configure failed.');
      return null;
    }

    const gen = this.generatorName;
    const generator_args = (() => {
      if (!gen) {
        return [];
      } else if (/(Unix|MinGW) Makefiles|Ninja/.test(gen) && target !== 'clean') {
        return ['-j', this.ws.config.numJobs.toString()];
      } else if (gen.includes('Visual Studio')) {
        return [
          '/m',
          '/property:GenerateFullPaths=true',
        ];
      }// TODO: Older VS doesn't support these flags
      else {
        return [];
      }
    })();

    const build_env = {} as {[key: string]: string};
    const opts = this.expansionOptions;
    await Promise.resolve(
      util.objectPairs(util.mergeEnvironment(this.ws.config.buildEnvironment, await this.getExpandedEnvironment()))
          .forEach(async ([key, value]) => build_env[key] = await expand.expandString(value, opts)));

    const args = ['--build', this.binaryDir, '--config', this.currentBuildType, '--target', target]
      .concat(this.ws.config.buildArgs, ['--'], generator_args, this.ws.config.buildToolArgs);
    const expanded_args_promises
      = args.map(async (value: string) => expand.expandString(value, { ...opts, envOverride: build_env }));
    const expanded_args = await Promise.all(expanded_args_promises);
    log.warning('CMake build args are: ', JSON.stringify(expanded_args));

    const cmake = this.cmake.path;
    const child = this.executeCommand(cmake, expanded_args, consumer, { environment: build_env });
    this._currentProcess = child;
    this._isBusy = true;
    await child.result;
    this._isBusy = false;
    this._currentProcess = null;
    return child;
  }

  /**
   * Stops the currently running process at user request
   */
  async stopCurrentProcess(): Promise<boolean> {
    const cur = this._currentProcess;
    if (!cur) {
      return false;
    }
    await util.termProc(cur.child);
    return true;
  }

  /**
   * The CMake cache for the driver.
   *
   * Will be automatically reloaded when the file on disk changes.
   */
  abstract get cmakeCacheEntries(): Map<string, api.CacheEntryProperties>;

  private async _baseInit(kit: Kit|null) {
    if (kit) {
      // Load up kit environment before starting any drivers.
      await this._setKit(kit);
    }
    await this._refreshExpansions();
    await this.doInit();
  }

  protected abstract doInit(): Promise<void>;

  /**
   * Asynchronous initialization. Should be called by base classes during
   * their initialization.
   */
  static async createDerived<T extends CMakeDriver>(inst: T, kit: Kit|null): Promise<T> {
    await inst._baseInit(kit);
    return inst;
  }

  /**
   * http://www.cmake.org/Bug/view.php?id=9985
   */
  async patchCMakeList<T>(cb: () => Promise<T>): Promise<T> {
    let cmakeFileContent: string;
    const SDK = await this.getSdkPath();

    const backupFile = path.join(this.buildDir, 'cmakelist.back.cmake');
    if (await fs.exists(backupFile)) {
      cmakeFileContent = await fs.readFile(backupFile, 'utf-8');
    } else {
      cmakeFileContent = await fs.readFile(this.mainListFile, 'utf-8');
      await fs.writeFile(backupFile, cmakeFileContent, 'utf-8');
    }

    if (!await fs.exists(this.buildDir)) {
      await fs.mkdir(this.buildDir);
    }
    await fs.writeFile(path.join(this.buildDir, 'CMakeLists.txt'), DEBUG_CMAKE_FILE + SDK.PREPEND + cmakeFileContent + SDK.APPEND, 'utf-8');
    await fs.writeFile(this.mainListFile, SDK.PREPEND + cmakeFileContent + SDK.APPEND, 'utf-8');
    await this._refreshExpansions();

    log.warning('PATCH CMakeList.txt in dir: ' + this.buildDir);
    const p = cb();

    await p.then(async () => {
      log.warning('PATCH CMakeList.txt REVERT');
      await fs.writeFile(this.mainListFile, cmakeFileContent, 'utf-8');
      await fs.unlink(backupFile);
    }, async () => {
      log.warning('PATCH CMakeList.txt REVERT');
      await fs.writeFile(this.mainListFile, cmakeFileContent, 'utf-8');
      await fs.unlink(backupFile);
    });

    return p;
  }

  private _sdkPathCache: {production: boolean; root: string; PREPEND: string; APPEND: string}|null = null;

  private async getSdkPath(): Promise<{production: boolean; root: string; PREPEND: string; APPEND: string}> {
    if (this._sdkPathCache) {
      return this._sdkPathCache;
    }
    const { item: rootProd, found } = await findItem('SDK');
    if (!found) {
      if (await fs.exists(this.mainListFile)) {
        const content = await fs.readFile(this.mainListFile, 'utf-8');
        if (/BUILDING_SDK/.test(content)) {
          log.info('compiling sdk library.');
          return {
            // Well, current project is just the SDK
            production: false,
            root: this.sourceDir,
            PREPEND: `include("${this.sourceDir}/cmake/common.cmake")\n`,
            APPEND: `include("${this.sourceDir}/cmake/executable.cmake")\n`,
          };
        }
      }
      throw new Error('Maix SDK not found. Please re-install IDE.');
    }
    this._sdkPathCache = {
      production: true,
      root: rootProd,
      PREPEND: `include(${rootProd}/cmake/common.cmake)\n`,
      APPEND: `include(${rootProd}/cmake/executable.cmake)\n`,
    };
    return this._sdkPathCache;
  }
}

const DEBUG_CMAKE_FILE = `
get_filename_component(__P \${CMAKE_SOURCE_DIR} DIRECTORY)
set(CMAKE_SOURCE_DIR $__P);
`;
