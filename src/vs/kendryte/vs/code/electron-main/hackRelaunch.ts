import { app, RelaunchOptions } from 'electron';
import { isUpdater } from 'vs/kendryte/vs/base/common/platform';

export function hackReLaunch() {
	if (isUpdater) {
		app.relaunch = (options?: RelaunchOptions) => {
			process.send('please-relaunch', options);
		};
	}
}
