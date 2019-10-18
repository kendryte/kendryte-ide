import * as path from 'vs/base/common/path';
import { getPathFromAmdModule } from 'vs/base/common/amd';

export function IDECurrentPatchVersion() {
	const rootPath = path.dirname(getPathFromAmdModule(require, ''));
	const pkg = require.__$__nodeRequire(path.join(rootPath, 'package.json')) as { patchVersion: string; };

	return parseFloat(pkg.patchVersion);
}
