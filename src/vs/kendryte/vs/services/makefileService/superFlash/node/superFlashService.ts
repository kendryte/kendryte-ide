import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { IBeforeBuildEvent } from 'vs/kendryte/vs/services/makefileService/common/type';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { CONFIG_KEY_SUPER_FLASH_ENABLE } from 'vs/kendryte/vs/services/makefileService/superFlash/common/type';
import { CMAKE_CHANNEL, CMAKE_CHANNEL_TITLE } from 'vs/kendryte/vs/workbench/cmake/common/type';
import { IChannelLogService } from 'vs/kendryte/vs/services/channelLogger/common/type';
import { ILogService } from 'vs/platform/log/common/log';
import { CONFIG_KEY_FLASH_SERIAL_BAUDRATE } from 'vs/kendryte/vs/base/common/configKeys';
import { CHIP_BAUDRATE } from 'vs/kendryte/vs/platform/serialPort/flasher/common/chipDefine';
import { PROJECT_CONFI_HEADER_FOLDER_NAME, PROJECT_CONFIG_FOLDER_NAME } from 'vs/kendryte/vs/base/common/constants/wellknownFiles';
import { resolvePath } from 'vs/kendryte/vs/base/common/resolvePath';
import { INodePathService } from 'vs/kendryte/vs/services/path/common/type';
import { INodeFileSystemService } from 'vs/kendryte/vs/services/fileSystem/common/type';
import { rimraf } from 'vs/base/node/pfs';
import { dirname } from 'vs/base/common/path';

export interface ISuperFlashService {
	_serviceBrand: any;
	handlePrecompileEvent(event: IBeforeBuildEvent): Promise<void>;
}

export const ISuperFlashService = createDecorator<ISuperFlashService>('superFlashService');

const SUPER_FLASH_HEADER_FILE = 'super-flash.h';
const SUPER_FLASH_CODE_FILE = 'super-flash.c';

class SuperFlashService implements ISuperFlashService {
	_serviceBrand: any;
	private readonly ccLog: ILogService;

	constructor(
		@IChannelLogService channelLogService: IChannelLogService,
		@IConfigurationService private readonly configurationService: IConfigurationService,
		@INodeFileSystemService private readonly nodeFileSystemService: INodeFileSystemService,
		@INodePathService private readonly nodePathService: INodePathService,
	) {
		this.ccLog = channelLogService.createChannel(CMAKE_CHANNEL_TITLE, CMAKE_CHANNEL);
	}

	async handlePrecompileEvent(event: IBeforeBuildEvent): Promise<void> {
		const mainProject = event.projects[0];

		const header = resolvePath(mainProject.path, PROJECT_CONFI_HEADER_FOLDER_NAME, SUPER_FLASH_HEADER_FILE);
		const code = resolvePath(mainProject.path, PROJECT_CONFIG_FOLDER_NAME, SUPER_FLASH_CODE_FILE);
		const driver = resolvePath(mainProject.path, PROJECT_CONFIG_FOLDER_NAME, 'drivers');

		event.registerGlobalIgnore([SUPER_FLASH_CODE_FILE, 'drivers']);

		if (this.configurationService.getValue<boolean>(CONFIG_KEY_SUPER_FLASH_ENABLE)) {
			this.ccLog.info('[Super Flash] Enabled.');

			event.registerGlobalConstructor('super_flash_main', SUPER_FLASH_HEADER_FILE, true);
			event.registerGlobalExtraSource([SUPER_FLASH_CODE_FILE]);

			event.waitUntil(this.writeProgram(header, code, driver));
		} else {
			event.waitUntil((async () => {
				await this.nodeFileSystemService.deleteFileIfExists(header);
				await this.nodeFileSystemService.deleteFileIfExists(code);
				await rimraf(driver);
			})());
			this.ccLog.info('[Super Flash] Disabled.');
			return;
		}
	}

	private async writeProgram(headerFile: string, codeFile: string, driver: string) {
		const br = this.configurationService.getValue<number>(CONFIG_KEY_FLASH_SERIAL_BAUDRATE) || CHIP_BAUDRATE;
		const headerSource = this.nodePathService.getPackagesPath('isp/super-flash.h');
		const headerContent = await this.nodeFileSystemService.readFile(headerSource);
		await this.nodeFileSystemService.writeFileIfChanged(
			headerFile,
			headerContent.replace('__FLASH_BAUDRATE__', br.toString()),
		);

		const codeSource = this.nodePathService.getPackagesPath('isp/super-flash.c');
		const codeContent = await this.nodeFileSystemService.readFile(codeSource);
		await this.nodeFileSystemService.writeFileIfChanged(
			codeFile,
			codeContent,
		);

		await this.nodeFileSystemService.copyWithin(
			this.nodePathService.getPackagesPath('isp/includes'),
			dirname(headerFile),
		);

		await this.nodeFileSystemService.copyWithin(
			this.nodePathService.getPackagesPath('isp/drivers'),
			driver,
		);
	}
}

registerSingleton(ISuperFlashService, SuperFlashService);
