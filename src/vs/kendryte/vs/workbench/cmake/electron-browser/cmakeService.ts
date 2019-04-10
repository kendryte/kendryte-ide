import { CMAKE_CHANNEL, CMAKE_CHANNEL_TITLE, CMakeInternalVariants, CurrentItem, ICMakeSelection, ICMakeService } from 'vs/kendryte/vs/workbench/cmake/common/type';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ILifecycleService } from 'vs/platform/lifecycle/common/lifecycle';
import { ChildProcess, spawn } from 'child_process';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { exists, fileExists, mkdirp, readFile, rename, rimraf, writeFile } from 'vs/base/node/pfs';
import { createConnection } from 'net';
import * as split2 from 'split2';
import {
	CMAKE_EVENT_TYPE,
	CMAKE_SIGNAL_TYPE,
	ICMakeProtocol,
	ICMakeProtocolAny,
	ICMakeRequest,
	ICMakeResponse,
} from 'vs/kendryte/vs/workbench/cmake/common/cmakeProtocol/cmakeProtocol';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { unlinkSync } from 'fs';
import { Emitter, Event } from 'vs/base/common/event';
import { ICMakeProtocolError } from 'vs/kendryte/vs/workbench/cmake/common/cmakeProtocol/error';
import { ICMakeProtocolMessage, ICMakeProtocolProgress, ICMakeProtocolReply } from 'vs/kendryte/vs/workbench/cmake/common/cmakeProtocol/event';
import { ICMakeProtocolSignal } from 'vs/kendryte/vs/workbench/cmake/common/cmakeProtocol/singal';
import {
	ICMakeProtocolCodeModel,
	ICMakeProtocolCompute,
	ICMakeProtocolConfigure,
	ICMakeProtocolHandshake,
	ICMakeProtocolHello,
	ICMakeProtocolSetGlobalSettings,
} from 'vs/kendryte/vs/workbench/cmake/common/cmakeProtocol/message';
import { CMakeCache } from 'vs/kendryte/vs/workbench/cmake/node/cmakeCache';
import { isWindows } from 'vs/base/common/platform';
import { LineData, LineProcess } from 'vs/base/node/processes';
import { cpus } from 'os';
import { CMAKE_TARGET_TYPE } from 'vs/kendryte/vs/workbench/cmake/common/cmakeProtocol/config';
import { INodePathService } from 'vs/kendryte/vs/services/path/common/type';
import { resolvePath } from 'vs/kendryte/vs/base/node/resolvePath';
import { DebugScript, getEnvironment } from 'vs/kendryte/vs/workbench/cmake/node/environmentVars';
import { executableExtension } from 'vs/kendryte/vs/base/common/platformEnv';
import { CMakeBuildErrorProcessor, CMakeBuildProgressProcessor, CMakeProcessList } from 'vs/kendryte/vs/workbench/cmake/node/outputProcessor';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { CMAKE_CONFIG_FILE_NAME, CMAKE_LIST_GENERATED_WARNING } from 'vs/kendryte/vs/base/common/jsonSchemas/cmakeConfigSchema';
import { IChannelLogService } from 'vs/kendryte/vs/services/channelLogger/common/type';
import { ILogService, LogLevel } from 'vs/platform/log/common/log';
import { INodeFileSystemService } from 'vs/kendryte/vs/services/fileSystem/common/type';
import { CMakeListsCreator } from 'vs/kendryte/vs/workbench/cmake/electron-browser/listsCreator';
import { CONFIG_KEY_CMAKE_DEBUG, CONFIG_KEY_MAKE_PROGRAM } from 'vs/kendryte/vs/base/common/configKeys';
import { IKendryteStatusControllerService } from 'vs/kendryte/vs/workbench/bottomBar/common/type';
import { IContextKey, IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { CONTEXT_CMAKE_SEEMS_OK, CONTEXT_CMAKE_WORKING } from 'vs/kendryte/vs/workbench/cmake/common/contextKey';
import { CMakeError, CMakeErrorType } from 'vs/kendryte/vs/workbench/cmake/common/errors';
import { DeferredPromise } from 'vs/kendryte/vs/base/common/deferredPromise';
import { localize } from 'vs/nls';

export class CMakeService implements ICMakeService {
	_serviceBrand: any;

	private readonly logger: ILogService;

	protected localEnv: any;
	protected localDefine: string[];

	protected alreadyConfigured: boolean;
	protected selectedTarget: string;
	protected selectedVariant: string;

	protected cmakeProcess: ChildProcess;
	private cmakeEndPromise: Promise<any>;
	private cmakePipe: NodeJS.ReadWriteStream; // Socket
	private cmakePipeFile: string;

	protected _currentFolder: string;
	protected _CMakeProjectExists: boolean;

	private cmakeRequests: { [cookie: string]: DeferredPromise<ICMakeResponse> } = {};

	private readonly _onCMakeEvent = new Emitter<ICMakeProtocol>();
	public readonly onCMakeEvent: Event<ICMakeProtocol> = this._onCMakeEvent.event;
	private cmakeConnectionStablePromise: DeferredPromise<void>;
	private lastProcess: CMakeProcessList;

	private readonly _onCMakeProjectChange = new Emitter<Error | null>();
	public readonly onCMakeProjectChange = this._onCMakeProjectChange.event;
	private readonly cmakeConfiguredContextKey: IContextKey<boolean>;
	private readonly cmakeWorkingContextKey: IContextKey<boolean>;

	private readonly _onCMakeSelectionChange = new Emitter<ICMakeSelection>();
	public readonly onCMakeSelectionChange = this._onCMakeSelectionChange.event;
	private verbose: boolean;

	constructor(
		@ILifecycleService lifecycleService: ILifecycleService,
		@IContextKeyService contextKeyService: IContextKeyService,
		@ICommandService commandService: ICommandService,
		@IChannelLogService channelLogService: IChannelLogService,
		@IInstantiationService private readonly instantiationService: IInstantiationService,
		@IWorkspaceContextService private readonly workspaceContextService: IWorkspaceContextService,
		@INotificationService private readonly notificationService: INotificationService,
		@INodePathService private readonly nodePathService: INodePathService,
		@INodeFileSystemService private readonly nodeFileSystemService: INodeFileSystemService,
		@IConfigurationService private readonly configurationService: IConfigurationService,
		@IKendryteStatusControllerService private readonly kendryteStatusControllerService: IKendryteStatusControllerService,
	) {
		this.logger = channelLogService.createChannel(CMAKE_CHANNEL_TITLE, CMAKE_CHANNEL);

		this.cmakeConfiguredContextKey = CONTEXT_CMAKE_SEEMS_OK.bindTo(contextKeyService);
		this.cmakeWorkingContextKey = CONTEXT_CMAKE_WORKING.bindTo(contextKeyService);

		lifecycleService.onWillShutdown(e => {
			return e.join(this.shutdown(true));
		});

		this.reloadSettings();
		configurationService.onDidChangeConfiguration((e) => {
			if (e.affectsConfiguration(CONFIG_KEY_CMAKE_DEBUG)) {
				this.reloadSettings();
			}
		});

		this.localEnv = {};
		this.localEnv.KENDRYTE_IDE = 'yes';

		this.localDefine = [];
		this.localDefine.push(`-DCMAKE_EXPORT_COMPILE_COMMANDS:BOOL=TRUE`);

		console.log('cmake service init.');
		if (isWindows) {
			this.localEnv.CMAKE_MAKE_PROGRAM = 'mingw32-make.exe';
		} else {
			this.localEnv.CMAKE_MAKE_PROGRAM = this.configurationService.getValue<string>(CONFIG_KEY_MAKE_PROGRAM) || '/usr/bin/make';
		}

		this.workspaceContextService.onDidChangeWorkspaceFolders(() => {
			this.rescanCurrentFolder().then(undefined, (e) => {
				this.notificationService.error(e);
				console.log(e);
				return this.shutdown();
			});
		});

		this.rescanCurrentFolder();
	}

	private reloadSettings() {
		this.verbose = this.configurationService.getValue<boolean>(CONFIG_KEY_CMAKE_DEBUG);
		if (this.verbose) {
			this.logger.setLevel(LogLevel.Trace);
			this.logger.info('Verbose log is ON');
		} else {
			this.logger.setLevel(LogLevel.Info);
			this.logger.info('Verbose log is OFF');
		}
	}

	get readyState() {
		return this.cmakeConnectionStablePromise;
	}

	private async getCMakeDef(): Promise<{ [name: string]: string }> {
		let staticEnvFile = resolvePath(this._currentFolder, '.vscode/cmake-env.json');
		let staticEnv: any = {};
		if (await fileExists(staticEnvFile)) {
			staticEnv = JSON.parse(await readFile(staticEnvFile, 'utf8'));
		} else {
			await this.nodeFileSystemService.rawWriteFile(staticEnvFile, '{}');
		}
		return staticEnv;
	}

	private async getCMakeEnv() {
		const staticEnv = await this.getCMakeDef();
		const env: any = getEnvironment(this.nodePathService);

		return {
			...env,
			...staticEnv,
			...this.localEnv,
		};
	}

	protected async runCMakeRaw(...args: string[]) {
		const cmakePath = this.getCMakeToRun();
		await mkdirp(this.buildPath);

		const options = {
			env: await this.getCMakeEnv(),
			cwd: this.buildPath,
		};

		const dbg = new DebugScript(options.cwd, options.env);
		dbg.command(cmakePath.cmake, args);
		await dbg.writeBack(this.nodePathService.workspaceFilePath(), 'last-cmake-command');

		this.logger.info('Start CMake Command: %s %s\nCWD=%s', cmakePath.cmake, args.join(' '), options.cwd);
		const child = spawn(cmakePath.cmake, args, options);
		this.logger.info(`Started CMake Command with PID %s`, child.pid);
		child.stdout.on('data', data => this.logger.debug(data.toString()));
		child.stderr.on('data', data => this.logger.warn(data.toString()));

		return new Promise((resolve, reject) => {
			child.on('error', (e) => {
				this.logger.error(`CMake Command Failed: %s`, e.message);
				reject(e);
			});
			child.on('exit', (code, signal) => {
				if (signal || code) {
					this.logger.info(`CMake Command exit with %s`, signal || code);
					reject(new Error(localize('errorCMakeExit', 'CMake command failed with {0}', signal || code)));
				} else {
					this.logger.info('CMake Command successful finished');
					resolve();
				}
			});
		});
	}

	private async ensureProcess() {
		if (this.cmakeProcess) {
			return;
		}
		const cmakePath = this.getCMakeToRun();

		this.logger.info('_currentFolder=%s', this._currentFolder);
		await mkdirp(resolvePath(this._currentFolder, '.vscode'));

		const pipeFilePath: string = await this.nodeFileSystemService.prepareSocketFile('cmake_server_pipe');
		this.logger.info('pipeFilePath=%s', pipeFilePath);
		this.cmakePipeFile = pipeFilePath;

		const args = ['-E', 'server', '--experimental', '--pipe=' + pipeFilePath];
		const options = {
			env: await this.getCMakeEnv(),
			cwd: cmakePath.bins,
		};

		const dbg = new DebugScript(options.cwd, options.env);
		dbg.command(cmakePath.cmake, args);
		dbg.writeBack(this.nodePathService.workspaceFilePath(), 'cmake-server');

		this.logger.info('Start new CMake Server: %s %s\nCWD=%s', cmakePath.cmake, args.join(' '), options.cwd);

		const child = this.cmakeProcess = spawn(cmakePath.cmake, args, options);

		const pExit = new Promise<void>((resolve, reject) => {
			child.on('exit', resolve);
			child.on('error', reject);
		});

		this.logger.info(`Started new CMake Server instance with PID %s`, child.pid);
		child.stdout.on('data', data => this.handleOutput(data.toString()));
		child.stderr.on('data', data => this.handleOutput(data.toString()));

		await new Promise((resolve) => {
			setTimeout(resolve, 1000);
		});

		this.logger.info('CMake connect: %s', pipeFilePath);
		try {
			this.cmakePipe = createConnection(pipeFilePath);
		} catch (e) {
			await this.shutdown(true);
			throw e;
		}
		const pipe = this.cmakePipe;

		this.cmakeConnectionStablePromise = new DeferredPromise();
		pipe.pipe(split2()).on('data', (line: Buffer) => {
			const l = line.toString('utf8').trim();
			this.handleProtocol(l);
		});

		const pEnd = new Promise<void>((resolve, reject) => {
			pipe.on('error', e => {
				this.logger.info('CMake server error:\n' + e.stack);
				debugger;
				pipe.end();
				reject(e);
			});
			pipe.on('end', () => {
				resolve(undefined);
			});
		});

		this.cmakeEndPromise = Promise.race([pEnd, pExit]);
		this.cmakeEndPromise.then(() => this.shutdownClean(), (e) => {
			this.cmakeConnectionStablePromise.error(e);
			this.shutdownClean();
		});

		child.on('close', (retc: number, signal: string) => {
			if (retc !== 0) {
				this.logger.info(`CMake terminated with status ${retc} (${signal})`);
			}
		});

		await this.cmakeConnectionStablePromise.p;
	}

	private shutdownClean() {
		this.alreadyConfigured = false;
		this.selectedTarget = '';
		this.selectedVariant = '';
		delete this.cmakeProcess;
		delete this.cmakeEndPromise;
		delete this.cmakePipe;
		this.cmakeConnectionStablePromise.error(new Error(localize('errorCMakeCrash', 'cmake process crashing')));
		delete this.cmakeConnectionStablePromise;
		try {
			unlinkSync(this.cmakePipeFile);
		} catch (e) {
		}
	}

	async shutdown(force: boolean = false): Promise<void> {
		if (this.cmakeProcess) {
			this.logger.info('shutdown CMake server...');

			if (force) {
				this.cmakeProcess.kill('SIGKILL');
				this.shutdownClean();
			} else {
				this.cmakePipe.end();
				await this.cmakeEndPromise;
			}

			this.logger.info('CMake server shutdown complete...');
		}
	}

	private handleOutput(output: string) {
		for (const line of output.split(/\n/g)) {
			this.logger.info('CMake: ' + line);
		}
	}

	private _cmakeLineCache: string[] = [];
	private _cmakeLineState: boolean = false;

	private handleProtocol(line: string) {
		if (line === '[== "CMake Server" ==[' && !this._cmakeLineState) {
			// this.logger.info(`\nProtocol: ${line}`);
			this._cmakeLineState = true;
		} else if (line === ']== "CMake Server" ==]' && this._cmakeLineState) {
			// this.logger.info(`Protocol: ${line}\n`);
			this._cmakeLineState = false;
			const msg = this._cmakeLineCache.join('\n').trim();
			this._cmakeLineCache.length = 0;

			if (this.verbose && msg.length) {
				this.logger.trace('>>> ' + msg);
			}

			this.handleProtocolInput(msg);
		} else if (this._cmakeLineState) {
			// this.logger.info(`Protocol: ${line}`);
			this._cmakeLineCache.push(line);
		} else if (line) {
			this.logger.error('Protocol: ??? ' + line);
		}
	}

	private handleProtocolInput(msg: string) {
		const protocolData: ICMakeProtocol & ICMakeProtocolAny = JSON.parse(msg);
		this._onCMakeEvent.fire(protocolData);

		if (protocolData.cookie) {
			const dfd = this.cmakeRequests[protocolData.cookie];
			if (!dfd) {
				console.error('cannot handle.');
			}
			switch (protocolData.type) {
				case CMAKE_EVENT_TYPE.REPLY:
					dfd.complete(protocolData as ICMakeProtocolReply);
					return;
				case CMAKE_EVENT_TYPE.ERROR:
					const err = protocolData as ICMakeProtocolError;
					dfd.error({ ...err, message: err.errorMessage } as any);
					return;
				case CMAKE_EVENT_TYPE.PROGRESS:
					dfd.notify(protocolData as ICMakeProtocolProgress);
					return;
			}
		}

		switch (protocolData.type) {
			case CMAKE_EVENT_TYPE.HELLO:
				this.initBaseConfigWhenHello(protocolData as ICMakeProtocolHello).then(() => {
					this.cmakeConnectionStablePromise.complete();
				}, (e) => {
					this.cmakeConnectionStablePromise.error(e);
				});
				return;
			case CMAKE_EVENT_TYPE.MESSAGE:
				const message = protocolData as ICMakeProtocolMessage;
				this.logger.info(message.message);
				return;
			case CMAKE_EVENT_TYPE.SIGNAL:
				switch ((protocolData as ICMakeProtocolSignal).name) {
					case CMAKE_SIGNAL_TYPE.DIRTY:
						// console.log('dirty event: %O', protocolData);
						this.alreadyConfigured = false;
						return;
					case CMAKE_SIGNAL_TYPE.FILECHANGE:
						// console.log('change event: %s', (protocolData as ICMakeProtocolFileChangeSignal).path);
						return;
				}
		}
		debugger;
		console.error('Unknown CMake Event: %O', protocolData);
	}

	protected async sendRequest(payload: ICMakeRequest) {
		if (!this.cmakeProcess) {
			await this.ensureProcess();
		}
		if (!payload.cookie) {
			payload.cookie = Date.now().toString() + ':' + Math.random().toString();
		}

		this.cmakeRequests[payload.cookie] = new DeferredPromise();
		const data = JSON.stringify(payload);

		if (this.verbose) {
			this.logger.trace('<<< ' + data);
		}
		this.cmakePipe.write(`[== "CMake Server" ==[\n${data}\n]== "CMake Server" ==]\n`);

		return await this.cmakeRequests[payload.cookie].p;
	}

	get isEnabled(): boolean {
		return !!(this._currentFolder && this._CMakeProjectExists);
	}

	public rescanCurrentFolder(): Promise<void> {
		this.logger.info('rescan current folder');

		this.cmakeConfiguredContextKey.set(false);
		this.cmakeWorkingContextKey.set(true);
		this._onCMakeProjectChange.fire(null);

		return this._rescanCurrentFolder().then(() => {
			this.cmakeConfiguredContextKey.set(true);
			this._onCMakeProjectChange.fire(null);
			this.cmakeWorkingContextKey.set(false);
		}, (e) => {
			this.logger.info('rescan current folder error!');
			this.logger.error(e.stack);

			this.cmakeConfiguredContextKey.set(false);
			this._onCMakeProjectChange.fire(e);
			this.cmakeWorkingContextKey.set(false);
		});
	}

	public async _rescanCurrentFolder(): Promise<void> {
		const currentDir = this.nodePathService.workspaceFilePath('./');

		this.logger.info('Workspace folder changed, stopping CMake server...');
		await this.shutdown();

		this.logger.info('Workspace change to: %s', currentDir);
		this._currentFolder = currentDir;
		// this.localEnv.INSTALL_PREFIX = resolvePath(currentDir, 'build/install');

		this.logger.info('detecting project in ' + this._currentFolder);

		if (!this._currentFolder) {
			this._CMakeProjectExists = false;
			throw new CMakeError(CMakeErrorType.NO_WORKSPACE);
		}
		let listSourceFile = resolvePath(this._currentFolder, CMAKE_CONFIG_FILE_NAME);

		if (!await exists(listSourceFile)) {
			this._CMakeProjectExists = false;
			throw new CMakeError(CMakeErrorType.PROJECT_NOT_EXISTS);
		}
		this.logger.info('  ' + CMAKE_CONFIG_FILE_NAME + ' found.');

		let createdListFile = resolvePath(this._currentFolder, 'CMakeLists.txt');
		if (await exists(createdListFile)) {
			this.logger.info('  CMakeLists.txt found.');
			const content = await readFile(createdListFile, 'utf8');
			if (content.indexOf(CMAKE_LIST_GENERATED_WARNING) === -1) {
				this.logger.info('    - Error: this file is not created by me, refuse to delete it.');
				throw new CMakeError(CMakeErrorType.PROJECT_NOT_EXISTS);
			}
			this.logger.info('    - is safe to delete it.');
		}
		this._CMakeProjectExists = true;

		this.setTarget('');
		this.setVariant('');

		await this.generateCMakeListsFile();
		this.logger.info('  - CMake project is exists.');
	}

	private get cmakeLists() {
		if (this._CMakeProjectExists) {
			return resolvePath(this._currentFolder, 'CMakeLists.txt');
		} else {
			this.logger.error('This is not a cmake project: ' + this._currentFolder);
			throw new CMakeError(CMakeErrorType.PROJECT_NOT_EXISTS);
		}
	}

	get buildPath() {
		if (!this._currentFolder) {
			this.logger.error('You must open a folder to do this.');
			throw new CMakeError(CMakeErrorType.NO_WORKSPACE);
		}
		return resolvePath(this._currentFolder, 'build');
	}

	private async initBaseConfigWhenHello(hello: ICMakeProtocolHello) {
		const buildFolder = this.buildPath;

		const handshake: ICMakeProtocolHandshake = {
			type: CMAKE_EVENT_TYPE.HANDSHAKE,
			buildDirectory: buildFolder,
			protocolVersion: hello.supportedProtocolVersions[0],
			sourceDirectory: this._currentFolder,
			generator: 'Unix Makefiles',
		};

		const tmpCache = await CMakeCache.fromPath(resolvePath(buildFolder, 'CMakeCache.txt'));
		const srcDir = tmpCache.get('CMAKE_HOME_DIRECTORY');
		if (srcDir) {
			handshake.sourceDirectory = srcDir.value;
		}

		await this.sendRequest(handshake);

		await this.sendRequest({
			type: CMAKE_EVENT_TYPE.SETGLOBALSETTINGS,
			debugOutput: true,
		} as ICMakeProtocolSetGlobalSettings);
	}

	public async cleanupMake(): Promise<void> {
		await this.shutdown();
		this.alreadyConfigured = false;
		this.logger.info('Run Clean');
		const buildFolder = this.buildPath;
		this.logger.info('    the build dir is: %s', buildFolder);

		this.logger.info('deleting files...');
		await rimraf(buildFolder);
		this.logger.info('OK.');
	}

	public configure(): Promise<void> {
		this.cmakeWorkingContextKey.set(true);
		return this._configure().then(() => {
			this._onCMakeProjectChange.fire(null);
		}, (e) => {
			this._onCMakeProjectChange.fire(e);
			throw e;
		}).finally(() => {
			this.cmakeWorkingContextKey.set(false);
		});
	}

	private async _configure() {
		if (!this._CMakeProjectExists) {
			this.logger.error('refuse to configure.');
			this.logger.error('This is not a cmake project: ' + this._currentFolder);
			throw new CMakeError(CMakeErrorType.PROJECT_NOT_EXISTS);
		}

		await this.generateCMakeListsFile();

		const envDefine: string[] = [];
		const envSource = { ...await this.getCMakeDef(), ...this.localEnv };
		for (const name of Object.keys(envSource)) {
			const value = envSource[name];
			if (value) {
				envDefine.push(`-D${name}=${value}`);
			} else {
				envDefine.push(`-D${name}`);
			}
		}

		const configArgs = ['--no-warn-unused-cli', '-Wno-dev', ...this.localDefine, ...envDefine];
		if (this.selectedVariant) {
			configArgs.push(`-DCMAKE_BUILD_TYPE:STRING=${this.selectedVariant}`);
		}

		// await this.runCMakeRaw('..', '-G', 'Unix Makefiles', ...configArgs);

		this.logger.info('configuring project: %s', this.cmakeLists);
		this.logger.info(configArgs.join('\n'));
		await this.sendRequest({
			type: CMAKE_EVENT_TYPE.CONFIGURE,
			cacheArguments: configArgs,
		} as ICMakeProtocolConfigure);
		await this.sendRequest({
			type: CMAKE_EVENT_TYPE.COMPUTE,
		} as ICMakeProtocolCompute);

		this.alreadyConfigured = true;

		await this.notifyCppExtension();

		this.logger.info('');
		this.logger.info('~ Configure complete! ~');
	}

	public build() {
		this.cmakeWorkingContextKey.set(true);
		return this._build().finally(() => {
			this.cmakeWorkingContextKey.set(false);
		});
	}

	public async _build() {
		await this.ensureConfiguration();

		this.logger.info('Run cmake build:');

		let make: string = this.getCMakeToRun().cmake;

		let procNumber = cpus().length - 1;
		if (procNumber <= 0) {
			procNumber = 2;
		}

		const buildPath = this.buildPath;
		const args = ['--build', buildPath];

		if (this.selectedVariant) {
			args.push('--config', this.selectedVariant);
		}
		if (this.selectedTarget) {
			args.push('--target', this.selectedTarget);
		}
		args.push('--', '-j', procNumber.toFixed(0));

		if (this.lastProcess) {
			this.lastProcess.dispose();
		}
		const processors = this.lastProcess = new CMakeProcessList([
			new CMakeBuildProgressProcessor(this.kendryteStatusControllerService),
			this.instantiationService.createInstance(CMakeBuildErrorProcessor),
		]);

		const exe = {
			command: make,
			isShellCommand: false,
			args,
			options: {
				cwd: buildPath,
				env: await this.getCMakeEnv(),
			},
		};
		console.log('spawn process %O', exe);
		const process = new LineProcess(exe);

		const dbg = new DebugScript(exe.options.cwd, exe.options.env);
		dbg.command(exe.command, exe.args);
		dbg.writeBack(this.nodePathService.workspaceFilePath(), 'cmake-build');

		const ret = await process.start((data: LineData) => {
			// console.info(data);
			this.logger.info(data.line);
			processors.parseLine(data.line);
		});

		processors.finalize();

		this.logger.info('');
		if (ret.error) {
			this.logger.info('Build Error:', ret.error);
			throw ret.error;
		}
		if (ret.cmdCode !== 0) {
			this.logger.info('Build Error: %s exited with code %s.', make, ret.cmdCode);
			throw new Error(localize('errorBuildErrorCode', 'make failed with code {0}', ret.cmdCode));
		} else {
			processors.dispose();
			delete this.lastProcess;
		}
	}

	async ensureConfiguration(): Promise<ICMakeProtocolCodeModel> {
		if (!this.alreadyConfigured) {
			await this._configure();
		}
		return await this.sendRequest({ type: CMAKE_EVENT_TYPE.CODEMODEL }) as ICMakeProtocolCodeModel;
	}

	setVariant(variant: string) {
		this.alreadyConfigured = false;
		this.selectedVariant = variant;
		this._onCMakeSelectionChange.fire({
			variant: this.selectedVariant,
			target: this.selectedTarget,
		});
		// this.controller.selectVariantButton.text = variant ? '[' + variant + ']' : '<Default>';
	}

	setTarget(target: string) {
		this.selectedTarget = target;
		this._onCMakeSelectionChange.fire({
			variant: this.selectedVariant,
			target: this.selectedTarget,
		});
		// this.controller.selectTargetButton.text = target ? '[' + target + ']' : '<All>';
	}

	async getVariantList(): Promise<CurrentItem[]> {
		const variants = CMakeInternalVariants();
		const vids: string[] = variants.map(e => e.id) as string[];

		try {
			const codeModel = await this.ensureConfiguration();
			for (const variant of codeModel.configurations) {
				if (vids.indexOf(variant.name) === -1) {
					vids.push(variant.name);
					variants.push({
						id: variant.name,
						label: variant.name,
						description: 'Custom Variant',
					});
				}
			}
		} catch (e) {
		}

		const selected = vids.indexOf(this.selectedVariant);
		if (variants[selected]) {
			variants[selected].current = true;
		}

		variants.unshift({
			id: '',
			label: '<default>',
			description: 'Build with default environment.',
		});

		return variants;
	}

	private async getCurrentVariant() {
		const codeModel = await this.ensureConfiguration();

		let findCurrent: boolean;
		for (const variant of codeModel.configurations) {
			findCurrent = this.selectedVariant
				? variant.name === this.selectedVariant
				: variant.name === 'Debug';
			if (!findCurrent) {
				continue;
			}

			return variant;
		}
		return null;
	}

	async getTargetList(): Promise<CurrentItem[]> {
		let ret: CurrentItem[] = [
			{
				id: '',
				label: '<default>',
				description: 'Build the default target',
			},
		];

		const variant = await this.getCurrentVariant();

		if (!variant) {
			const e = new Error(localize('errorNoVariant', 'No build variant named: {0}', this.selectedVariant));
			this.notificationService.error(e);
			throw e;
		}

		for (const project of variant.projects) {
			ret.push({
				id: project.name,
				label: project.name,
				description: 'Build everything in ' + project.name + ' project',
			});
		}

		ret.push({
			id: 'install',
			label: '<install>',
			description: 'Build the `install` meta target',
		});

		return ret;
	}

	private async getCurrentProject() {
		const variant = await this.getCurrentVariant();
		if (!variant) {
			return null;
		}
		for (const proj of variant.projects) {
			if (this.selectedTarget === proj.name) {
				return proj;
			}
		}
		// try find first project that has executable
		return variant.projects.find((item) => {
			return -1 !== item.targets.findIndex((item) => {
				return item.type === 'EXECUTABLE';
			});
		});
	}

	public async getOutputFile(): Promise<string> {
		const proj = await this.getCurrentProject();
		if (!proj) {
			throw new Error(localize('errorNoOutputBinary', 'can not find an executable item'));
		}
		for (const item of proj.targets) {
			if (item.type === CMAKE_TARGET_TYPE.EXECUTABLE) {
				return item.artifacts[0];
			}
		}
		throw new Error(localize('errorNoOutputBinary', 'can not find an executable item'));
	}

	private getCMakeToRun(): { root: string, bins: string, cmake: string } {
		const cmake = this.nodePathService.getPackagesPath('cmake');
		return {
			root: cmake,
			bins: resolvePath(cmake, 'bin'),
			cmake: resolvePath(cmake, 'bin/cmake' + executableExtension),
		};
	}

	private async notifyCppExtension() {
		const cppExtConfigFile = resolvePath(this._currentFolder, '.vscode/c_cpp_properties.json');
		this.logger.info('write config to %s', cppExtConfigFile);
		await mkdirp(resolvePath(this._currentFolder, '.vscode'));

		let content: any = {};
		if (await exists(cppExtConfigFile)) {
			try {
				content = JSON.parse(await readFile(cppExtConfigFile, 'utf-8'));
			} catch (e) {
				this.logger.info('failed to load exists config, will overwrite it.');
				await rename(cppExtConfigFile, cppExtConfigFile + '.invalid.' + (Math.random() * 1000).toFixed(0));
			}
		}
		if (!content.version) {
			content.version = 4;
		}
		if (!content.configurations) {
			content.configurations = [];
		}
		const index = content.configurations.findIndex((e: any) => e.name === 'Default');
		if (index !== -1) {
			content.configurations.splice(content.configurations, 1);
		}

		const configPaths = this.configurationService.getValue<string[]>('C_Cpp.default.includePath') || [];

		content.configurations.unshift({
			name: 'Default',
			defines: [],
			compilerPath: resolvePath(this.nodePathService.getToolchainBinPath(), 'riscv64-unknown-elf-g++'),
			cStandard: 'c11',
			cppStandard: 'c++17',
			intelliSenseMode: 'gcc-x64',
			compileCommands: '${workspaceFolder}/.vscode/compile_commands.backup.json',
			includePath: [...configPaths],
		});

		const from = this.nodePathService.workspaceFilePath('build/compile_commands.json');
		const to = this.nodePathService.workspaceFilePath('.vscode/compile_commands.backup.json');

		await writeFile(to, await readFile(from));

		this.logger.info('write config for cpp extension.');
		await writeFile(cppExtConfigFile, JSON.stringify(content, null, 4), { encoding: { charset: 'utf-8', addBOM: false } });
	}

	private async generateCMakeListsFile() {
		this.logger.info('Generate CMakeLists.txt file:');
		const creator = this.instantiationService.createInstance(CMakeListsCreator, this._currentFolder, this.logger);
		try {
			await creator.prepareConfigure();
		} catch (e) {
			console.error(e);
			throw e;
		}
	}
}
