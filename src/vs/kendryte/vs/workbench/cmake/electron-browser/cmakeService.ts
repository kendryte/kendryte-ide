import {
	CMAKE_CHANNEL,
	CMAKE_CHANNEL_TITLE,
	CMAKE_CHANNEL_URI,
	CMAKE_ERROR_MARKER,
	CMakeInternalVariants,
	CMakeStatus,
	CONTEXT_CMAKE_STATUS,
	CurrentItem,
	ICMakeSelection,
	ICMakeService,
	ICMakeStatus,
} from 'vs/kendryte/vs/workbench/cmake/common/type';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ILifecycleService } from 'vs/platform/lifecycle/common/lifecycle';
import { ChildProcess, spawn } from 'child_process';
import { exists, fileExists, lstat, mkdirp, readFile, rename, rimraf } from 'vs/base/node/pfs';
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
import { LineData, LineProcess } from 'vs/base/node/processes';
import { cpus } from 'os';
import { INodePathService } from 'vs/kendryte/vs/services/path/common/type';
import { resolvePath } from 'vs/kendryte/vs/base/common/resolvePath';
import { DebugScript, getLimitedEnvironment } from 'vs/kendryte/vs/workbench/cmake/node/environmentVars';
import { executableExtension, PathListSep, removeEnvironment } from 'vs/kendryte/vs/base/common/platformEnv';
import { CMakeBuildErrorProcessor, CMakeBuildProgressProcessor, CMakeProcessList } from 'vs/kendryte/vs/workbench/cmake/node/outputProcessor';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { CMAKE_LIST_GENERATED_WARNING, CMAKE_LIST_GENERATED_WARNING_OLD } from 'vs/kendryte/vs/base/common/jsonSchemas/cmakeConfigSchema';
import { IChannelLogService } from 'vs/kendryte/vs/services/channelLogger/common/type';
import { ILogService, LogLevel } from 'vs/platform/log/common/log';
import { INodeFileSystemService } from 'vs/kendryte/vs/services/fileSystem/common/type';
import { CONFIG_KEY_CMAKE_DEBUG, CONFIG_KEY_MAKE_PROGRAM } from 'vs/kendryte/vs/base/common/configKeys';
import { IKendryteStatusControllerService } from 'vs/kendryte/vs/workbench/bottomBar/common/type';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { CMakeError, CMakeErrorType } from 'vs/kendryte/vs/workbench/cmake/common/errors';
import { DeferredPromise } from 'vs/kendryte/vs/base/common/deferredPromise';
import { localize } from 'vs/nls';
import { CMAKE_CONFIG_FILE_NAME, PROJECT_BUILD_FOLDER_NAME } from 'vs/kendryte/vs/base/common/constants/wellknownFiles';
import { IKendryteWorkspaceService } from 'vs/kendryte/vs/services/workspace/common/type';
import { IMakefileService } from 'vs/kendryte/vs/services/makefileService/common/type';
import { IMarkerService, MarkerSeverity } from 'vs/platform/markers/common/markers';
import { URI } from 'vs/base/common/uri';
import { createSimpleErrorMarker, createSimpleMarker } from 'vs/kendryte/vs/platform/marker/common/simple';
import { MapLike } from 'vs/kendryte/vs/base/common/extendMap';

const regCMakeConfigureError = /CMake Error at (.+?):(\d+?) \((.+)\):/;
const regCMakeUnknownError = /^CMake Error:/;

export class CMakeService implements ICMakeService {
	_serviceBrand: any;

	private readonly logger: ILogService;

	protected localEnv: any;
	protected localDefine: string[];

	protected alreadyConfigured: boolean;
	protected selectedTarget?: string;
	protected selectedVariant?: string;
	protected currentProjectName?: string;

	protected cmakeProcess: ChildProcess;
	private cmakeEndPromise: Promise<any>;
	private cmakePipe: NodeJS.ReadWriteStream; // Socket
	private cmakePipeFile: string;

	protected _CMakeProjectExists: boolean;

	private cmakeRequests: { [cookie: string]: DeferredPromise<ICMakeResponse> } = {};

	private readonly _onCMakeEvent = new Emitter<ICMakeProtocol>();
	public readonly onCMakeEvent: Event<ICMakeProtocol> = this._onCMakeEvent.event;
	private cmakeConnectionStablePromise: DeferredPromise<void>;
	private lastProcess: CMakeProcessList;

