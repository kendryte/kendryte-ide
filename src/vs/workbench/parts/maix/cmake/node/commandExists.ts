import { exec } from 'child_process';
import { TPromise } from 'vs/base/common/winjs.base';

export async function findCommandLinux(executable: string): TPromise<string|null> {
	return new TPromise((resolve) => {
		exec(`command -v ${JSON.stringify(executable)} 2>/dev/null`, {
			encoding: 'utf8',
		}, (error, stdout) => {
			if (stdout) {
				resolve(stdout.trim());
			} else {
				resolve('null');
			}
		});
	});
}