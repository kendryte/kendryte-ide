import { CMAKE_CHANNEL, CMAKE_CHANNEL_TITLE, CMakeInternalVariants, CurrentItem, ICMakeService } from 'vs/kendryte/vs/workbench/cmake/common/type';
import { IInstantiationService, ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
import { ILifecycleService } from 'vs/platform/lifecycle/common/lifecycle';
import { ChildProcess, spawn, SpawnOptions } from 'child_process';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { exists, fileExists, mkdirp, readFile, rename, rimraf, writeFile } from 'vs/base/node/pfs';
import { createConnection, Socket } from 'net';
import { TPromise } from 'vs/base/common/winjs.base';
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
import { Executable } from 'vs/base/common/processes';
import { cpus } from 'os';
import { addStatusBarCmakeButtons } from 'vs/kendryte/vs/workbench/cmake/common/buttons';
import { StatusBarController } from 'vs/kendryte/vs/workbench/cmake/common/statusBarController';
import { CMAKE_TARGET_TYPE } from 'vs/kendryte/vs/workbench/cmake/common/cmakeProtocol/config';
import { INodePathService } from 'vs/kendryte/vs/services/path/common/type';
import { osTempDir, resolvePath } from 'vs/kendryte/vs/base/node/resolvePath';
import { DebugScript, getEnvironment } from 'vs/kendryte/vs/workbench/cmake/node/environmentVars';
import { executableExtension } from 'vs/kendryte/vs/base/common/platformEnv';
import { CMakeBuildErrorProcessor, CMakeBuildProgressProcessor, CMakeProcessList } from 'vs/kendryte/vs/workbench/cmake/node/outputProcessor';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { CMAKE_CONFIG_FILE_NAME, CMAKE_LIST_GENERATED_WARNING } from 'vs/kendryte/vs/base/common/jsonSchemas/cmakeConfigSchema';
import { IChannelLogService } from 'vs/kendryte/vs/services/channelLogger/common/type';
import { ILogService } from 'vs/platform/log/common/log';
import { INodeFileSystemService } from 'vs/kendryte/vs/services/fileSystem/common/type';
import { CMakeListsCreator } from 'vs/kendryte/vs/workbench/cmake/electron-browser/listsCreator';
import { CONFIG_KEY_MAKE_PROGRAM } from 'vs/kendryte/vs/base/common/configKeys';

export interface IPromiseProgress<T> {
	progress(fn: (p: T) => void): void;
}

export class Deferred extends TPromise<ICMakeResponse> implements IPromiseProgress<ICMakeProtocolProgress> {
	private _resolver: (value: ICMakeResponse) => void;
	private _rejecter: (value: Error | ICMakeProtocolError) => void;
	private cbList: Function[];

	constructor() {
		let _resolver, _rejecter;
		super((resolve, reject) => {
			_resolver = resolve;
			_rejecter = reject;
		});
		this._resolver = _resolver;
		this._rejecter = _rejecter;
		this.cbList = [];
	}

	resolvePath(response: ICMakeResponse): void {
		this._resolver(response);
	}

	reject(err: ICMakeProtocolError | Error): void {
		this._rejecter(err);
	}

	notify(progress: ICMakeProtocolProgress): void {
		for (const cb of this.cbList) {
			cb(progress);
		}
	}

	progress(cb: (e: ICMakeProtocolProgress) => void): void {
		this.cbList.push(cb);
	}

	promise(): TPromise<ICMakeResponse> & IPromiseProgress<ICMakeProtocolProgress> {
		return this;
	}
}

export class CMakeService implements ICMakeService {
	_serviceBrand: any;

	private readonly logger: ILogService;

	protected localEnv: any;
	protected localDefine: string[];

	protected alreadyConfigured: boolean;
	protected selectedTarget: string;
	protected selectedVariant: string;

	protected cmakeProcess: ChildProcess;
	private cmakeEndPromise: TPromise<any>;
	private cmakePipe: Socket;
	private cmakePipeFile: string;

	protected _currentFolder: string;
	protected _CMakeProjectExists: boolean;

	private cmakeRequests: { [cookie: string]: Deferred } = {};

	private readonly _onCMakeEvent = new Emitter<ICMakeProtocol>();
	public readonly onCMakeEvent: Event<ICMakeProtocol> = this._onCMakeEvent.event;
	private cmakeConnectionStablePromise: Deferred;
	private statusBarController: StatusBarController;
	private lastProcess: CMakeProcessList;

	constructor(
		@ILifecycleService lifecycleService: ILifecycleService,
		@IChannelLogService private readonly channelLogService: IChannelLogService,
		@ICommandService commandService: ICommandService,
		@IInstantiationService private readonly instantiationService: IInstantiationService,
		@IWorkspaceContextService private readonly workspaceContextService: IWorkspaceContextService,
		@INotificationService private readonly notificationService: INotificationService,
		@INodePathService private readonly nodePathService: INodePathService,
		@INodeFileSystemService private readonly nodeFileSystemService: INodeFileSystemService,
		@IConfigurationService private readonly configurationService: IConfigurationService,
	) {
		this.logger = channelLogService.createChannel(CMAKE_CHANNEL_TITLE, CMAKE_CHANNEL);

		// this.installExtension('twxs.cmake');
		lifecycleService.onWillShutdown(e => {
			return e.join(this.shutdown(true));
		});
		this.localEnv = {};
		this.localEnv.KENDRYTE_IDE = 'yes';

		this.localDefine = [];
		this.localDefine.push(`-DCMAKE_EXPORT_COMPILE_COMMANDS:BOOL=TRUE`);

		instantiationService.invokeFunction(this.init.bind(this));
	}

	init(access: ServicesAccessor) {
		console.log('cmake service init.');
		if (isWindows) {
			this.localEnv.CMAKE_MAKE_PROGRAM = 'mingw32-make.exe';
		} else {
			this.localEnv.CMAKE_MAKE_PROGRAM = this.configurationService.getValue<string>(CONFIG_KEY_MAKE_PROGRAM) || '/usr/bin/make';
		}

		this.statusBarController = this.instantiationService.invokeFunction(addStatusBarCmakeButtons);

		this.workspaceContextService.onDidChangeWorkspaceFolders(_ => {
			this.rescanCurrentFolder().then(undefined, (e) => {
				this.notificationService.error(e);
				console.log(e);
				return this.shutdown();
			});
		});

		this.rescanCurrentFolder();
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

		const options: SpawnOptions = {
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
					reject(new Error('CMake command failed with ' + (signal || code)));
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

		let pipeFile: string;

		if (process.platform === 'win32') {
			pipeFile = '\\\\?\\pipe\\kendryte-ide-cmakeserver-' + (Date.now()).toFixed(0);
		} else {
			pipeFile = osTempDir('cmake-server-pipe-' + (Date.now()).toFixed(0));
		}
		this.logger.info('pipeFile=%s', pipeFile);
		this.cmakePipeFile = pipeFile;

		const args = ['-E', 'server', '--experimental', '--pipe=' + pipeFile];
		const options: SpawnOptions = {
			env: await this.getCMakeEnv(),
			cwd: cmakePath.bins,
		};

		const dbg = new DebugScript(options.cwd, options.env);
		dbg.command(cmakePath.cmake, args);
		dbg.writeBack(this.nodePathService.workspaceFilePath(), 'cmake-server');

		this.logger.info('Start new CMake Server: %s %s\nCWD=%s', cmakePath.cmake, args.join(' '), options.cwd);

		const child = this.cmakeProcess = spawn(cmakePath.cmake, args, options);

		this.logger.info(`Started new CMake Server instance with PID %s`, child.pid);
		child.stdout.on('data', data => this.handleOutput(data.toString()));
		child.stderr.on('data', data => this.handleOutput(data.toString()));

		await new TPromise((resolve) => {
			setTimeout(resolve, 1000);
		});

		console.log('CMake connect: %s', pipeFile);
		try {
			this.cmakePipe = createConnection(pipeFile);
		} catch (e) {
			await this.shutdown(true);
			throw e;
		}
		const pipe = this.cmakePipe;

		const pExit = new TPromise<void>(resolve => {
			child.on('exit', resolve);
		});

		this.cmakeConnectionStablePromise = new Deferred();
		pipe.pipe(split2()).on('data', (line: Buffer) => {
			this.handleProtocol(line.toString('utf8'));
		});

		const pEnd = new TPromise<void>((resolve, reject) => {
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

		this.cmakeEndPromise = TPromise.join([pEnd, pExit]);
		this.cmakeEndPromise.then(() => this.shutdownClean(), () => this.shutdownClean());

		child.on('close', (retc: number, signal: string) => {
			if (retc !== 0) {
				this.logger.info(`CMake terminated with status ${retc} (${signal})`);
			}
		});

		await this.cmakeConnectionStablePromise;
	}

	private shutdownClean() {
		this.alreadyConfigured = false;
		this.selectedTarget = '';
		this.selectedVariant = '';
		this.cmakeProcess = null;
		this.cmakeEndPromise = null;
		this.cmakePipe = null;
		this.cmakeConnectionStablePromise.reject(new Error('exit too earlly'));
		this.cmakeConnectionStablePromise = null;
		try {
			unlinkSync(this.cmakePipeFile);
		} catch (e) {
		}
	}

	private async shutdown(force: boolean = false): TPromise<void> {
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
			this.handleProtocolInput(msg);
		} else if (this._cmakeLineState) {
			// this.logger.info(`Protocol: ${line}`);
			this._cmakeLineCache.push(line);
		} else if (line) {
			this.logger.info('Protocol: ??? ' + line);
		}
	}

	private handleProtocolInput(msg: string) {
		const protocolData: ICMakeProtocol & ICMakeProtocolAny = JSON.parse(msg);
		this._onCMakeEvent.fire(protocolData);
		// console.log('cmake <<< %O', protocolData);

		if (protocolData.cookie) {
			const dfd = this.cmakeRequests[protocolData.cookie];
			if (!dfd) {
				console.error('cannot handle.');
			}
			switch (protocolData.type) {
				case CMAKE_EVENT_TYPE.REPLY:
					dfd.resolvePath(protocolData as ICMakeProtocolReply);
					return;
				case CMAKE_EVENT_TYPE.ERROR:
					const err = protocolData as ICMakeProtocolError;
					dfd.reject({ ...err, message: err.errorMessage } as any);
					return;
				case CMAKE_EVENT_TYPE.PROGRESS:
					dfd.notify(protocolData as ICMakeProtocolProgress);
					return;
			}
		}

		switch (protocolData.type) {
			case CMAKE_EVENT_TYPE.HELLO:
				this.initBaseConfigWhenHello(protocolData as ICMakeProtocolHello).then(() => {
					this.cmakeConnectionStablePromise.resolvePath(void 0);
				}, (e) => {
					this.cmakeConnectionStablePromise.reject(e);
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

		this.cmakeRequests[payload.cookie] = new Deferred();

		// console.log('cmake >>> %O', payload);
		this.cmakePipe.write(`
[== "CMake Server" ==[
${JSON.stringify(payload)}
]== "CMake Server" ==]
`);

		return await this.cmakeRequests[payload.cookie].promise();
	}

	get isEnabled(): boolean {
		return !!(this._currentFolder && this._CMakeProjectExists);
	}

	public rescanCurrentFolder(): TPromise<void> {
		this.logger.info('rescan current folder');
		this.statusBarController.setWorking();
		const p = this._rescanCurrentFolder();
		p.catch((e) => {
			this.logger.info('rescan current folder error!');
			this.logger.error(e.stack);
			this.channelLogService.show(CMAKE_CHANNEL);
			this.statusBarController.setError();
		});
		return p;
	}

	public async _rescanCurrentFolder(): Promise<void> {
		const currentDir = this.nodePathService.workspaceFilePath('./');

		this.logger.info('Workspace folder changed, stopping CMake server...');
		await this.shutdown();

		this.logger.info('Workspace change to: %s', currentDir);
		this._currentFolder = currentDir;
		// this.localEnv.INSTALL_PREFIX = resolvePath(currentDir, 'build/install');
		await this.detectCMakeProject();

		if (currentDir) {
			this.statusBarController.setEmptyState(false, this._CMakeProjectExists);
		} else {
			this.statusBarController.setEmptyState(true);
		}
	}

	private get cmakeLists() {
		if (this._CMakeProjectExists) {
			return resolvePath(this._currentFolder, 'CMakeLists.txt');
		} else {
			this.logger.error('This is not a cmake project: ' + this._currentFolder);
			throw new Error('cmake project is required');
		}
	}

	get buildPath() {
		if (!this._currentFolder) {
			this.logger.error('You must open a folder to do this.');
			throw new Error('You must open a folder to do this.');
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

	private async detectCMakeProject(): Promise<void> {
		this.logger.info('detecting project in ' + this._currentFolder);

		if (!this._currentFolder) {
			this.logger.info('  - no current dir.');
			this._CMakeProjectExists = false;
			return;
		}
		let listSourceFile = resolvePath(this._currentFolder, CMAKE_CONFIG_FILE_NAME);

		if (!await exists(listSourceFile)) {
			this.logger.info('  ' + CMAKE_CONFIG_FILE_NAME + ' not found.');
			this.logger.info('  - CMake project is NOT exists.');
			this._CMakeProjectExists = false;
			return;
		}
		this.logger.info('  ' + CMAKE_CONFIG_FILE_NAME + ' found.');

		let createdListFile = resolvePath(this._currentFolder, 'CMakeLists.txt');
		if (await exists(createdListFile)) {
			this.logger.info('  CMakeLists.txt found.');
			const content = await readFile(createdListFile, 'utf8');
			if (content.indexOf(CMAKE_LIST_GENERATED_WARNING) === -1) {
				this.logger.info('    - Error: this file is not created by me, refuse to delete it.');
				throw new Error('CMakeLists.txt will overwrite, please remove it.');
			}
			this.logger.info('    - is safe to delete it.');
		}
		this._CMakeProjectExists = true;

		await this.generateCMakeListsFile();
		this.logger.info('  - CMake project is exists.');
	}

	public async cleanupMake(): TPromise<void> {
		await this.shutdown();
		this.alreadyConfigured = false;
		this.logger.info('Run Clean');
		const buildFolder = this.buildPath;
		this.logger.info('    the build dir is: %s', buildFolder);

		this.logger.info('deleting files...');
		await rimraf(buildFolder);
		this.logger.info('OK.');
	}

	public async configure(): TPromise<void> {
		if (!this._CMakeProjectExists) {
			this.logger.error('refuse to configure.');
			this.logger.error('This is not a cmake project: ' + this._currentFolder);
			return TPromise.wrapError(new Error('This is not a cmake project: ' + this._currentFolder));
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

	public async build(): TPromise<void> {
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
			new CMakeBuildProgressProcessor(this.statusBarController),
			this.instantiationService.createInstance(CMakeBuildErrorProcessor),
		]);

		const exe: Executable = {
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
			this.statusBarController.showMessage('');
			this.logger.info('Build Error: %s exited with code %s.', make, ret.cmdCode);
			throw new Error('make failed with code ' + ret.cmdCode);
		} else {
			processors.dispose();
			delete this.lastProcess;
		}
	}

	async ensureConfiguration(): TPromise<ICMakeProtocolCodeModel> {
		if (!this.alreadyConfigured) {
			await this.configure();
		}
		return await this.sendRequest({ type: CMAKE_EVENT_TYPE.CODEMODEL }) as ICMakeProtocolCodeModel;
	}

	setVariant(variant: string) {
		this.alreadyConfigured = false;
		this.selectedVariant = variant;
		this.statusBarController.setSelectedVariant(variant);
	}

	setTarget(target: string) {
		this.selectedTarget = target;
		this.statusBarController.setSelectedTargetTitle(target);
	}

	async getVariantList(): TPromise<CurrentItem[]> {
		const variants = CMakeInternalVariants();
		const vids = variants.map(e => e.id);

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

	async getTargetList(): TPromise<CurrentItem[]> {
		let ret: CurrentItem[] = [
			{
				id: '',
				label: '<default>',
				description: 'Build the default target',
			},
		];

		const variant = await this.getCurrentVariant();

		if (!variant) {
			const e = new Error('No build variant named: ' + this.selectedVariant);
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

	public async getOutputFile(): TPromise<string> {
		const proj = await this.getCurrentProject();
		for (const item of proj.targets) {
			if (item.type === CMAKE_TARGET_TYPE.EXECUTABLE) {
				return item.artifacts[0];
			}
		}
		throw new Error('Error: can not find an executable item, please select one.');
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
		const index = content.configurations.findIndex(e => e.name === 'Default');
		if (index !== -1) {
			content.configurations.splice(content.configurations, 1);
		}

		const configPaths = this.configurationService.getValue<string[]>('C_Cpp.default.includePath');

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
