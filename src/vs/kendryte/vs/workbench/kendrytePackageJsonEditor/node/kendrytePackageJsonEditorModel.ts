import { IEditorModel } from 'vs/platform/editor/common/editor';
import { Emitter } from 'vs/base/common/event';
import { IJSONResult, INodeFileSystemService } from 'vs/kendryte/vs/services/fileSystem/common/type';
import { URI } from 'vs/base/common/uri';
import { ICompileInfo } from 'vs/kendryte/vs/base/common/jsonSchemas/cmakeConfigSchema';
import { IChannelLogService } from 'vs/kendryte/vs/services/channelLogger/common/type';
import { CMAKE_CHANNEL, CMAKE_CHANNEL_TITLE } from 'vs/kendryte/vs/workbench/cmake/common/type';
import { ILogService } from 'vs/platform/log/common/log';

export class KendrytePackageJsonEditorModel implements IEditorModel {
	protected readonly _onDispose = new Emitter<void>();
	public onDispose = this._onDispose.event;
	protected jsonData: IJSONResult<ICompileInfo>;
	private logger: ILogService;

	constructor(
		public readonly resource: URI,
		@IChannelLogService channelLogService: IChannelLogService,
		@INodeFileSystemService private readonly nodeFileSystemService: INodeFileSystemService,
	) {
		this.logger = channelLogService.createChannel(CMAKE_CHANNEL_TITLE, CMAKE_CHANNEL);
	}

	get data() {
		return this.jsonData.json;
	}

	public dispose(): void {
		this._onDispose.dispose();
	}

	public async load(): Promise<this> {
		this.jsonData = await this.nodeFileSystemService.readJsonFile<any>(this.resource.fsPath);
		return this;
	}

	public write(key: string, value: any) {
		this.logger.info(`update json: ${key} to ${value} (type ${typeof value})`);
		this.logger.info(`    to file: ${this.resource.fsPath}`);
		if (value === '') {
			value = undefined;
		}
		if (value === this.jsonData.json[key]) {
			this.logger.info(`save ok. (not change)`);
			return Promise.resolve();
		}
		return this.nodeFileSystemService.editJsonFile(this.resource.fsPath, key, value).then(() => {
			if (value === undefined) {
				delete this.jsonData.json[key];
			} else {
				this.jsonData.json[key] = value;
			}
			this.logger.debug('save ok.');
		}, (e) => {
			this.logger.error('Failed to save!');
			this.logger.error(e.message);
			throw e;
		});
	}
}