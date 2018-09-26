import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { INodeFileSystemService } from 'vs/kendryte/vs/platform/common/type';
import { TPromise } from 'vs/base/common/winjs.base';
import { exists, mkdirp, readFile, stat, writeFile } from 'vs/base/node/pfs';
import { ILogService } from 'vs/platform/log/common/log';
import { resolvePath } from 'vs/kendryte/vs/platform/node/resolvePath';

class NodeFileSystemService implements INodeFileSystemService {
	_serviceBrand: any;

	constructor(
		@ILogService protected logService: ILogService,
	) {
	}

	public readFileIfExists(file: string): TPromise<string>;
	public readFileIfExists(file: string, raw: true): TPromise<Buffer>;
	public async readFileIfExists(file: string, raw?: true): TPromise<string | Buffer> {
		if (await exists(file)) {
			this.logService.debug('readFile: ' + file);
			if (raw) {
				return await readFile(file);
			} else {
				return await readFile(file, 'utf8');
			}
		} else {
			this.logService.debug('readFile (not exists): ' + file);
			return raw ? Buffer.alloc(0) : '';
		}
	}

	async writeFile(file: string, data: string | Buffer): TPromise<void> {
		this.logService.debug('writeFile: ' + file);
		await mkdirp(resolvePath(file, '..'));

		if (Buffer.isBuffer(data)) {
			return writeFile(file, data);
		} else {
			return writeFile(file, data, { encoding: { charset: 'utf8', addBOM: false } });
		}
	}

	protected async hasFileChanged(file: string, data: Buffer): TPromise<boolean> {
		if (!await exists(file)) {
			return true;
		}
		const size = await stat(file).then(x => x.size);
		if (size !== data.length) {
			return true;
		}
		const diskContrent = await readFile(file);
		return !diskContrent.compare(data);
	}

	public async writeFileIfChanged(file: string, data: string | Buffer): TPromise<boolean> {
		if (!Buffer.isBuffer(data)) {
			data = Buffer.from(data, 'utf8');
		}
		if (!await this.hasFileChanged(file, data)) {
			this.logService.debug('save file unchanged: ' + file);
			return false;
		}
		this.logService.debug('writeFile: ' + file);
		await this.writeFile(file, data);
		return true;
	}
}

registerSingleton(INodeFileSystemService, NodeFileSystemService);