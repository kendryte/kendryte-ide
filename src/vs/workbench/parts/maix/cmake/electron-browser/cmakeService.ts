import { CMAKE_CHANNEL, CMakeInternalVariants, CurrentItem, ICMakeService } from 'vs/workbench/parts/maix/cmake/common/type';
import { IInstantiationService, ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
import { ILifecycleService, LifecyclePhase } from 'vs/platform/lifecycle/common/lifecycle';
import { ChildProcess, spawn, SpawnOptions } from 'child_process';
import { IWorkspaceContextService, IWorkspaceFolder } from 'vs/platform/workspace/common/workspace';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { exists, fileExists, mkdirp, readFile } from 'vs/base/node/pfs';
import { getSDKPath, getToolchainBinPath } from 'vs/workbench/parts/maix/_library/node/nodePath';
import { IOutputChannel, IOutputService } from 'vs/workbench/parts/output/common/output';
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
} from 'vs/workbench/parts/maix/cmake/common/cmakeProtocol/cmakeProtocol';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { format } from 'util';
import { resolveFrom } from 'vs/workbench/parts/maix/_library/common/resource';
import { unlinkSync } from 'fs';
import { Emitter, Event } from 'vs/base/common/event';
import { ICMakeProtocolError } from 'vs/workbench/parts/maix/cmake/common/cmakeProtocol/error';
import { ICMakeProtocolMessage, ICMakeProtocolProgress, ICMakeProtocolReply } from 'vs/workbench/parts/maix/cmake/common/cmakeProtocol/event';
import { ICMakeProtocolSignal } from 'vs/workbench/parts/maix/cmake/common/cmakeProtocol/singal';
import {
	ICMakeProtocolCodeModel,
	ICMakeProtocolCompute,
	ICMakeProtocolConfigure,
	ICMakeProtocolHandshake,
	ICMakeProtocolHello,
	ICMakeProtocolSetGlobalSettings,
} from 'vs/workbench/parts/maix/cmake/common/cmakeProtocol/message';
import { resolve } from 'path';
import { CMakeCache } from 'vs/workbench/parts/maix/cmake/node/cmakeCache';
import { emptyDir } from 'fs-extra';
import { isWindows } from 'vs/base/common/platform';
import { LineData, LineProcess } from 'vs/base/node/processes';
import { Executable } from 'vs/base/common/processes';
import { cpus } from 'os';
import { addStatusBarCmakeButtons } from 'vs/workbench/parts/maix/cmake/common/buttons';
import { StatusBarController } from 'vs/workbench/parts/maix/cmake/common/statusBarController';
import { CMAKE_TARGET_TYPE } from 'vs/workbench/parts/maix/cmake/common/cmakeProtocol/config';
import { MaixBuildSystemPrepare, MaixBuildSystemReload } from 'vs/workbench/parts/maix/cmake/electron-browser/maixBuildSystemService';
import { IPackagesUpdateService } from 'vs/workbench/parts/maix/_library/node/packagesUpdateService';

export class Deferred extends TPromise<ICMakeResponse, ICMakeProtocolProgress> {
	private _resolver: (value: ICMakeResponse) => void;
	private _rejecter: (value: Error | ICMakeProtocolError) => void;
	private _progresser: (value: ICMakeProtocolProgress) => void;

	constructor() {
		let _resolver, _rejecter, _progresser;
		super((resolve, reject, progress) => {
			_resolver = resolve;
			_rejecter = reject;
			_progresser = progress;
		});
		this._resolver = _resolver;
		this._rejecter = _rejecter;
		this._progresser = _progresser;
	}

	resolve(response: ICMakeResponse): void {
		this._resolver(response);
	}

	reject(err: ICMakeProtocolError | Error): void {
		this._rejecter(err);
	}

	notify(progress: ICMakeProtocolProgress): void {
		this._progresser(progress);
	}

	promise(): TPromise<ICMakeResponse, ICMakeProtocolProgress> {
		return this;
	}
}

