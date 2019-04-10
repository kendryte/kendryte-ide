import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { resolve as resolveNative } from 'path';
import { CancellationToken } from 'vs/base/common/cancellation';
import { extract as extractZip } from 'vs/base/node/zip';
import { lstat, mkdirp, readdir, rename, rimraf } from 'vs/base/node/pfs';
import { osTempDir, resolvePath } from 'vs/kendryte/vs/base/node/resolvePath';
import { ILogService } from 'vs/platform/log/common/log';
import { basename } from 'vs/base/common/path';
import decompress = require('decompress');
import decompressTar = require('decompress-tar');
import decompressTarbz2 = require('decompress-tarbz2');
import decompressTargz = require('decompress-targz');
import decompressTarxz = require('decompress-tarxz');

export const IFileCompressService = createDecorator<IFileCompressService>('fileCompressService');

const plugins = [
	decompressTar(),
	decompressTarbz2(),
	decompressTargz(),
	decompressTarxz(),
];

export interface IFileCompressService {
	_serviceBrand: any;

	extractTemp(zipFile: string, logger: ILogService): Promise<string>;
}

export class FileCompressService implements IFileCompressService {
	_serviceBrand: any;
	private readonly runId = Date.now().toFixed(0);

	constructor() {
	}

	private unZip(file: string, target: string) {
		return extractZip(file, resolveNative(target), { overwrite: true }, CancellationToken.None);
	}

	private MicrosoftInstall(msi: string, target: string, logger: ILogService) {
		// toWinJsPromise(import('sudo-prompt')).then(
		return Promise.reject(new Error('not impl'));
	}

	private unTar(file: string, target: string, logger: ILogService): Promise<void> {
		return decompress(file, target, { plugins }).then(() => {
			return void 0;
		});
	}

	public async extractTemp(zipFile: string, logger: ILogService): Promise<string> {
		const debugName = basename(zipFile);

		const unzipTarget = osTempDir('packages-extract/UNZIP_' + this.runId);
		logger.info('[%s] Extract Files:\n  From: %s\n  To: %s', debugName, zipFile, unzipTarget);

		logger.warn('  rmdir & mkdirp -> "To" folder', unzipTarget);
		await rimraf(unzipTarget);
		await mkdirp(unzipTarget);

		let method = 'unknown';
		try {
			if (/\.zip$/.test(zipFile)) {
				method = 'zip';
				logger.info('[%s]  -> call ZIP.', debugName);
				await this.unZip(zipFile, unzipTarget);
			} else if (/\.msi$/.test(zipFile)) {
				method = 'msi';
				logger.info('[%s]  -> call MSI.', debugName);
				await this.MicrosoftInstall(zipFile, unzipTarget, logger);
			} else if (/\.tar\.[^.]+$/.test(zipFile)) {
				method = 'tar';
				logger.info('[%s]  -> call TAR.', debugName);
				await this.unTar(zipFile, unzipTarget, logger);
			} else {
				return Promise.reject(new Error('unknown file type: ' + zipFile));
			}
			logger.info('[%s] Extracted complete.', debugName);
		} catch (e) {
			const rnd = (Math.random() * 1000000).toFixed(0);
			logger.error('[%s] decompress throw:\n%s', debugName, e.stack.replace(/^/g, '  '));
			logger.warn('[%s] remove broken result folder', unzipTarget);
			await rename(unzipTarget, unzipTarget + '.broken.' + rnd);
			logger.warn('[%s] remove broken zip file.', debugName);
			await rename(zipFile, zipFile + '.broken.' + rnd);
			throw new Error('Cannot decompress file (' + method + '): ' + zipFile + ' \nError:' + e);
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

