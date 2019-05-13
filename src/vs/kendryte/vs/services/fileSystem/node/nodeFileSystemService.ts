import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { IFileWithStat, INodeFileSystemService } from 'vs/kendryte/vs/services/fileSystem/common/type';
import { copy, dirExists, exists, fileExists, mkdirp, readFile, rimraf, stat, unlink, writeFile } from 'vs/base/node/pfs';
import { ILogService } from 'vs/platform/log/common/log';
import { resolvePath } from 'vs/kendryte/vs/base/common/resolvePath';
import { Segment } from 'vs/base/common/json';
import { URI } from 'vs/base/common/uri';
import * as encoding from 'vs/base/node/encoding';
import { IReference } from 'vs/base/common/lifecycle';
import { ITextEditorModel, ITextModelService } from 'vs/editor/common/services/resolverService';
import { ITextFileService } from 'vs/workbench/services/textfile/common/textfiles';
import { IFileService } from 'vs/platform/files/common/files';
import { parseExtendedJson } from 'vs/kendryte/vs/base/common/jsonComments';
import { setProperty } from 'vs/base/common/jsonEdit';
import { Range } from 'vs/editor/common/core/range';
import { Selection } from 'vs/editor/common/core/selection';
import { ITextModel } from 'vs/editor/common/model';
import { Edit } from 'vs/base/common/jsonFormatter';
import { EditOperation } from 'vs/editor/common/core/editOperation';
import { isMacintosh, isWindows } from 'vs/base/common/platform';

class NodeFileSystemService implements INodeFileSystemService {
	_serviceBrand: any;

	constructor(
		@ILogService protected logService: ILogService,
		@IFileService private fileService: IFileService,
		@ITextModelService private textModelResolverService: ITextModelService,
		@ITextFileService private textFileService: ITextFileService,
	) {
	}

	public readFile(file: string, raw?: false): Promise<string>;
	public readFile(file: string, raw: true): Promise<Buffer>;
	public readFile(file: string, raw?: boolean): Promise<string | Buffer> {
		this.logService.debug('readFile: ' + file);
		if (raw) {
			return readFile(file);
		} else {
			return readFile(file, 'utf8');
		}
	}

	readFileWithTime(file: string, raw?: false): Promise<IFileWithStat<string>>;
	readFileWithTime(file: string, raw: true): Promise<IFileWithStat<Buffer>>;
	async readFileWithTime(file: string, raw?: boolean): Promise<IFileWithStat<string | Buffer>> {
		this.logService.debug('readFile: ' + file);
		const fstat = await stat(file);
		const ret: IFileWithStat<any> = {
			filepath: file,
			content: undefined,
			stat: {
				atime: fstat.atimeMs,
				mtime: fstat.mtimeMs,
				ctime: fstat.ctimeMs,
				birthtime: fstat.birthtimeMs,
			},
		};
		if (raw) {
			ret.content = await readFile(file);
		} else {
			ret.content = await readFile(file, 'utf8');
		}
		return ret;
	}

	didFileModifiedFrom(file: IFileWithStat<any>) {
		return stat(file.filepath).then((fstat) => {
			if (fstat.mtimeMs === file.stat.mtime && fstat.ctimeMs === file.stat.ctime) {
				return false;
			} else {
				return true;
			}
		}, e => {
			return false;
		});
	}

	public readFileIfExists(file: string, raw?: false): Promise<string>;
	public readFileIfExists(file: string, raw: true): Promise<Buffer>;
	public async readFileIfExists(file: string, raw?: boolean): Promise<string | Buffer> {
		if (await exists(file)) {
			return this.readFile(file, raw as any);
		} else {
			this.logService.debug('readFile (not exists): ' + file);
			return raw ? Buffer.alloc(0) : '';
		}
	}

	async rawWriteFile(file: string, data: string | Buffer): Promise<void> {
		this.logService.debug('writeFile: ' + file);
		await mkdirp(resolvePath(file, '..'));

		if (Buffer.isBuffer(data)) {
			return writeFile(file, data);
		} else {
			return writeFile(file, data, { encoding: { charset: 'utf8', addBOM: false } });
		}
	}

	protected async hasFileChanged(file: string, data: Buffer): Promise<boolean> {
		if (!await exists(file)) {
			// console.log('target did not exists');
			return true;
		}
		const size = await stat(file).then(x => x.size);
		if (size !== data.length) {
			// console.log('size is different');
			return true;
		}
		const diskContent = await readFile(file);
		// console.log('buffer content different? %s', diskContent.compare(data) !== 0);
		return diskContent.compare(data) !== 0;
	}

