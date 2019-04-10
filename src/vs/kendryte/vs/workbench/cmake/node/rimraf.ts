import { lstat, readdir, unlink } from 'vs/base/node/pfs';
import { join } from 'path';
import { promisify } from 'util';
import * as fs from 'fs';

const rmdir = promisify(fs.rmdir);

export function rmRfExclude(path: string, exclude: RegExp): Promise<void> {
	return _rimrafExclude(path, exclude).then(() => void 0);
}

function _rimrafExclude(path: string, exclude: RegExp): Promise<boolean> {
	return lstat(path).then(async (stat) => {
		if (stat.isDirectory() && !stat.isSymbolicLink()) {
			const children = await readdir(path);

			let someFileExcluded = false;
			for (const child of children) {
				if (exclude.test(child)) {
					someFileExcluded = true;
					continue;
				}

				if (await _rimrafExclude(join(path, child), exclude)) {
					someFileExcluded = true;
				}
			}

			if (!someFileExcluded) {
				await rmdir(path);
			}

			return someFileExcluded;
		} else {
			await unlink(path);
			return false;
		}
	}, (err: NodeJS.ErrnoException) => {
		if (err.code === 'ENOENT') {
			return void 0;
		}

		return Promise.reject(err);
	});
}