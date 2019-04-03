import packageJson from 'vs/platform/product/node/package';

export function IDECurrentPatchVersion() {
	return parseFloat(packageJson['patchVersion']);
}