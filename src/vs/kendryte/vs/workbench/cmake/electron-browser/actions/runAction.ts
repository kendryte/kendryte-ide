import { Action } from 'vs/base/common/actions';
import {
	ACTION_ID_MAIX_CMAKE_BUILD,
	ACTION_ID_MAIX_CMAKE_BUILD_RUN,
	ACTION_ID_MAIX_CMAKE_RUN,
	ACTION_LABEL_MAIX_CMAKE_BUILD_RUN,
	ACTION_LABEL_MAIX_CMAKE_RUN,
} from 'vs/kendryte/vs/base/common/menu/cmake';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { createActionInstance } from 'vs/kendryte/vs/workbench/actionRegistry/common/registerAction';
import { IOpenOCDService } from 'vs/kendryte/vs/services/openocd/common/openOCDService';
import { IDebugService } from 'vs/workbench/contrib/debug/common/debug';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { ICMakeService } from 'vs/kendryte/vs/workbench/cmake/common/type';
import { resolvePath } from 'vs/kendryte/vs/base/common/resolvePath';
import { executableExtension } from 'vs/kendryte/vs/base/common/platformEnv';
import { INodePathService } from 'vs/kendryte/vs/services/path/common/type';
import { getLimitedEnvironment } from 'vs/kendryte/vs/workbench/cmake/node/environmentVars';
import { ILogService, LogLevel } from 'vs/platform/log/common/log';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';

export class MaixCMakeRunAction extends Action {
	public static readonly ID = ACTION_ID_MAIX_CMAKE_RUN;
	public static readonly LABEL = ACTION_LABEL_MAIX_CMAKE_RUN;
	private readonly logLevel: LogLevel;

	constructor(
		id = MaixCMakeRunAction.ID, label = MaixCMakeRunAction.LABEL,
		@IOpenOCDService private openOCDService: IOpenOCDService,
		@IDebugService private debugService: IDebugService,
		@ICommandService private commandService: ICommandService,
		@ICMakeService private cMakeService: ICMakeService,
		@INodePathService private nodePathService: INodePathService,
		@IConfigurationService private readonly configurationService: IConfigurationService,
		@ILogService logService: ILogService,
	) {
		super(id, label);
		this.logLevel = logService.getLevel();
	}

	async run() {
		await this.cMakeService.ensureConfiguration();

		await this.debugService.stopSession(undefined);
		await this.openOCDService.start();

		const port = this.openOCDService.getCurrentPort();
		if (!port) {
			throw new Error('OpenOCD service not able to start.');
		}

		const app = resolvePath(await this.cMakeService.getOutputFile()).replace(/\.bin$/, '');
		const gdb = resolvePath(this.nodePathService.getToolchainBinPath(), 'riscv64-unknown-elf-gdb' + executableExtension);
		return this.commandService.executeCommand('kendryte-debug.runWithoutDebug', {
			app,
			gdb,
			env: getLimitedEnvironment(this.nodePathService, this.configurationService).env,
			port,
			logLevel: this.logLevel,
		});
	}
}

export class MaixCMakeBuildRunAction extends Action {
	public static readonly ID = ACTION_ID_MAIX_CMAKE_BUILD_RUN;
	public static readonly LABEL = ACTION_LABEL_MAIX_CMAKE_BUILD_RUN;

	constructor(
		id = MaixCMakeBuildRunAction.ID, label = MaixCMakeBuildRunAction.LABEL,
		@IInstantiationService private readonly instantiationService: IInstantiationService,
	) {
		super(id, label);
	}

	run() {
		return this._run().catch((e) => {
			if (!e) {
				throw new Error('Unknown error, see log.');
			}
		});
	}

	async _run() {
		await createActionInstance(this.instantiationService, ACTION_ID_MAIX_CMAKE_BUILD).run(false);
		await createActionInstance(this.instantiationService, ACTION_ID_MAIX_CMAKE_RUN).run();
	}
}
