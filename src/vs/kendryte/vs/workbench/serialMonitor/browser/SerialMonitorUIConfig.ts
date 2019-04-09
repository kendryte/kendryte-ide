import { allSerialPortDefaults, ISerialMonitorSettings, typedValues } from 'vs/kendryte/vs/workbench/serialMonitor/common/schema';
import { IStorageService, StorageScope } from 'vs/platform/storage/common/storage';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { CONFIG_KEY_DEFAULT_SERIAL_BAUDRATE } from 'vs/kendryte/vs/base/common/configKeys';
import { nullMonitorOptions } from 'vs/kendryte/vs/workbench/serialMonitor/common/localSettings';
import { nullOpenOptions } from 'vs/kendryte/vs/services/serialPort/common/libraryType';

const STORAGE_KEY = 'serial-port-options:';

export class SerialMonitorUIConfig {
	private _settings: ISerialMonitorSettings;
	private readonly _nullOptions: string;
	private readonly defaults: ISerialMonitorSettings;

	constructor(
		@IStorageService private readonly storageService: IStorageService,
		@IConfigurationService configurationService: IConfigurationService,
	) {
		this.defaults = allSerialPortDefaults();
		const configDefaultBaudRate = parseInt(configurationService.getValue<string>(CONFIG_KEY_DEFAULT_SERIAL_BAUDRATE));
		if (configDefaultBaudRate) {
			this.defaults.baudRate = configDefaultBaudRate;
		}
		this._settings = {
			...nullMonitorOptions(),
			...nullOpenOptions(),
		};
		this._nullOptions = JSON.stringify(this._settings);
	}

	save(port: string) {
		// console.log('[serial][save] %s %O', STORAGE_KEY + port, this._settings);
		this.storageService.store(STORAGE_KEY + port, JSON.stringify(this._settings), StorageScope.WORKSPACE);
	}

	load(port: string) {
		const savedData: string = this.storageService.get(STORAGE_KEY + port, StorageScope.WORKSPACE, this._nullOptions);
		try {
			this._settings = JSON.parse(savedData);
		} catch (e) {
			// console.warn('[serial][load] %s failed: %s', STORAGE_KEY + port, savedData);
			this.storageService.remove(STORAGE_KEY + port, StorageScope.WORKSPACE);
			this._settings = JSON.parse(this._nullOptions);
		}
		typedValues(this._settings);
		// console.log('[serial][load] %s %O', STORAGE_KEY + port, this._settings);
	}

	get settings(): ISerialMonitorSettings {
		const ret: ISerialMonitorSettings = {
			...this.defaults,
			...this._settings,
		};
		// console.log('[serial][get] %O', ret);
		return ret;
	}

	get uiSettings(): Readonly<ISerialMonitorSettings> {
		return this._settings;
	}

	public update<K extends keyof ISerialMonitorSettings>(key: K, value: ISerialMonitorSettings[K]) {
		// console.log('[serial][set] %s = %s (%s)', key, value, typeof value);
		this._settings[key] = value;
	}
}
