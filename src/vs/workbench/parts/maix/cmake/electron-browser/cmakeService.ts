import { CMAKE_CHANNEL, CMakeInternalVariants, CurrentItem, ICMakeService } from 'vs/workbench/parts/maix/cmake/common/type';
import { IInstantiationService, ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
import { ILifecycleService, LifecyclePhase } from 'vs/platform/lifecycle/common/lifecycle';
import { ChildProcess, spawn, SpawnOptions } from 'child_process';
import { IWorkspaceContextService, IWorkspaceFolder } from 'vs/platform/workspace/common/workspace';
import { exists, fileExists, mkdirp, readFile, rename, rimraf, writeFile } from 'vs/base/node/pfs';
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
import { CMakeCache } from 'vs/workbench/parts/maix/cmake/node/cmakeCache';
import { isWindows } from 'vs/base/common/platform';
import { LineData, LineProcess } from 'vs/base/node/processes';
import { Executable } from 'vs/base/common/processes';
import { cpus } from 'os';
import { addStatusBarCmakeButtons } from 'vs/workbench/parts/maix/cmake/common/buttons';
import { StatusBarController } from 'vs/workbench/parts/maix/cmake/common/statusBarController';
import { CMAKE_TARGET_TYPE } from 'vs/workbench/parts/maix/cmake/common/cmakeProtocol/config';
import { MaixBuildSystemPrepare, MaixBuildSystemReload } from 'vs/workbench/parts/maix/cmake/electron-browser/maixBuildSystemService';
import { IPackagesUpdateService } from 'vs/workbench/parts/maix/_library/electron-browser/packagesUpdateService';
import { INodePathService } from 'vs/workbench/parts/maix/_library/common/type';
import { executableExtension } from 'vs/workbench/parts/maix/_library/node/versions';
import { resolvePath } from 'vs/workbench/parts/maix/_library/node/resolvePath';
import { DebugScript, getEnvironment } from 'vs/workbench/parts/maix/_library/common/path';
import { CMakeBuildErrorProcessor, CMakeBuildProgressProcessor, CMakeProcessList } from 'vs/workbench/parts/maix/cmake/common/outputProcessor';

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
	private lastProcess: CMakeProcessList;

	constructor(
		@IInstantiationService protected instantiationService: IInstantiationService,
		@IWorkspaceContextService protected workspaceContextService: IWorkspaceContextService,
		@INotificationService protected notificationService: INotificationService,
		@ILifecycleService lifecycleService: ILifecycleService,
		@IOutputService protected outputService: IOutputService,
		@IPackagesUpdateService packagesUpdateService: IPackagesUpdateService,
		@INodePathService private nodePathService: INodePathService,
	) {
		this.outputChannel = outputService.getChannel(CMAKE_CHANNEL);
		// this.installExtension('twxs.cmake');
		lifecycleService.onWillShutdown(e => {
			return e.veto(this.shutdown(true));
		});
		this.localEnv = {};
		this.localEnv.MAIX_IDE = 'yes';

		this.localDefine = [];
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
		this.localEnv.TOOLCHAIN = this.nodePathService.getToolchainBinPath();
		this.localEnv.SDK = this.nodePathService.getSDKPath();
		if (isWindows) {
			this.localEnv.CMAKE_MAKE_PROGRAM = 'mingw32-make.exe';
		}

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

	private async getCMakeEnv() {
		let staticEnvFile = resolvePath(this._currentFolder, '.vscode/cmake-env.json');
		let staticEnv: any = {};
		if (await fileExists(staticEnvFile)) {
			staticEnv = JSON.parse(await readFile(staticEnvFile, 'utf8'));
		} else {
			await writeFile(staticEnvFile, '{}');
		}

		const env: any = getEnvironment(this.nodePathService);

		return {
			...env,
			...staticEnv,
			...this.localEnv,
		};
	}

	private async ensureProcess() {
		if (this.cmakeProcess) {
			return;
		}
		this.outputChannel.clear();
		const cmakePath = this.getCMakeToRun();

		this.log('_currentFolder=%s', this._currentFolder);
		await mkdirp(resolvePath(this._currentFolder, '.vscode'));

		let pipeFile = resolvePath(this._currentFolder, '.vscode/.cmserver-pipe-' + (Date.now()).toFixed(0));
		this.log('pipeFile=%s', pipeFile);

		if (process.platform === 'win32') {
			pipeFile = '\\\\?\\pipe\\' + pipeFile;
		}
		this.cmakePipeFile = pipeFile;

		const args = ['-E', 'server', '--experimental', '--pipe=' + pipeFile];
		const options: SpawnOptions = {
			env: await this.getCMakeEnv(),
			cwd: cmakePath.bins,
		};

		const dbg = new DebugScript(options.cwd, options.env);
		dbg.command(cmakePath.cmake, args);
		dbg.writeBack(this.nodePathService.workspaceFilePath(), 'cmake-server');

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
			this.log('shutdown CMake server...');

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
				this.log(message.message);
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

	public async onFolderChange(force: boolean = false): TPromise<string> {
		const resolver: IWorkspaceFolder = this.workspaceContextService.getWorkspace().folders[0];

		if (!resolver) {
			if (this._currentFolder) { // closing
				await this.findCMakeListFile('');
				this.log('Workspace folder changed, stopping CMake server...');
				await this.shutdown();
			}
			this.statusBarController.setEmptyState(true);
			return this._mainCMakeList;
		}

		const currentDir = this.nodePathService.workspaceFilePath('./');
		this.log('Workspace change to: %s', currentDir);
		if (currentDir !== this._currentFolder || force) {
			if (this._currentFolder) {
				this.log('Workspace folder changed, stopping CMake server...');
				await this.shutdown();
			}

			const isCMakeProject = await this.findCMakeListFile(currentDir);
			this.statusBarController.setEmptyState(false, isCMakeProject);
		}
		return this._mainCMakeList;
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
		return resolvePath(this._currentFolder, 'build');
	}

	private async initBaseConfigWhenHello(hello: ICMakeProtocolHello) {
		const buildFolder = this.buildPath;

		const handshake: ICMakeProtocolHandshake = {
			type: CMAKE_EVENT_TYPE.HANDSHAKE,
			buildDirectory: buildFolder,
			protocolVersion: hello.supportedProtocolVersions[0],
			sourceDirectory: this._buildingSDK ? resolvePath(this._currentFolder, 'cmake') : this._currentFolder,
			generator: isWindows ? 'MinGW Makefiles' : 'Unix Makefiles',
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

	async findCMakeListFile(newCurrent: string) {
		this._currentFolder = newCurrent;
		this.log('Current dir = ' + this._currentFolder);

		this._mainCMakeList = '';
		this._buildingSDK = false;

		if (!newCurrent) {
			return false;
		}
		let listFile = resolvePath(newCurrent, 'CMakeLists.txt');
		if (await exists(listFile)) {
			const content = await readFile(listFile, 'utf8');
			if (content.indexOf('BUILDING_SDK') !== -1) {
				this._buildingSDK = true;
				this._mainCMakeList = resolvePath(newCurrent, 'cmake/CMakeLists.txt');
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
		await this.shutdown();
		this.alreadyConfigured = false;
		this.log('Run Clean');
		const buildFolder = this.buildPath;
		this.log('    the build dir is: %s', buildFolder);

		this.log('deleting files...');
		await rimraf(buildFolder);
		this.log('OK.');
	}

	public async configure(): TPromise<void> {
		if (!this._mainCMakeList) {
			this.log('main cmakelist not exists, not a cmake project: %s', this._currentFolder);
			return;
		}

		const envDefine: string[] = [];
		for (const name of Object.keys(this.localEnv)) {
			const value = this.localEnv[name];
			if (value) {
				envDefine.push(`-D${name}=${value}`);
			} else {
				this.log('  empty key: %s', name);
			}
		}

		const configArgs = ['--no-warn-unused-cli', '-Wno-dev', ...this.localDefine, ...envDefine];
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

		await this.notifyCppExtension();

		this.log('');
		this.log('Configure complete!');
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
		const process = new LineProcess(exe);

		const dbg = new DebugScript(exe.options.cwd, exe.options.env);
		dbg.command(exe.command, exe.args);
		dbg.writeBack(this.nodePathService.workspaceFilePath(), 'cmake-build');

		const ret = await process.start(({ line }: LineData) => {
			this.log(line);
			processors.parseLine(line);
		});

		processors.finalize();

		this.log('');
		if (ret.error) {
			this.log('Build Error:', ret.error);
			throw ret.error;
		}
		if (ret.cmdCode !== 0) {
			this.statusBarController.showMessage('');
			this.log('Build Error: %s exited with code %s.', make, ret.cmdCode);
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
		const cmake = this.nodePathService.getPackagesPath('cmake');
		return {
			root: cmake,
			bins: resolvePath(cmake, 'bin'),
			cmake: resolvePath(cmake, 'bin/cmake' + executableExtension),
		};
	}

	private async notifyCppExtension() {
		const cppExtConfigFile = resolvePath(this._currentFolder, '.vscode/c_cpp_properties.json');
		this.log('write config to %s', cppExtConfigFile);
		await mkdirp(resolvePath(this._currentFolder, '.vscode'));

		let content: any = {};
		if (await exists(cppExtConfigFile)) {
			try {
				content = JSON.parse(await readFile(cppExtConfigFile, 'utf-8'));
			} catch (e) {
				this.log('failed to load exists config, will overwrite it.');
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
		content.configurations.unshift({
			name: 'Default',
			defines: [],
			compilerPath: resolvePath(this.nodePathService.getToolchainBinPath(), 'riscv64-unknown-elf-gcc'),
			cStandard: 'c11',
			cppStandard: 'c++17',
			intelliSenseMode: 'clang-x64',
			compileCommands: '${workspaceFolder}/.vscode/compile_commands.backup.json',
		});

		const from = this.nodePathService.workspaceFilePath('build/compile_commands.json');
		const to = this.nodePathService.workspaceFilePath('.vscode/compile_commands.backup.json');

		await writeFile(to, await readFile(from));

		this.log('write config for cpp extension.');
		await writeFile(cppExtConfigFile, JSON.stringify(content, null, 4), { encoding: { charset: 'utf-8', addBOM: false } });
	}
}
