import { URI } from 'vs/base/common/uri';
import { getChipPackaging } from 'vs/kendryte/vs/workbench/fpioaConfig/common/packagingRegistry';
import { ISaveOptions } from 'vs/workbench/services/textfile/common/textfiles';
import { IFuncPinMap, ISavedJson } from 'vs/kendryte/vs/workbench/fpioaConfig/common/types';
import { IEditorModel } from 'vs/platform/editor/common/editor';
import { Emitter } from 'vs/base/common/event';
import { INodeFileSystemService } from 'vs/kendryte/vs/services/fileSystem/common/type';
import { exists } from 'vs/base/node/pfs';

export class FpioaModel implements IEditorModel {
	private readonly _onDispose = new Emitter<void>();
	public onDispose = this._onDispose.event;

	private content: ISavedJson;
	private dirty: boolean = false;
	private saveOnGoing: Promise<boolean>;

	constructor(
		protected uri: URI,
		@INodeFileSystemService private nodeFileSystemService: INodeFileSystemService,
	) {
		// console.log('---------------- constructor');
	}

	public dispose(): void {
		this._onDispose.fire();
		this._onDispose.dispose();
	}

	getResource() {
		return this.uri;
	}

	save(options: ISaveOptions = {}): Promise<boolean> {
		if (this.saveOnGoing) {
			return this.saveOnGoing;
		}

		this.saveOnGoing = Promise.resolve(void 0).then(() => {
			// console.log(JSON.stringify(this.content));
			return this.nodeFileSystemService.writeFileIfChanged(this.uri.fsPath, JSON.stringify(this.content));
		}).then(() => {
			delete this.saveOnGoing;
			this.dirty = false;
			return true;
		}, (e) => {
			delete this.saveOnGoing;
			throw e;
		});

		return this.saveOnGoing;
	}

	public load() {
		return this._load().catch((e) => {
			console.error(e);
			this.content = {
				funcPinMap: {},
			} as any;
			this.dirty = false;
			return this;
		});
	}

	private async _load(): Promise<this> {
		// console.log('---------------- load', options);
		if (await exists(this.uri.fsPath)) {
			let { json } = await this.nodeFileSystemService.readJsonFile(this.uri.fsPath);

			if (!json) {
				json = {};
			}

			this.content = json;
			this.dirty = false;
		} else {
			this.content = {} as any;
			this.dirty = false;
		}
		if (!this.content.funcPinMap) {
			this.content.funcPinMap = {};
		}
		return this;
	}

	public isResolved(): boolean {
		// console.log('---------------- isResolved', !!this.content);
		return !!this.content;
	}

	get availableChips() {
		return getChipPackaging().map(item => item.name);
	}

	get isChipSelected() {
		return !!this.content.selectedChip;
	}

	get currentFuncMap(): IFuncPinMap {
		return this.content.funcPinMap;
	}

	get currentChip() {
		return this.content.selectedChip;
	}

	isDirty() {
		// console.log('---------------- isDirty', this.dirty);
		return this.dirty;
	}

	setChip(name: string | undefined) {
		if (this.content.selectedChip === name) {
			return false;
		}
		this.dirty = true;
		this.content.selectedChip = name;
		return true;
	}

	getFuncPin(funcId: string) {
		return this.content.funcPinMap[funcId];
	}

	getPinFunc(ioPin: string | undefined) {
		for (const fn of Object.keys(this.content.funcPinMap)) {
			if (ioPin === this.content.funcPinMap[fn]) {
				return fn;
			}
		}
		return undefined;
	}

	unsetFunc(funcId: string) {
		if (this.content.funcPinMap.hasOwnProperty(funcId)) {
			delete this.content.funcPinMap[funcId];
			this.dirty = true;
		}
	}

	setPinFunc(funcId: string, ioPin: string | undefined) {
		console.log('[model] set io[%s] to func[%s]', ioPin, funcId);
		if (this.content.funcPinMap[funcId] === ioPin) {
			return false;
		}
		this.dirty = true;
		if (ioPin) {
			this.content.funcPinMap[funcId] = ioPin;
		} else {
			delete this.content.funcPinMap[funcId];
		}
		return true;
	}

	getPinMap(): Readonly<IFuncPinMap> {
		return this.content.funcPinMap;
	}
}