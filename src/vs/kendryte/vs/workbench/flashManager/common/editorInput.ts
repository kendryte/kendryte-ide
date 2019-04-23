import { ConfirmResult, EditorInput, IEditorInputFactory, IRevertOptions, Verbosity } from 'vs/workbench/common/editor';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { URI } from 'vs/base/common/uri';
import {
	IFlashManagerConfigJsonUI,
	IFlashManagerConfigJsonUIWritable,
	IFlashSectionUI,
	KENDRYTE_FLASH_MANAGER_ID,
	KENDRYTE_FLASH_MANAGER_INPUT_ID,
	KENDRYTE_FLASH_MANAGER_TITLE,
} from 'vs/kendryte/vs/workbench/flashManager/common/type';
import { FlashManagerEditorModel } from 'vs/kendryte/vs/workbench/flashManager/common/editorModel';
import { localize } from 'vs/nls';
import { basename } from 'vs/base/common/path';
import { Emitter } from 'vs/base/common/event';
import { memoize } from 'vs/base/common/decorators';
import { IFlashSection } from 'vs/kendryte/vs/base/common/jsonSchemas/flashSectionsSchema';
import { INodePathService } from 'vs/kendryte/vs/services/path/common/type';
import { IMarkerData, IMarkerService, MarkerSeverity } from 'vs/platform/markers/common/markers';
import { stat } from 'vs/base/node/pfs';
import { AllocInfo, MemoryAllocationCalculator, parseMemoryAddress, stringifyMemoryAddress } from 'vs/kendryte/vs/platform/serialPort/flasher/common/memoryAllocationCalculator';
import { FLASH_MAX_SIZE, FLASH_SAFE_ADDRESS } from 'vs/kendryte/vs/platform/serialPort/flasher/common/chipDefine';
import { humanSize } from 'vs/kendryte/vs/base/common/speedShow';

const MARKER_ID = 'flash.manager.editor';

export class FlashManagerEditorInput extends EditorInput {
	public static readonly ID: string = KENDRYTE_FLASH_MANAGER_INPUT_ID;

	private readonly model: FlashManagerEditorModel;
	private _mData: IFlashManagerConfigJsonUIWritable;

	private _errors: IMarkerData[];
	private _errorMessage: string = '';
	private _dirty: boolean = false;

	private readonly _onReload = new Emitter<void>();
	public readonly onReload = this._onReload.event;

	private readonly _onItemUpdate = new Emitter<string[]>();
	public readonly onItemUpdate = this._onItemUpdate.event;

	constructor(
		resource: URI,
		@IInstantiationService instantiationService: IInstantiationService,
		@INodePathService private readonly nodePathService: INodePathService,
		@IMarkerService private readonly markerService: IMarkerService,
	) {
		super();

		this._register(this._onReload);
		this._register(this._onItemUpdate);
		this.model = instantiationService.createInstance(FlashManagerEditorModel, resource);
	}

	public get modelData(): IFlashManagerConfigJsonUI {
		return this._mData;
	}

	public get errorMessage() {
		if (this._errorMessage) {
			return this._errorMessage;
		} else if (this._errors[0]) {
			return this._errors[0].message;
		} else {
			return '';
		}
	}

	protected setDirty(dirty: boolean = true) {
		if (this._dirty === dirty) {
			return;
		}
		this._dirty = dirty;
		this._onDidChangeDirty.fire();
	}

	isDirty(): boolean {
		return this._dirty;
	}

	confirmSave(): Promise<ConfirmResult> {
		return Promise.resolve(ConfirmResult.SAVE);
	}

	save(): Promise<boolean> {
		return this.model.save().then(() => {
			this.setDirty(false);
			return true;
		}, () => {
			return false;
		});
	}

	async revert(options?: IRevertOptions): Promise<boolean> {
		return this.model.load().then(() => {
			this._mData = this.model.data as any;

			this._mData.downloadSections.forEach((item) => {
				Object.assign(item, {
					id: (Math.random() * 10000000).toString(),
				});
			});

			return this.sync();
		}).then((d) => {
			this.setDirty(false);
			this._onReload.fire();
			return true;
		});
	}

	getName(): string {
		return KENDRYTE_FLASH_MANAGER_TITLE;
	}

	getResource(): URI {
		return this.model.resource;
	}

	getTypeId(): string {
		return FlashManagerEditorInput.ID;
	}

	getPreferredEditorId(candidates: string[]): string {
		return KENDRYTE_FLASH_MANAGER_ID;
	}

	supportsSplitEditor(): boolean {
		return true;
	}

	matches(otherInput: FlashManagerEditorInput): boolean {
		if (this === otherInput) {
			return true;
		}
		try {
			return otherInput.getResource().toString() === this.getResource().toString();
		} catch (e) {
			return false;
		}
	}

	getTitle(verbosity: Verbosity = Verbosity.MEDIUM): string {
		switch (verbosity) {
			case Verbosity.SHORT:
				return 'Flash';
			case Verbosity.MEDIUM:
				return 'Flash manager';
			case Verbosity.LONG:
				return 'Flash upload configuration';
		}
	}

	getDescription(verbosity: Verbosity = Verbosity.MEDIUM): string {
		switch (verbosity) {
			case Verbosity.SHORT:
				return '';
			case Verbosity.MEDIUM:
				return localize('editing {0}', basename(this.getResource().fsPath));
			case Verbosity.LONG:
				return localize('editing {0}', this.getResource().fsPath);
		}

	}

