import { IEditorModel } from 'vs/platform/editor/common/editor';
import { Emitter } from 'vs/base/common/event';
import { IJSONResult, INodeFileSystemService } from 'vs/kendryte/vs/services/fileSystem/common/type';
import { URI } from 'vs/base/common/uri';
import { IFlashManagerConfigJson, IFlashManagerConfigJsonReadonly, IFlashSection } from 'vs/kendryte/vs/base/common/jsonSchemas/flashSectionsSchema';
import { fileExists } from 'vs/base/node/pfs';
import { parseExtendedJson } from 'vs/kendryte/vs/base/common/jsonComments';
import { FLASH_SAFE_ADDRESS } from 'vs/kendryte/vs/workbench/serialUpload/common/chipDefine';

export class FlashManagerEditorModel implements IEditorModel {
	protected readonly _onDispose = new Emitter<void>();
	public onDispose = this._onDispose.event;

	private jsonData: IJSONResult<IFlashManagerConfigJson>;
	private copiedData: IFlashManagerConfigJson;

	constructor(
		public readonly resource: URI,
		@INodeFileSystemService private readonly nodeFileSystemService: INodeFileSystemService,
	) {
	}

	get data(): IFlashManagerConfigJsonReadonly {
		if (!this.copiedData) {
			throw new Error('FlashManagerEditorModel is not resolved.');
		}
		return this.copiedData;
	}

	public dispose(): void {
		this._onDispose.fire();
		this._onDispose.dispose();
	}

	public async load(): Promise<this> {
		if (await fileExists(this.resource.fsPath)) {
			this.jsonData = await this.nodeFileSystemService.readJsonFile<any>(this.resource.fsPath);
		} else {
			const [json, warnings] = parseExtendedJson('{}', this.resource.fsPath);
			this.jsonData = { json, warnings };
		}

		if (!this.jsonData.json.downloadSections) {
			this.jsonData.json.downloadSections = [];
		}
		if (!this.jsonData.json.baseAddress) {
			this.jsonData.json.baseAddress = '0x' + FLASH_SAFE_ADDRESS.toString(16);
		}

		this.copiedData = { ...this.jsonData.json };
		this.copiedData.downloadSections = this.copiedData.downloadSections.map((item) => {
			return { ...item };
		});

		return this;
	}

	public save(): Promise<boolean> {
		return this.nodeFileSystemService.writeFileIfChanged(this.resource.fsPath, JSON.stringify(this.jsonData.json));
	}

	public removeValue(index: number) {
		console.log('remove %d', index);
		const item = this.jsonData.json.downloadSections[index];
		if (!item) {
			throw new Error('flash section index ' + index + ' did not exists');
		}

		this.jsonData.json.downloadSections.splice(index, 1);
		this.copiedData.downloadSections.splice(index, 1);
	}

	public setValue(index: number, field: keyof IFlashSection, value: string) {
		const item = this.jsonData.json.downloadSections[index];
		if (!item) {
			throw new Error('flash section index ' + index + ' did not exists');
		}

		item[field] = value;
		this.copiedData.downloadSections[index][field] = value;
	}

	public createNewSection() {
		const index = this.jsonData.json.downloadSections.length;
		this.jsonData.json.downloadSections.push({
			name: 'NEW_FILE_' + (index + 1),
			address: '--',
			autoAddress: true,
			filename: '',
		});
		this.copiedData.downloadSections.push({
			name: 'NEW_FILE_' + (index + 1),
			address: '--',
			autoAddress: true,
			filename: '',
		});
		return index;
	}
}