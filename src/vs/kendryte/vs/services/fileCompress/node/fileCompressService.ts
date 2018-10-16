import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { resolve as resolveNative } from 'path';
import { createReadStream } from 'fs';
import { CancellationToken } from 'vs/base/common/cancellation';
import { extract as extractTar } from 'tar-fs';
import { extract as extractZip } from 'vs/platform/node/zip';
import { TPromise } from 'vs/base/common/winjs.base';
import { lstat, mkdirp, readdir, rimraf, unlink } from 'vs/base/node/pfs';
import { resolvePath } from 'vs/kendryte/vs/base/node/resolvePath';
import { INodePathService } from 'vs/kendryte/vs/services/path/common/type';
import { hash } from 'vs/base/common/hash';
import { ILogService } from 'vs/platform/log/common/log';
import { basename } from 'vs/base/common/paths';
import gunzip = require('gunzip-maybe');

export const IFileCompressService = createDecorator<IFileCompressService>('fileCompressService');

export interface IFileCompressService {
	_serviceBrand: any;

	extractTemp(zipFile: string, logger: ILogService): TPromise<string>;
}

export class FileCompressService implements IFileCompressService {
	_serviceBrand: any;

	constructor(
		@INodePathService protected nodePathService: INodePathService,
	) {
	}

	private unZip(file: string, target: string, logger: ILogService) {
		return extractZip(file, resolveNative(target), { overwrite: true }, logger, CancellationToken.None);
	}

	private MicrosoftInstall(msi: string, target: string, logger: ILogService) {
		// toWinJsPromise(import('sudo-prompt')).then(
		return TPromise.wrapError(new Error('not impl'));
	}

	private unTar(file: string, target: string, logger: ILogService): TPromise<void> {
		return new TPromise((resolve, reject) => {
			const stream = createReadStream(file)
				.pipe(gunzip())
				.pipe(extractTar(target));

			stream.on('finish', _ => resolve(void 0));
			stream.on('error', e => reject(e));
		});
	}

	public async extractTemp(zipFile: string, logger: ILogService): TPromise<string> {
		const debugName = basename(zipFile);

		const unzipTarget = this.nodePathService.tempDir('packages-extract/UNZIP_' + hash(zipFile));
		logger.info('[%s] Extract Files:\n  From: %s\n  To: %s', debugName, zipFile, unzipTarget);

		logger.warn('  rmdir & mkdirp -> "To" folder', unzipTarget);
		await rimraf(unzipTarget);
		await mkdirp(unzipTarget);

		try {
			if (/\.zip$/.test(zipFile)) {
				logger.info('[%s]  -> call ZIP.', debugName);
				await this.unZip(zipFile, unzipTarget, logger);
			} else if (/\.msi$/.test(zipFile)) {
				logger.info('[%s]  -> call MSI.', debugName);
				await this.MicrosoftInstall(zipFile, unzipTarget, logger);
			} else {
				logger.info('[%s]  -> call TAR.', debugName);
				await this.unTar(zipFile, unzipTarget, logger);
			}
			logger.info('[%s] Extracted complete.', debugName);
		} catch (e) {
			logger.error('[%s] decompress throw:\n%s', debugName, e.stack.replace(/^/g, '  '));
			logger.warn('rmdir(%s)', unzipTarget);
			await rimraf(unzipTarget);
			logger.warn('[%s] remove broken zip file.', debugName);
			await unlink(zipFile);
			throw new Error('Cannot decompress file: ' + zipFile + ' \nError:' + e);
		}

		const contents = await readdir(unzipTarget);
		logger.info('[%s] extracted folder content: [%s]', debugName, contents.join(', '));
		if (contents.length === 1) {
			const stat = await lstat(resolvePath(unzipTarget, contents[0]));
			if (stat.isDirectory()) {
				logger.info('[%s] use only sub folder as root.', debugName);
				return resolvePath(unzipTarget, contents[0]);
			} // else nothing
		} else if (contents.length === 0) {
			throw new Error('Invalid package: empty file');
		}

		return unzipTarget;
	}
}

