import { resolve } from 'path';

export function gulpCommands(absolute?: string): string[] {
	if (absolute) {
		return ['--max-old-space-size=4096', resolve(absolute, 'node_modules/gulp/bin/gulp.js')];
	} else {
		return ['--max-old-space-size=4096', './node_modules/gulp/bin/gulp.js'];
	}
}