	private readonly _onCMakeStatusChange = new Emitter<ICMakeStatus>();
	public readonly onCMakeStatusChange = Event.debounce<ICMakeStatus>(this._onCMakeStatusChange.event, (_, l) => l, 1000);

	private readonly _onCMakeSelectionChange = new Emitter<ICMakeSelection>();
	public readonly onCMakeSelectionChange = this._onCMakeSelectionChange.event;

	private verbose: boolean;

	constructor(
		@ILifecycleService lifecycleService: ILifecycleService,
		@IContextKeyService contextKeyService: IContextKeyService,
		@ICommandService commandService: ICommandService,
		@IChannelLogService channelLogService: IChannelLogService,
		@IInstantiationService private readonly instantiationService: IInstantiationService,
		@INotificationService private readonly notificationService: INotificationService,
		@INodePathService private readonly nodePathService: INodePathService,
		@IKendryteWorkspaceService private readonly kendryteWorkspaceService: IKendryteWorkspaceService,
		@INodeFileSystemService private readonly nodeFileSystemService: INodeFileSystemService,
		@IConfigurationService private readonly configurationService: IConfigurationService,
		@IKendryteStatusControllerService private readonly kendryteStatusControllerService: IKendryteStatusControllerService,
		@IMakefileService private readonly makefileService: IMakefileService,
		@IMarkerService private readonly markerService: IMarkerService,
	) {
		this.logger = channelLogService.createChannel(CMAKE_CHANNEL_TITLE, CMAKE_CHANNEL);

		const cmakeStatusContextKey = CONTEXT_CMAKE_STATUS.bindTo(contextKeyService);
		this.onCMakeStatusChange(({ status }) => {
			cmakeStatusContextKey.set(status);
		});

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

		// console.log('cmake service init.');

		this.kendryteWorkspaceService.onCurrentWorkingDirectoryChange(() => {
			this.rescanCurrentFolder().catch();
		});
		this.rescanCurrentFolder().catch();
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
		const currentFolder = this.kendryteWorkspaceService.requireCurrentWorkspace();
		let staticEnvFile = resolvePath(currentFolder, '.vscode/cmake-env.json');
		let staticEnv: any = {};
		if (await fileExists(staticEnvFile)) {
			staticEnv = JSON.parse(await readFile(staticEnvFile, 'utf8'));
		} else {
			await this.nodeFileSystemService.rawWriteFile(staticEnvFile, '{}');
		}
		return staticEnv;
	}