export class CMakeService implements ICMakeService {
	_serviceBrand: any;
	protected localEnv: any;
	protected localDefine: string[];
	protected outputChannel: IOutputChannel;

	protected alreadyConfigured: boolean;
	protected selectedTarget: string;
	protected selectedVariant: string;

	protected cmakeProcess: ChildProcess;
	private cmakeEndPromise: TPromise<any>;
	private cmakePipe: Socket;
	private cmakePipeFile: string;

	protected _currentFolder: string;
	protected _mainCMakeList: string;
	protected _buildingSDK: boolean;

	private cmakeRequests: { [cookie: string]: Deferred } = {};

	private readonly _onCMakeEvent = new Emitter<ICMakeProtocol>();
	public readonly onCMakeEvent: Event<ICMakeProtocol> = this._onCMakeEvent.event;
	private cmakeConnectionStablePromise: Deferred;
	private statusBarController: StatusBarController;

	constructor(
		@IInstantiationService protected instantiationService: IInstantiationService,
		@IWorkspaceContextService protected workspaceContextService: IWorkspaceContextService,
		@INotificationService protected notificationService: INotificationService,
		@ILifecycleService lifecycleService: ILifecycleService,
		@IOutputService protected outputService: IOutputService,
		@IPackagesUpdateService packagesUpdateService: IPackagesUpdateService,
	) {
		this.outputChannel = outputService.getChannel(CMAKE_CHANNEL);
		// this.installExtension('twxs.cmake');
		lifecycleService.onWillShutdown(e => {
			return e.veto(this.shutdown(true));
		});
		this.localEnv = {};
		this.localEnv.MAIX_IDE = 'yes';

		this.localDefine = [];
		for (const name of Object.keys(this.localEnv)) {
			this.localDefine.push(`-D${name}=${this.localEnv[name]}`);
		}
		this.localDefine.push(`-DCMAKE_EXPORT_COMPILE_COMMANDS:BOOL=TRUE`);

		lifecycleService.when(LifecyclePhase.Running).then(() => {
			TPromise.join([
				instantiationService.invokeFunction(MaixBuildSystemPrepare),
				packagesUpdateService.run(),
			]).then(() => {
				return instantiationService.invokeFunction(MaixBuildSystemReload);
			}).then(() => {
				return instantiationService.invokeFunction(this.init.bind(this));
			}); // handle error?
		});
	}

	init(access: ServicesAccessor) {
		this.localEnv.TOOLCHAIN = getToolchainBinPath(access.get(IEnvironmentService));
		this.localEnv.SDK = getSDKPath(access.get(IEnvironmentService));

		this.statusBarController = this.instantiationService.invokeFunction(addStatusBarCmakeButtons);

		this.workspaceContextService.onDidChangeWorkspaceFolders(_ => {
			this.onFolderChange().then(undefined, (e) => {
				this.notificationService.error(e);
				console.log(e);
				return this.shutdown();
			});
		});

		this.onFolderChange();
	}

	get readyState() {
		return this.cmakeConnectionStablePromise;
	}

