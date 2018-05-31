import { EditorModel } from 'vs/workbench/common/editor';
import URI from 'vs/base/common/uri';
import { TPromise } from 'vs/base/common/winjs.base';
import { FileOperationResult, IContent, IFileService, IFileStat } from 'vs/platform/files/common/files';
import { getChipPackaging } from 'vs/workbench/parts/maix/fpgio-config/common/packagingRegistry';
import { ILoadOptions, ISaveOptions, ModelState } from 'vs/workbench/services/textfile/common/textfiles';

export interface IFuncPinMap {
	[pinFuncID: string]: /* ioPinNum */ string;
}

export interface ISavedJson {
	selectedChip: string;
	funcPinMap: IFuncPinMap;
}

export const NOT_SELECTED = 'not select chip';

export class FpgioModel extends EditorModel {
	protected resolved = false;
	private content: ISavedJson;
	private contentHash: string;
	private dirty: boolean = false;
	private saveOnGoing: TPromise<IFileStat>;
	private disposed: boolean = false;

	constructor(
		public readonly resource: URI,
		@IFileService private fileService: IFileService,
	) {
		super();
		// console.log('---------------- constructor');
	}

	async save(options: ISaveOptions = {}): TPromise<boolean> {
		if (!this.isChipSelected) {
			return false;
		}

		if (this.saveOnGoing) {
			return this.saveOnGoing.then(() => true);
		}

		this.saveOnGoing = this.fileService.updateContent(this.resource, JSON.stringify(this.content), { mkdirp: true });

		const ret = await this.saveOnGoing;
		this.contentHash = ret.etag;

		delete this.saveOnGoing;

		this.dirty = false;

		return true;
	}

	public async load(options: ILoadOptions = {}): TPromise<this> {
		// console.log('---------------- load', options);
		if (await this.fileService.existsFile(this.resource)) {
			let data: IContent;
			await this.fileService.resolveContent(this.resource, {
				etag: options.forceReadFromDisk ? '' : this.contentHash,
				encoding: 'utf8',
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

			this.content = JSON.parse(data.value);
			this.contentHash = data.etag;
			this.dirty = false;
		} else {
			this.content = {} as any;
			this.dirty = false;
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
		return this.content.selectedChip !== NOT_SELECTED;
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
		this.dirty = true;
		this.content.selectedChip = name;
	}

	setPinFunc(funcId: string, ioPin: string) {
		this.dirty = true;
		this.content.funcPinMap[funcId] = ioPin;
	}

	hasState(state: ModelState): boolean {
		// console.log('---------------- hasState', state);
		switch (state) {
			case ModelState.CONFLICT:
				return false;
			case ModelState.DIRTY:
				return this.dirty;
			case ModelState.ERROR:
				return false;
			case ModelState.ORPHAN:
				return false;
			case ModelState.PENDING_SAVE:
				return !!this.saveOnGoing;
			case ModelState.SAVED:
				return !this.dirty;
		}
	}

	dispose() {
		// console.log('---------------- dispose');
		this.disposed = true;
		super.dispose();
	}

	isDisposed() {
		// console.log('---------------- isDisposed', this.disposed);
		return this.disposed;
	}

	getEncoding() {
		// console.log('---------------- getEncoding');
		return void 0;
	}

	getResource() {
		// console.log('---------------- getResource');
		return this.resource;
	}

	revert() {
		return TPromise.as(true);
	}
}