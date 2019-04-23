import { IEditorModel } from 'vs/platform/editor/common/editor';
import { Emitter } from 'vs/base/common/event';
import { INodeFileSystemService } from 'vs/kendryte/vs/services/fileSystem/common/type';
import { URI } from 'vs/base/common/uri';
import { IFlashManagerConfigJson, IFlashManagerConfigJsonWritable } from 'vs/kendryte/vs/base/common/jsonSchemas/flashSectionsSchema';
import { fileExists, stat } from 'vs/base/node/pfs';
import { FLASH_SAFE_ADDRESS } from 'vs/kendryte/vs/platform/serialPort/flasher/common/chipDefine';
import { localize } from 'vs/nls';
import { MemoryAllocationCalculator, parseMemoryAddress, stringifyMemoryAddress } from 'vs/kendryte/vs/platform/serialPort/flasher/common/memoryAllocationCalculator';
import { INodePathService } from 'vs/kendryte/vs/services/path/common/type';

const DONT_MODIFY_MARKER = localize('dontModifyMarker', 'DO NOT MODIFY THIS FILE, IT WILL BE OVERRIDE!!!');

interface ISection {
	varName: string;
	filename: string;
	startHex: string;
	endHex: string;
	size: number;
}

export class FlashManagerEditorModel implements IEditorModel {
	protected readonly _onDispose = new Emitter<void>();
	public onDispose = this._onDispose.event;

	private jsonData: IFlashManagerConfigJsonWritable;
	private readonly sourceFilePath: string;

	constructor(
		public readonly resource: URI,
		@INodeFileSystemService private readonly nodeFileSystemService: INodeFileSystemService,
		@INodePathService private readonly nodePathService: INodePathService,
	) {
		this.sourceFilePath = resource.fsPath.replace(/\.json$/i, '.h');
	}

	get data(): IFlashManagerConfigJson {
		return this.jsonData;
	}

	public dispose(): void {
		this._onDispose.fire();
		this._onDispose.dispose();
	}

	public async load(): Promise<this> {
		if (await fileExists(this.resource.fsPath)) {
			const ret = await this.nodeFileSystemService.readJsonFile<IFlashManagerConfigJsonWritable>(this.resource.fsPath);
			this.jsonData = ret.json;
		} else {
			this.jsonData = {} as any;
		}

		if (!this.jsonData.downloadSections) {
			this.jsonData.downloadSections = [];
		}
		if (!this.jsonData.baseAddress) {
			this.jsonData.baseAddress = '0x' + FLASH_SAFE_ADDRESS.toString(16);
		}

		console.log('Flash Manager Model Load: %O', this.jsonData);
		return this;
	}

	async save(): Promise<void> {
		console.log('Flash Manager Model Save: %O', this.jsonData);
		await this.nodeFileSystemService.writeFileIfChanged(
			this.resource.fsPath,
			JSON.stringify(
				this.filterProperty(),
			),
		);

		await this.generateDefine().catch((e) => {
			console.debug('save flash manager: cannot create source file: %s', e.stack.split(/\n/).slice(0, 3).join('\n'));
			return this.nodeFileSystemService.deleteFileIfEsxists(this.sourceFilePath);
		});
	}

	private filterProperty() {
		return {
			baseAddress: this.jsonData.baseAddress,
			downloadSections: this.jsonData.downloadSections.map((item) => {
				const { name, address, autoAddress, filename } = item;
				return { name, address, autoAddress, filename };
			}),
		};
	}

	public async createSections(): Promise<ISection[]> {
		const ret: ISection[] = [];

		const memory = new MemoryAllocationCalculator(parseMemoryAddress(this.jsonData.baseAddress), Infinity);
		for (const item of this.jsonData.downloadSections) {
			const fullPath = this.nodePathService.workspaceFilePath(item.filename);
			if (!await fileExists(fullPath)) {
				throw new Error(localize('fileNotFound', 'File not exists: "{0}"', fullPath));
			}

			const fileSize = (await stat(fullPath)).size;

			let addressEnd: number;
			if (item.autoAddress) {
				const ret = memory.allocAuto(fileSize);
				item.address = stringifyMemoryAddress(ret.from);
				addressEnd = ret.to;
			} else {
				const ret = memory.allocManual(fileSize, parseMemoryAddress(item.address));
				addressEnd = ret.to;
			}

			ret.push({
				varName: item.name,
				filename: item.filename,
				startHex: item.address,
				endHex: stringifyMemoryAddress(addressEnd),
				size: fileSize,
			});
		}

		return ret;
	}

	private async generateDefine() {
		const createdFileContents = [
			'// ' + DONT_MODIFY_MARKER,
			'#ifndef KENDRYTE_IDE_FLASH_MANGER_OUT',
			'#define KENDRYTE_IDE_FLASH_MANGER_OUT',
		];

		for (const item of await this.createSections()) {
			createdFileContents.push(`#define ${item.varName}_START ${item.startHex}`);
			createdFileContents.push(`#define ${item.varName}_END ${item.endHex}`);
			createdFileContents.push(`#define ${item.varName}_SIZE ${item.size}`);
		}

		createdFileContents.push('#endif');

		await this.nodeFileSystemService.writeFileIfChanged(this.sourceFilePath, createdFileContents.join('\n') + '\n');
	}
}