	@memoize
	resolve(): Promise<FlashManagerEditorModel> {
		return this.revert().then(() => {
			return this.model;
		});
	}

	public createNewSection() {
		this.setDirty(true);
		const id = Date.now().toString();

		const index = this._mData.downloadSections.length;
		this._mData.downloadSections.push({
			id,
			filesize: 0,
			name: 'NEW_FILE_' + (index + 1),
			address: '--',
			autoAddress: true,
			filename: '',
			addressEnd: '',
		});

		this.sync().catch();

		return index;
	}

	public changeSectionFieldValue(id: string, field: keyof IFlashSection, value: string) {
		// console.log('change section value: %s . %s = %s', id, field, value);
		this.setDirty(true);

		const index = this.findSectionIndex(id);
		if (index === -1) {
			throw new Error('flash section id ' + id + ' did not exists');
		}
		const item = this._mData.downloadSections[index];

		if (field === 'address') {
			item.autoAddress = !value;
		}

		item[field] = value;

		this.sync().catch();
	}

	public deleteItem(id: string) {
		this.setDirty(true);

		const index = this.findSectionIndex(id);
		this._mData.downloadSections.splice(index, 1);

		this.sync().catch();

		return index;
	}

	swap(index1: number, index2: number) {
		this.setDirty(true);

		const temp = this._mData.downloadSections[index1];
		this._mData.downloadSections[index1] = this._mData.downloadSections[index2];
		this._mData.downloadSections[index2] = temp;

		this.sync().catch();
	}

	private sync() {
		this._errorMessage = '';
		return this._sync().catch((e) => {
			this._errorMessage = e.message;
			this._onItemUpdate.fire([]);
			throw e;
		});
	}

	private async _sync() {
		console.log('Flash Manager Input Sync: %O', this._mData);

		this._errors = [];

		const allChangedIds: string[] = [];
		let totalSize = this._mData.totalSize = 0;
		this._mData.endAddress = '';

		const memory = new MemoryAllocationCalculator(parseMemoryAddress(this._mData.baseAddress), Infinity);
		for (const item of this._mData.downloadSections) {
			const prevState = { from: item.address, to: item.addressEnd };

			if (item.autoAddress) {
				item.address = '???';
			}

			if (item.filename) {
				const fullPath = this.nodePathService.workspaceFilePath(item.filename);
				await stat(fullPath).then((fstat) => {
					item.filesize = fstat.size;
				}, (e) => {
					this.createDiagnostics(true, localize('fileNotExists', 'cannot read file: {0}', item.filename));
					this.createDiagnostics(false, e.message);
					item.filesize = 0;
				});

				if (item.filesize > 0) {
					totalSize += item.filesize;

					try {
						let ret: AllocInfo;
						if (item.autoAddress) {
							ret = memory.allocAuto(item.filesize);
							item.address = stringifyMemoryAddress(ret.from);
						} else {
							ret = memory.allocManual(item.filesize, parseMemoryAddress(item.address));
						}
						item.addressEnd = stringifyMemoryAddress(ret.to);
					} catch (e) {
						this.createDiagnostics(true, e.message);
					}
				}
			} else {
				item.filesize = 0;
				this.createDiagnostics(false, localize('fileSelect', 'Please select file for : {0}', item.name));
			}
			if (prevState.to !== item.addressEnd || prevState.from !== item.address) {
				console.log('change:', prevState.to, item.addressEnd, prevState.from, item.address);
				allChangedIds.push(item.id);
			}
		}

		this._mData.totalSize = totalSize;
		this._mData.endAddress = memory.getLatestEnding();

		if (totalSize > FLASH_MAX_SIZE - FLASH_SAFE_ADDRESS) {
			this.createDiagnostics(false, localize('filesMayLarge', 'Total size larger than {0}', humanSize(FLASH_MAX_SIZE - FLASH_SAFE_ADDRESS)));
		}

		this.markerService.changeAll(MARKER_ID, this._errors.map((error) => {
			return {
				resource: this.getResource(),
				marker: error,
			};
		}));

		this._onItemUpdate.fire(allChangedIds);
	}

	private createDiagnostics(isErr: boolean, message: string) {
		this._errors.push({
			severity: isErr ? MarkerSeverity.Error : MarkerSeverity.Warning,
			message,
			startLineNumber: 1,
			startColumn: 0,
			endLineNumber: 1,
			endColumn: 0,
		});
	}

	public findSectionIndex(id: string) {
		return this._mData.downloadSections.findIndex(e => e.id === id);
	}

	public sliceData(from: number = 0, count: number = this._mData.downloadSections.length): IFlashSectionUI[] {
		return this._mData.downloadSections.slice(from, from + count).map(e => Object.assign({}, e));
	}
}

interface ISerializedFlashManagerEditorInput {
	resource: string;
}

export class FlashManagerEditorInputFactory implements IEditorInputFactory {
	constructor() { }

	public serialize(editorInput: FlashManagerEditorInput): string {
		const input = <FlashManagerEditorInput>editorInput;

		const serialized: ISerializedFlashManagerEditorInput = {
			resource: input.getResource().toString(),
		};

		return JSON.stringify(serialized);
	}

	public deserialize(instantiationService: IInstantiationService, serializedEditorInput: string): FlashManagerEditorInput {
		const deserialized: ISerializedFlashManagerEditorInput = JSON.parse(serializedEditorInput);

		return instantiationService.createInstance(
			FlashManagerEditorInput,
			URI.parse(deserialized.resource),
		);
	}
}