	private async getCMakeEnv(): Promise<MapLike<string>> {
		const staticEnv = await this.getCMakeDef();
		const { env } = getLimitedEnvironment(this.nodePathService, this.configurationService);
		const extraConfigEnv = {
			CMAKE_MAKE_PROGRAM: this.configurationService.getValue<string>(CONFIG_KEY_MAKE_PROGRAM) || 'make',
		};

		this.logger.debug('CMAKE_MAKE_PROGRAM=', extraConfigEnv.CMAKE_MAKE_PROGRAM);

		const extra = removeEnvironment('path', {
			...staticEnv,
			...extraConfigEnv,
			...this.localEnv,
		});

		return {
			...env,
			...extra,
			LANG: 'en_US.utf-8',
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
		await dbg.writeBack(this.kendryteWorkspaceService.requireCurrentWorkspace(), 'last-cmake-command');

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

		const currentFolder = this.kendryteWorkspaceService.requireCurrentWorkspace();
		this.logger.info('currentFolder=%s', currentFolder);
		await mkdirp(resolvePath(currentFolder, '.vscode'));

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
		dbg.writeBack(this.kendryteWorkspaceService.requireCurrentWorkspace(), 'cmake-server');

		this.logger.info('Start new CMake Server: %s %s\nCWD=%s', cmakePath.cmake, args.join(' '), options.cwd);
		this.logger.info('PATH:');
		(options.env.PATH || options.env.Path).split(PathListSep).forEach((p) => {
			this.logger.info('  - ' + p);
		});

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
				if (regCMakeConfigureError.test(message.message)) {
					const [, file, line] = regCMakeConfigureError.exec(message.message)!;
					const lines = message.message.split('\n');
					const markers = lines
						.slice(1)
						.map(s => s.trim())
						.filter(s => s.length > 0);

					const packageFile = URI.file(this.kendryteWorkspaceService.requireCurrentWorkspaceFile(file.replace('CMakeLists.txt', CMAKE_CONFIG_FILE_NAME)));
					const marker = createSimpleMarker(MarkerSeverity.Error, lines[0] + '\n' + markers.join('\n'), parseInt(line) || 0);
					marker.relatedInformation = [
						{
							resource: packageFile,
							message: localize('pleaseConfigureProject', 'Please fix your project settings.'),
							startLineNumber: 0,
							startColumn: 0,
							endLineNumber: 0,
							endColumn: 0,
						},
					];

					this.markerService.changeOne(
						CMAKE_ERROR_MARKER,
						URI.file(this.kendryteWorkspaceService.requireCurrentWorkspaceFile(file)),
						[marker],
					);
				} else if (regCMakeUnknownError.test(message.message)) {
					const msg = message.message.replace(regCMakeUnknownError, '').trim();
					this.markerService.changeOne(
						CMAKE_ERROR_MARKER,
						CMAKE_CHANNEL_URI,
						[createSimpleErrorMarker(msg)],
					);
				}
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

	public rescanCurrentFolder(): Promise<void> {
		const currentFolder = this.kendryteWorkspaceService.getCurrentWorkspace();
		this.logger.info('rescan current folder: ' + currentFolder);

		this._onCMakeStatusChange.fire({ status: CMakeStatus.BUSY });

		return this._rescanCurrentFolder(currentFolder).then(() => {
			this._onCMakeStatusChange.fire({ status: CMakeStatus.IDLE });
		}, (e) => {
			this.logger.info('rescan current folder error!');
			this.logger.error(e.stack);

			this._onCMakeStatusChange.fire({ status: CMakeStatus.PROJECT_ERROR, error: e });
		});
	}

	private async _rescanCurrentFolder(currentFolder: string | void): Promise<void> {
		this.logger.info('Workspace folder changed, stopping CMake server...');
		await this.shutdown();

		this._CMakeProjectExists = false;

		this.logger.info('detecting project in ' + currentFolder);
		if (!currentFolder) {
			throw new CMakeError(CMakeErrorType.NO_WORKSPACE);
		}
		let listSourceFile = resolvePath(currentFolder, CMAKE_CONFIG_FILE_NAME);

		if (!await exists(listSourceFile)) {
			throw new CMakeError(CMakeErrorType.PROJECT_NOT_EXISTS);
		}
		this.logger.info('  ' + CMAKE_CONFIG_FILE_NAME + ' found.');

		let createdListFile = resolvePath(currentFolder, 'CMakeLists.txt');
		if (await exists(createdListFile)) {
			this.logger.info('  CMakeLists.txt found.');
			const content = await readFile(createdListFile, 'utf8');
			if (content.indexOf(CMAKE_LIST_GENERATED_WARNING) === -1 && content.indexOf(CMAKE_LIST_GENERATED_WARNING_OLD) === -1) {
				this.logger.info('    - Error: this file is not created by me, refuse to delete it.');
				throw new CMakeError(CMakeErrorType.PROJECT_INVALID);
			}
			this.logger.info('    - is safe to delete it.');
		}
		this._CMakeProjectExists = true;

		this.currentProjectName = await this.kendryteWorkspaceService.getCurrentProjectName();

		this.setTarget('');
		this.setVariant('');

		this.logger.info('  - CMake project is exists.');
	}

	private get cmakeLists() {
		if (this._CMakeProjectExists) {
			return this.kendryteWorkspaceService.requireCurrentWorkspaceFile('CMakeLists.txt');
		} else {
			const currentFolder = this.kendryteWorkspaceService.getCurrentWorkspace();
			this.logger.error('This is not a cmake project: ' + currentFolder);
			throw new CMakeError(CMakeErrorType.PROJECT_NOT_EXISTS);
		}
	}

	get buildPath() {
		const currentFolder = this.kendryteWorkspaceService.getCurrentWorkspace();
		if (!currentFolder) {
			this.logger.error('You must open a folder to do this.');
			throw new CMakeError(CMakeErrorType.NO_WORKSPACE);
		}
		return resolvePath(currentFolder, PROJECT_BUILD_FOLDER_NAME);
	}

	private async initBaseConfigWhenHello(hello: ICMakeProtocolHello) {
		const currentFolder = this.kendryteWorkspaceService.requireCurrentWorkspace();
		const buildFolder = this.buildPath;

		const handshake: ICMakeProtocolHandshake = {
			type: CMAKE_EVENT_TYPE.HANDSHAKE,
			buildDirectory: buildFolder,
			protocolVersion: hello.supportedProtocolVersions[0],
			sourceDirectory: currentFolder,
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
		this.markerService.changeAll(CMAKE_ERROR_MARKER, []);
		this._onCMakeStatusChange.fire({ status: CMakeStatus.BUSY });
		return this._configure().then(() => {
			this._onCMakeStatusChange.fire({ status: CMakeStatus.IDLE });
		}, (e) => {
			this.markerService.changeOne(CMAKE_ERROR_MARKER, CMAKE_CHANNEL_URI, [
				createSimpleErrorMarker(localize('cmakeErrorSee', 'Can not configure project, see log for more information')),
			]);
			this._onCMakeStatusChange.fire({ status: CMakeStatus.CONFIGURE_ERROR, error: e });
			throw e;
		});
	}

	private async _configure() {
		const currentFolder = this.kendryteWorkspaceService.requireCurrentWorkspace();

		await this.rescanCurrentFolder();

		if (!this._CMakeProjectExists) {
			this.logger.error('refuse to configure.');
			this.logger.error('This is not a cmake project: ' + currentFolder);
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
		this.markerService.changeAll(CMAKE_ERROR_MARKER, []);
		this._onCMakeStatusChange.fire({ status: CMakeStatus.BUSY });
		return this._build().then(() => {
			this._onCMakeStatusChange.fire({ status: CMakeStatus.IDLE });
		}, (e) => {
			this.markerService.changeOne(CMAKE_ERROR_MARKER, CMAKE_CHANNEL_URI, [
				createSimpleErrorMarker(localize('buildErrorSee', 'Can not build project, see log for more information')),
			]);
			this._onCMakeStatusChange.fire({ status: CMakeStatus.MAKE_ERROR, error: e });
			throw e;
		});
	}

	private async _build() {
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
		dbg.writeBack(this.kendryteWorkspaceService.requireCurrentWorkspace(), 'cmake-build');

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

		const outputFile = await this.getOutputFile();
		this.logger.info('File path:', outputFile);
		const stat = await lstat(outputFile);
		this.logger.info('File size:', stat.size);

		if (stat.size < 10) {
			throw new Error('Artifact too small');
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

		if (this.selectedVariant) {
			const selected = vids.indexOf(this.selectedVariant);
			if (variants[selected]) {
				variants[selected].current = true;
			}
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

		return ret;
	}

	private async getCurrentProject() {
		const variant = await this.getCurrentVariant();
		if (!variant) {
			return;
		}

		const target = this.selectedTarget || this.currentProjectName;
		for (const project of variant.projects) {
			if (target === project.name) {
				return project;
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

		const select = this.selectedTarget || this.currentProjectName;
		for (const target of proj.targets) {
			if (target.name === select) {
				if (target.type === 'EXECUTABLE') {
					return target.artifacts[0] + '.bin';
				} else {
					return target.artifacts[0];
				}
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
		const currentFolder = this.kendryteWorkspaceService.requireCurrentWorkspace();
		const cppExtConfigFile = resolvePath(currentFolder, '.vscode/c_cpp_properties.json');
		this.logger.info('write config to %s', cppExtConfigFile);
		await mkdirp(resolvePath(currentFolder, '.vscode'));

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

		const from = this.kendryteWorkspaceService.requireCurrentWorkspaceFile('build/compile_commands.json');

		if (await exists(from)) {
			const to = this.kendryteWorkspaceService.requireCurrentWorkspaceFile('.vscode/compile_commands.backup.json');
			await this.nodeFileSystemService.writeFileIfChanged(to, await readFile(from));
		}

		this.logger.info('write config for cpp extension.');
		await this.nodeFileSystemService.writeFileIfChanged(cppExtConfigFile, JSON.stringify(content, null, 4));
	}

	private async generateCMakeListsFile() {
		const currentFolder = this.kendryteWorkspaceService.requireCurrentWorkspace();
		await this.makefileService.generateMakefile(currentFolder);
	}
}