	private async ensureProcess() {
		if (this.cmakeProcess) {
			return;
		}
		this.outputChannel.clear();
		const cmakePath = this.getCMakeToRun();

		await mkdirp(resolve(this._currentFolder, '.vscode'));

		let pipeFile = resolve(this._currentFolder, '.vscode/.cmserver-pipe-' + (Date.now()).toFixed(0));

		if (process.platform === 'win32') {
			pipeFile = '\\\\?\\pipe\\' + pipeFile;
		}
		this.cmakePipeFile = pipeFile;

		let staticEnvFile = resolve(this._currentFolder, '.vscode/cmake-env.json');
		let staticEnv: any = {};
		if (await fileExists(staticEnvFile)) {
			staticEnv = JSON.parse(await readFile(staticEnvFile, 'utf8'));
		}

		const args = ['-E', 'server', '--experimental', '--pipe=' + pipeFile];
		const options: SpawnOptions = {
			env: {
				...process.env,
				...staticEnv,
				...this.localEnv,
			},
			cwd: cmakePath.bins,
		};

		this.log('Start new CMake Server: %s %s\nCWD=%s', cmakePath.cmake, args.join(' '), options.cwd);

		const child = this.cmakeProcess = spawn(cmakePath.cmake, args, options);

		this.log(`Started new CMake Server instance with PID %s`, child.pid);
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
				this.log('CMake server error:\n' + e.stack);
				debugger;
				pipe.end();
				reject(e);
			});
			pipe.on('end', () => {
				pipe.end();
				resolve(undefined);
			});
		});

		this.cmakeEndPromise = TPromise.join([pEnd, pExit]);
		this.cmakeEndPromise.then(() => this.shutdownClean(), () => this.shutdownClean());

		child.on('close', (retc: number, signal: string) => {
			if (retc !== 0) {
				this.log(`CMake terminated with status ${retc} (${signal})`);
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

	private async shutdown(force: boolean = false): TPromise<boolean> {
		if (this.cmakeProcess) {
			if (force) {
				this.cmakeProcess.kill('SIGKILL');
				this.shutdownClean();
			} else {
				this.cmakePipe.end();
				await this.cmakeEndPromise;
			}

			this.log('CMake server shutdown complete...');
		}
		return false;
	}

	private handleOutput(output: string) {
		for (const line of output.split(/\n/g)) {
			this.log('CMake: ' + line);
		}
	}

	private _cmakeLineCache: string[] = [];
	private _cmakeLineState: boolean = false;

	private handleProtocol(line: string) {
		if (line === '[== "CMake Server" ==[' && !this._cmakeLineState) {
			// this.log(`\nProtocol: ${line}`);
			this._cmakeLineState = true;
		} else if (line === ']== "CMake Server" ==]' && this._cmakeLineState) {
			// this.log(`Protocol: ${line}\n`);
			this._cmakeLineState = false;
			const msg = this._cmakeLineCache.join('\n').trim();
			this._cmakeLineCache.length = 0;
			this.handleProtocolInput(msg);
		} else if (this._cmakeLineState) {
			// this.log(`Protocol: ${line}`);
			this._cmakeLineCache.push(line);
		} else if (line) {
			this.log('Protocol: ??? ' + line);
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
					dfd.resolve(protocolData as ICMakeProtocolReply);
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
					this.cmakeConnectionStablePromise.resolve(void 0);
				}, (e) => {
					this.cmakeConnectionStablePromise.reject(e);
				});
				return;
			case CMAKE_EVENT_TYPE.MESSAGE:
				const message = protocolData as ICMakeProtocolMessage;
				this.log(message.message);
				return;
			case CMAKE_EVENT_TYPE.SIGNAL:
				switch ((protocolData as ICMakeProtocolSignal).name) {
					case CMAKE_SIGNAL_TYPE.DIRTY:
						console.log('dirty event: %O', protocolData);
						this.alreadyConfigured = false;
						return;
					case CMAKE_SIGNAL_TYPE.FILECHANGE:
						console.log('change event: %O', protocolData);
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

	public async onFolderChange(force: boolean = false): TPromise<void> {
		const resolver: IWorkspaceFolder = this.workspaceContextService.getWorkspace().folders[0];

		if (!resolver) {
			if (this._currentFolder) { // closing
				await this.findCMakeListFile('');
				this.log('Workspace folder changed, stopping CMake server...');
				await this.shutdown();
			}
			this.statusBarController.setEmptyState(true);
			return;
		}

		const currentDir = resolveFrom(resolver, './');
		this.log('Workspace change to: %s', currentDir);
		if (currentDir !== this._currentFolder || force) {
			if (this._currentFolder) {
				this.log('Workspace folder changed, stopping CMake server...');
				await this.shutdown();
			}

			const isCMakeProject = await this.findCMakeListFile(currentDir);
			this.statusBarController.setEmptyState(false, isCMakeProject);
		}
	}

	private log(message: string, ...args: any[]) {
		if (arguments.length === 1) {
			this.outputChannel.append(message);
		} else {
			this.outputChannel.append(format(message, ...args));
		}
		this.outputChannel.append('\n');
	}

	get buildPath() {
		return resolve(this._currentFolder, 'build');
	}

	private async initBaseConfigWhenHello(hello: ICMakeProtocolHello) {
		const buildFolder = this.buildPath;

		const handshake: ICMakeProtocolHandshake = {
			type: CMAKE_EVENT_TYPE.HANDSHAKE,
			buildDirectory: buildFolder,
			protocolVersion: hello.supportedProtocolVersions[0],
			sourceDirectory: this._buildingSDK ? resolve(this._currentFolder, 'cmake') : this._currentFolder,
			generator: isWindows ? 'MinGW Makefiles' : 'Unix Makefiles',
		};

		const tmpCache = await CMakeCache.fromPath(resolve(buildFolder, 'CMakeCache.txt'));
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

	async findCMakeListFile(newCurrent: string) {
		this._currentFolder = newCurrent;
		this.log('Current dir = ' + this._currentFolder);

		this._mainCMakeList = '';
		this._buildingSDK = false;

		if (!newCurrent) {
			return false;
		}
		let listFile = resolve(newCurrent, 'CMakeLists.txt');
		if (await exists(listFile)) {
			const content = await readFile(listFile, 'utf8');
			if (content.indexOf('BUILDING_SDK') !== -1) {
				this._buildingSDK = true;
				this._mainCMakeList = resolve(newCurrent, 'cmake/CMakeLists.txt');
			} else {
				this._mainCMakeList = listFile;
			}
			this.log('main cmake file is: %s', this._mainCMakeList);
			return true;
		} else {
			this._mainCMakeList = '';
			return false;
		}
	}

	public async cleanupMake(): TPromise<void> {
		this.alreadyConfigured = false;
		this.log('Run Clean');
		const buildFolder = this.buildPath;
		this.log('    the build dir is: %s', buildFolder);

		this.log('deleting files...');
		await emptyDir(buildFolder);
		this.log('OK.');
	}

	public async configure(): TPromise<void> {
		if (!this._mainCMakeList) {
			this.log('main cmakelist not exists, not a cmake project: %s', this._currentFolder);
			return;
		}

		const configArgs = ['--no-warn-unused-cli', '-Wno-dev', ...this.localDefine];
		if (this.selectedVariant) {
			configArgs.push(`-DCMAKE_BUILD_TYPE:STRING=${this.selectedVariant}`);
		}
		this.log('configuring project: %s', this._mainCMakeList);
		await this.sendRequest({
			type: CMAKE_EVENT_TYPE.CONFIGURE,
			cacheArguments: configArgs,
		} as ICMakeProtocolConfigure);
		await this.sendRequest({
			type: CMAKE_EVENT_TYPE.COMPUTE,
		} as ICMakeProtocolCompute);

		this.alreadyConfigured = true;
	}

	public async build(): TPromise<void> {
		if (!this._mainCMakeList) {
			this.log('main cmakelist not exists, not a cmake project: %s', this._currentFolder);
			return;
		}

		await this.ensureConfiguration();

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

		this.log(make, ...args);

		const process = new LineProcess({
			command: make,
			isShellCommand: false,
			args,
			options: { cwd: buildPath },
		} as Executable);

		const ret = await process.start((e: LineData) => {
			this.log(e.line);
		});

		this.log('');
		if (ret.error) {
			this.log('Build Error:', ret.error);
			throw ret.error;
		}
		if (ret.cmdCode !== 0) {
			this.log('Build Error: %s exited with code %s.', make, ret.cmdCode);
			throw new Error('make failed with code ' + ret.cmdCode);
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
		return variant.projects[0];
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
		throw new Error('getCmakeToRun');
	}
}