	public async writeFileIfChanged(file: string, data: string | Buffer): Promise<boolean> {
		if (!Buffer.isBuffer(data)) {
			data = Buffer.from(data, 'utf8');
		}
		if (!await this.hasFileChanged(file, data)) {
			// console.log('save file UNchanged: ' + file);
			this.logService.debug('save file unchanged: ' + file);
			return false;
		}
		// console.log('save file changed: ' + file);
		this.logService.debug('writeFile: ' + file);
		await this.rawWriteFile(file, data);
		return true;
	}

	public async copyWithin(from: string, to: string) {
		await copy(from, to);
	}

	public async copyReplace(from: string, to: string) {
		await rimraf(to);
		await copy(from, to);
	}

	public async readJsonFile<T>(file: string) {
		const data = await readFile(file, 'utf8');
		const [json, warnings] = parseExtendedJson(data, file);
		return { json, warnings, file };
	}

	public async tryWriteInFolder(target: string): Promise<boolean> {
		if (await exists(target)) {
			try {
				const testFile = resolvePath(target, '.a-file-for-test-permission.txt');
				await writeFile(testFile, 'this file can delete.');
				await unlink(testFile);
				return true;
			} catch (e) {
				return false;
			}
		} else {
			return mkdirp(target).then(() => {
				return true;
			}, () => {
				return false;
			});
		}
	}

	public async editJsonFile(file: string, key: Segment[] | Segment, value: any): Promise<void> {
		const resource = URI.file(file);
		const reference = await this.resolveModelReference(resource);
		const model = reference.object.textEditorModel;

		if (!model) {
			throw new Error('FatalError with invalid state. this must not happen.');
		}

		const [, errors] = parseExtendedJson(model.getValue(), file);
		if (errors.length) {
			throw errors[0];
		}

		// Target cannot be dirty if not writing into buffer
		if (this.textFileService.isDirty(resource)) {
			await this.textFileService.save(resource);
		}

		const { tabSize, insertSpaces } = model.getOptions();
		const eol = model.getEOL();

		if (value === null) {
			value = undefined;
		}
		const edit = setProperty(model.getValue(), Array.isArray(key) ? key : [key], value, { tabSize, insertSpaces, eol });
		const changed = this.applyEditToBuffer(edit[0], model);
		if (changed) {
			await this.textFileService.save(model.uri);
		}
	}

	private applyEditToBuffer(edit: Edit, model: ITextModel): boolean {
		const startPosition = model.getPositionAt(edit.offset);
		const endPosition = model.getPositionAt(edit.offset + edit.length);
		const range = new Range(startPosition.lineNumber, startPosition.column, endPosition.lineNumber, endPosition.column);
		let currentText = model.getValueInRange(range);
		if (edit.content !== currentText) {
			const editOperation = currentText ? EditOperation.replace(range, edit.content) : EditOperation.insert(startPosition, edit.content);
			model.pushEditOperations([new Selection(startPosition.lineNumber, startPosition.column, startPosition.lineNumber, startPosition.column)], [editOperation], () => []);
			return true;
		}
		return false;
	}

	private async resolveModelReference(resource: URI): Promise<IReference<ITextEditorModel>> {
		const exists = await this.fileService.exists(resource);
		if (!exists) {
			await this.textFileService.write(resource, '{}', { encoding: encoding.UTF8 });
		}
		return await this.textModelResolverService.createModelReference(resource);
	}

	public async prepareSocketFile(s: string): Promise<string> {
		let base = s.replace(/[\/\\]/g, '_') + '.' + (Date.now()).toFixed(0);
		let dirname = '';

		if (isWindows) {
			return `\\\\?\\pipe\\kide.${base}`;
		} else if (isMacintosh) {
			dirname = '/private/tmp/kide-sock/';
			base += '.sock';
		} else {
			dirname = '/dev/shm/kide-sock/';
			base += '.sock';
		}
		if (!await dirExists(dirname)) {
			await mkdirp(dirname);
		}

		const path = resolvePath(dirname, base);
		if (await exists(path)) {
			await unlink(path);
		}
		return path;
	}

	public async deleteFileIfExists(path: string) {
		if (await fileExists(path)) {
			await unlink(path);
			return true;
		} else {
			return false;
		}
	}
}

registerSingleton(INodeFileSystemService, NodeFileSystemService);
