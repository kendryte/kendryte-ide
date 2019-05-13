import { Verbosity } from 'vs/workbench/common/editor';
import { URI } from 'vs/base/common/uri';
import { localize } from 'vs/nls';
import { basename } from 'vs/base/common/path';
import { Emitter } from 'vs/base/common/event';
import { IFlashManagerConfigJson, IFlashSection } from 'vs/kendryte/vs/base/common/jsonSchemas/flashSectionsSchema';
import { IMarkerData, IMarkerService, MarkerSeverity } from 'vs/platform/markers/common/markers';
import { stat } from 'vs/base/node/pfs';
import { AllocInfo, MemoryAllocationCalculator, parseMemoryAddress, stringifyMemoryAddress } from 'vs/kendryte/vs/platform/serialPort/flasher/common/memoryAllocationCalculator';
import { FLASH_MAX_SIZE, FLASH_SAFE_ADDRESS } from 'vs/kendryte/vs/platform/serialPort/flasher/common/chipDefine';
import { humanSize } from 'vs/kendryte/vs/base/common/speedShow';
import { resolvePath } from 'vs/kendryte/vs/base/common/resolvePath';
import { AbstractJsonEditorInput } from 'vs/kendryte/vs/workbench/jsonGUIEditor/editor/browser/abstractJsonEditorInput';
import { ICustomJsonEditorService } from 'vs/kendryte/vs/workbench/jsonGUIEditor/service/common/type';
import { EditorId } from 'vs/kendryte/vs/workbench/jsonGUIEditor/editor/common/type';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { FlashManagerEditorModel } from 'vs/kendryte/vs/workbench/flashManager/common/editorModel';

const MARKER_ID = 'flash.manager.editor';

export class FlashManagerEditorInput extends AbstractJsonEditorInput<IFlashManagerConfigJson> {
	public readonly model: FlashManagerEditorModel;

	private _errors: IMarkerData[] = [];
	private _errorMessage: string = '';

	private readonly _onItemUpdate = new Emitter<string[]>();
	public readonly onItemUpdate = this._onItemUpdate.event;

	public get rootPath() {return resolvePath(this.model.resource.fsPath, '../..');}

	constructor(
		descriptor: EditorId,
		resource: URI,
		@IInstantiationService instantiationService: IInstantiationService,
		@ICustomJsonEditorService customJsonEditorService: ICustomJsonEditorService,
		@IMarkerService private readonly markerService: IMarkerService,
	) {
		super(descriptor, resource, instantiationService, customJsonEditorService);

		this._register(this._onItemUpdate);
		this._register(this.model.onContentChange(() => {
			this.sync();
		}));
	}

	createModel(customJsonEditorService: ICustomJsonEditorService) {
		return customJsonEditorService.createJsonModel<IFlashManagerConfigJson>(this.resource, FlashManagerEditorModel);
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
				return localize('editingFile', 'editing {0}', basename(this.getResource().fsPath));
			case Verbosity.LONG:
				return localize('editingFile', 'editing {0}', this.getResource().fsPath);
		}

	}

	public createNewSection() {
		const id = Date.now().toString();

		const index = this.model.data.downloadSections.length;
		this.model.newItem(<IFlashSection>{
			id,
			filesize: 0,
			name: 'NEW_FILE_' + (index + 1),
			address: '--',
			autoAddress: true,
			filename: '',
			addressEnd: '',
			swapBytes: true,
		});

		return index;
	}

	public changeSectionFieldValue(id: string, field: keyof IFlashSection, value: any) {
		const index = this.findSectionIndex(id);
		if (index === -1) {
			debugger;
			throw new Error('flash section id ' + id + ' did not exists');
		}

		if (field === 'address') {
			this.model.update(['downloadSections', index, 'autoAddress'], !value);
		}
		this.model.update(['downloadSections', index, field], value);
	}

	public deleteItem(id: string) {
		const index = this.findSectionIndex(id);
		this.model.remove(index);

		return index;
	}

	swap(index1: number, index2: number) {
		this.model.swap(index1, index2);
	}

	private sync() {
		// console.trace('Flash Manager Input Sync: %O', this.model.data);
		this._errorMessage = '';
		this._sync().catch((e) => {
			this._errorMessage = e.message;
			this._onItemUpdate.fire([]);
			throw e;
		});
	}

	private async _sync() {
		this._errors = [];

		const allChangedIds: string[] = [];
		let totalSize = 0;

		// debugger;
		const memory = new MemoryAllocationCalculator(parseMemoryAddress(this.model.data.baseAddress), Infinity);
		for (const item of this.model.data.downloadSections) {
			const prevState = { from: item.address, to: item.addressEnd };

			let { address, addressEnd, filesize } = item;
			if (item.autoAddress) {
				address = '???';
			}

			if (item.filename) {
				const fullPath = resolvePath(this.rootPath, item.filename);
				filesize = await stat(fullPath).then((fstat) => {
					return fstat.size;
				}, (e) => {
					this.createDiagnostics(true, localize('fileNotExists', 'cannot read file: {0}', fullPath));
					this.createDiagnostics(false, e.message);
					return 0;
				});

				if (filesize > 0) {
					totalSize += filesize;

					try {
						let ret: AllocInfo;
						if (item.autoAddress) {
							ret = memory.allocAuto(filesize);
							address = stringifyMemoryAddress(ret.from);
						} else {
							ret = memory.allocManual(filesize, parseMemoryAddress(address));
						}
						addressEnd = stringifyMemoryAddress(ret.to);
					} catch (e) {
						this.createDiagnostics(true, e.message);
					}
				}
			} else {
				filesize = 0;
				this.createDiagnostics(false, localize('fileSelect', 'Please select file for : {0}', item.name));
			}

			const anyChange = this.model.flushItem(item, { address, addressEnd, filesize });
			if (anyChange) {
				console.log('change: (%s)\nfrom: %s -> %s\n  to: %s -> %s', anyChange, prevState.from, address, prevState.to, addressEnd);
				allChangedIds.push(item.id);
			}
		}

		this.model.setTotal(totalSize, memory.getLatestEnding());

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
		return this.model.data.downloadSections.findIndex(e => e.id === id);
	}

	public sliceData(from: number = 0, count: number = this.model.data.downloadSections.length): IFlashSection[] {
		// debugger;
		return this.model.data.downloadSections.slice(from, from + count);
	}
}
