import packageJson from 'vs/platform/node/package';

export function IDECurrentPatchVersion() {
	return parseFloat(packageJson['patchVersion']);
}