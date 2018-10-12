import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { resolve as resolveNative } from 'path';
import { createReadStream } from 'fs';
import { CancellationToken } from 'vs/base/common/cancellation';
import { extract as extractTar } from 'tar-fs';
import { extract as extractZip } from 'vs/platform/node/zip';
import { TPromise } from 'vs/base/common/winjs.base';
import { lstat, mkdirp, readdir, rimraf, unlink } from 'vs/base/node/pfs';
import { resolvePath } from 'vs/kendryte/vs/platform/node/resolvePath';
import { INodePathService } from 'vs/kendryte/vs/platform/common/type';
import { IChannelLogger } from 'vs/kendryte/vs/services/channelLogger/common/type';
import { hash } from 'vs/base/common/hash';
import gunzip = require('gunzip-maybe');

export const IFileCompressService = createDecorator<IFileCompressService>('fileCompressService');

export interface IFileCompressService {
	_serviceBrand: any;

	extractTemp(zipFile: string, logger: IChannelLogger): TPromise<string>;
}

export class FileCompressService implements IFileCompressService {
	_serviceBrand: any;

	constructor(
		@INodePathService protected nodePathService: INodePathService,
	) {
	}

	private unZip(file: string, target: string, logger: IChannelLogger) {
		return extractZip(file, resolveNative(target), { overwrite: true }, logger, CancellationToken.None);
	}

	private MicrosoftInstall(msi: string, target: string, logger: IChannelLogger) {
		// toWinJsPromise(import('sudo-prompt')).then(
		return TPromise.wrapError(new Error('not impl'));
	}

	private unTar(file: string, target: string, logger: IChannelLogger): TPromise<void> {
		return new TPromise((resolve, reject) => {
			const stream = createReadStream(file)
				.pipe(gunzip())
				.pipe(extractTar(target));

			stream.on('finish', _ => resolve(void 0));
			stream.on('error', e => reject(e));
		});
	}

	public async extractTemp(zipFile: string, logger: IChannelLogger): TPromise<string> {
		const unzipTarget = this.nodePathService.tempDir('packages-extract/UNZIP_' + hash(zipFile));
		logger.info('Extract Files:\n  From: %s\n  To: %s', zipFile, unzipTarget);

		logger.warn('  rmdir & mkdirp -> "To" folder', unzipTarget);
		await rimraf(unzipTarget);
		await mkdirp(unzipTarget);

		try {
			if (/\.zip$/.test(zipFile)) {
				logger.info('  -> call ZIP.');
				await this.unZip(zipFile, unzipTarget, logger);
			} else if (/\.msi$/.test(zipFile)) {
				logger.info('  -> call MSI.');
				await this.MicrosoftInstall(zipFile, unzipTarget, logger);
			} else {
				logger.info('  -> call TAR.');
				await this.unTar(zipFile, unzipTarget, logger);
			}
			logger.info('Extracted complete !');
		} catch (e) {
			logger.error('decompress throw:\n%s', e.stack.replace(/^/g, '  '));
			logger.warn('rmdir(%s)', unzipTarget);
			await rimraf(unzipTarget);
			logger.warn('remove broken zip file.');
			await unlink(zipFile);
			throw new Error('Cannot decompress file: ' + zipFile + ' \nError:' + e);
		}

		const contents = await readdir(unzipTarget);
		logger.info('extracted folder content: [%s]', contents.join(', '));
		if (contents.length === 1) {
			const stat = await lstat(resolvePath(unzipTarget, contents[0]));
			if (stat.isDirectory()) {
				logger.debug('use only sub folder as root.');
				return resolvePath(unzipTarget, contents[0]);
			} // else nothing
		} else if (contents.length === 0) {
			throw new Error('Invalid package: empty file');
		}

		return unzipTarget;
	}
}

