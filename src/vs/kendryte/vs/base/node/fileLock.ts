import { hash } from 'vs/base/common/hash';
import { lock as rawLock, unlock as rawUnlock } from 'proper-lockfile';
import { fileExists, mkdirp, unlink, writeFile } from 'vs/base/node/pfs';
import { ICommonLogger } from 'vs/kendryte/vs/base/common/log';
import { osTempDir } from 'vs/kendryte/vs/base/node/resolvePath';
import { dirname } from 'vs/base/common/path';

export function wrapActionWithFileLock<T>(fileToLock: string, logger: ICommonLogger, action: () => Thenable<T>): Promise<T> {
	return doLockFile(fileToLock, logger).then(() => {
		return Promise.resolve(action()).finally(() => {
			return doUnlockFile(fileToLock, logger).catch((e) => {
				logger.error(`Cannot unlock file ${fileToLock}: ${e.message}`);
			});
		});
	}, (e) => {
		logger.error(`Cannot lock file ${fileToLock}: ${e.message}`);
		throw e;
	});
}

async function doLockFile(f: string, logger: ICommonLogger): Promise<void> {
	const lockFile = osTempDir('L' + hash(f));
	logger.debug(`lock [${f}] -> ${lockFile}`);
	if (!await fileExists(lockFile)) {
		logger.debug('    the lock file not exists, create it.');
		await mkdirp(dirname(lockFile));
		await writeFile(lockFile, '', { encoding: { charset: 'utf8', addBOM: false } });
	}
	await rawLock(lockFile);
}

async function doUnlockFile(f: string, logger: ICommonLogger): Promise<void> {
	const lockFile = osTempDir('L' + hash(f));
	logger.debug(`unlock [${f}] -> ${lockFile}`);
	if (!await fileExists(lockFile)) {
		logger.debug('    the lock file not exists, no need release.');
		return;
	}
	await rawUnlock(lockFile);
	await unlink(lockFile);
}