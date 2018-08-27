import URI from 'vs/base/common/uri';
import { TPromise } from 'vs/base/common/winjs.base';
import { FileOperationResult, IContent, IFileService, IFileStat } from 'vs/platform/files/common/files';
import { getChipPackaging } from 'vs/workbench/parts/maix/fpioa-config/common/packagingRegistry';
import { ILoadOptions, ISaveOptions } from 'vs/workbench/services/textfile/common/textfiles';
import { EditorModel } from 'vs/workbench/common/editor';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IFuncPinMap, ISavedJson } from 'vs/workbench/parts/maix/fpioa-config/common/types';

export class FpioaModel extends EditorModel {
	private content: ISavedJson;
	private contentHash: string;
	private dirty: boolean = false;
	private saveOnGoing: TPromise<boolean>;

	constructor(
		protected uri: URI,
		@IFileService private fileService: IFileService,
		@ICommandService private commandService: ICommandService,
	) {
		super();
		// console.log('---------------- constructor');
	}

	getResource() {
		return this.uri;
	}

	save(options: ISaveOptions = {}): TPromise<boolean> {
		if (this.saveOnGoing) {
			return this.saveOnGoing;
		}

		this.saveOnGoing = TPromise.as(void 0).then(() => {
			// console.log(JSON.stringify(this.content));
			return this.fileService.updateContent(this.uri, this.binary(), {
				encoding: 'utf8',
				overwriteEncoding: true,
				mkdirp: true,
			});
		}).then((result: IFileStat) => {
			delete this.saveOnGoing;
			this.contentHash = result.etag;
			this.dirty = false;
			return true;
		}, (e) => {
			delete this.saveOnGoing;
			throw e;
		}).then((v) => {
			return this.doGenerate().then(() => {
				return v;
			});
		});

		return this.saveOnGoing;
	}

	public async load(options: ILoadOptions = {}): TPromise<this> {
		// console.log('---------------- load', options);
		if (await this.fileService.existsFile(this.uri)) {
			let data: IContent;
			await this.fileService.resolveContent(this.uri, {
				etag: options.forceReadFromDisk ? '' : this.contentHash,
				encoding: 'utf8',
				position: 4,
			}).then((dd) => {
				data = dd;
			}, (error) => {
				const result = error.fileOperationResult;
				if (result === FileOperationResult.FILE_NOT_MODIFIED_SINCE) {
					return;
				}
				if (result === FileOperationResult.FILE_NOT_FOUND) {
					this.content = {} as any;
					return;
				}
				throw error;
			});

			if (!data) {
				return this;
			}

			this.content = this.parse(data.value);
			this.contentHash = data.etag;
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

	setChip(name: string) {
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

	getPinFunc(ioPin: string) {
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

	setPinFunc(funcId: string, ioPin: string) {
		console.log('[model] set io[%s] to func[%s]', ioPin, funcId);
		if (this.content.funcPinMap[funcId] === ioPin) {
			return false;
		}
		this.dirty = true;
		this.content.funcPinMap[funcId] = ioPin;
		return true;
	}

	private binary() {
		// save as binary, then vscode will not open this file in text editor
		return String.fromCharCode(12, 21, 8, 0) + JSON.stringify(this.content);
	}

	private parse(buff) {
		// first 4 byte already skip by fs read.
		return JSON.parse(buff);
	}

	private doGenerate() {
		return this.commandService.executeCommand('maix.fpioa.generate', {
			...this.content,
			configFile: this.uri.fsPath,
		});
	}
}