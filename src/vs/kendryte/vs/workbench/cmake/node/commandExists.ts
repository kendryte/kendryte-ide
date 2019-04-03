import { exec } from 'child_process';

export async function findCommandLinux(executable: string): Promise<string | null> {
	return new Promise((resolve) => {
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