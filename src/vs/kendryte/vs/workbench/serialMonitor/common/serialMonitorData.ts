import { ISerialMonitorSettings } from 'vs/kendryte/vs/workbench/serialMonitor/common/schema';
import { nullOpenOptions, OpenOptions } from 'vs/kendryte/vs/services/serialPort/common/libraryType';
import { ILocalOptions, nullMonitorOptions, SerialOpenMode } from 'vs/kendryte/vs/workbench/serialMonitor/common/localSettings';
import { SerialPortBaseBinding, SerialPortItem } from 'vs/kendryte/vs/services/serialPort/common/type';

export class SerialMonitorData {
	private _paused: boolean = false;
	private _openMode: SerialOpenMode = SerialOpenMode.raw;
	private _savedInput: string = '';
	private readonly _localOptions: ILocalOptions;
	private readonly _portOptions: OpenOptions;
	public readonly port: SerialPortItem;

	private _selectedMark: boolean = false;
	private _instance: SerialPortBaseBinding;

	constructor(
		public readonly id: string,
	) {
		this.port = { comName: id };
		this._localOptions = nullMonitorOptions();
		this._portOptions = nullOpenOptions();
	}

	public loadOptions(optData: ISerialMonitorSettings) {
		limitedExtend(this._localOptions, optData);
		limitedExtend(this._portOptions, optData);
		// console.log('[serial] loadOptions(%O) -> %O %O', optData, this._localOptions, this._portOptions);
	}

	public dumpOptions(): ISerialMonitorSettings {
		return Object.assign({}, this._localOptions, this._portOptions);
	}

	public updatePort(info: SerialPortItem) {
		console.assert(info.comName === this.id, 'Update port reference error.');
		Object.assign(this.port, info);
	}

	public get paused() {return this._paused;}

	public get savedInput() {return this._savedInput;}

	public get selected() {return this._selectedMark;}

	public get openMode() {return this._openMode;}

	public setSelect(sel: boolean) {
		this._selectedMark = sel;
	}

	public setOpenMode(mod: SerialOpenMode) {
		this._openMode = mod;
	}

	public get hasOpen() {return !!this._instance;}

	public setInstance(port: SerialPortBaseBinding | null) {
		if (port) {
			this._instance = port;
		} else {
			delete this._instance;
			this._paused = false;
			this._savedInput = '';
		}
	}

	public getInstance(): SerialPortBaseBinding {
		if (this._instance) {
			return this._instance;
		} else {
			throw new Error('Port not open: ' + this.id);
		}
	}

	public togglePaused() {
		if (this._instance) {
			this._paused = !this._paused;
			if (this.paused) {
				this._instance.pause();
			} else {
				this._instance.resume();
			}
		} else {
			this._paused = false;
		}
	}

	public getPortConfig(): OpenOptions {
		return filterNulls(this._portOptions);
	}

	public getMonitorConfig(): ILocalOptions {
		return filterNulls(this._localOptions);
	}
}

function filterNulls<T>(obj: T): T {
	for (const k of Object.keys(obj)) {
		if (obj[k] === undefined || obj[k] === null) {
			delete obj[k];
		}
	}
	return obj;
}

function limitedExtend(a: any, b: any) {
	for (const key of Object.keys(a)) {
		if (b.hasOwnProperty(key)) {
			a[key] = b[key];
		}
	}
}
