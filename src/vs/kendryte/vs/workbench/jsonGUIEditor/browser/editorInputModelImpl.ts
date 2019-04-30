import { Emitter } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { IJSONResult, INodeFileSystemService } from 'vs/kendryte/vs/services/fileSystem/common/type';
import { URI } from 'vs/base/common/uri';
import { IJsonEditorModel } from 'vs/kendryte/vs/workbench/jsonGUIEditor/common/type';

export abstract class JsonEditorModelBase<JsonType> extends Disposable implements IJsonEditorModel<JsonType> {
	private readonly _onDispose: Emitter<void> = this._register(new Emitter<void>());
	public readonly onDispose = this._onDispose.event;

	protected jsonData?: IJSONResult<JsonType>;

	protected constructor(
		public readonly resource: URI,
		@INodeFileSystemService protected readonly nodeFileSystemService: INodeFileSystemService,
	) {
		super();
	}

	get data() {
		if (!this.jsonData) {
			throw new Error('model not loaded');
		}
		return this.jsonData.json;
	}

	async load(): Promise<this> {
		this.jsonData = await this.nodeFileSystemService.readJsonFile<any>(this.resource.fsPath);
		return this;
	}

	public async save() { // TODO
		await this.nodeFileSystemService.writeFileIfChanged(this.resource.fsPath, JSON.stringify(this.jsonData));
	}

	revert(): Promise<boolean> {
		return this.load().then(() => {
			return true;
		}, () => {
			return false;
		});
	}

	dispose() {
		super.dispose();
		this._onDispose.fire();
	}
}
