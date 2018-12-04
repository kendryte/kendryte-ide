import { resolve } from 'path';
import { ARCH_RELEASE_ROOT, VSCODE_ROOT } from '../misc/constants';

export interface IExtensionPath {
	targetRoot: string;
	sourceRoot: string;
}

export function getExtensionPath(fromBuild: true): Pick<IExtensionPath, 'sourceRoot'>;
export function getExtensionPath(fromBuild: true, targetRoot: string): IExtensionPath;
export function getExtensionPath(fromBuild: false): IExtensionPath;
export function getExtensionPath(fromBuild: boolean, targetRoot: string = process.env.TEMP): IExtensionPath {
	let sourceRoot = fromBuild? ARCH_RELEASE_ROOT : VSCODE_ROOT;
	let targetPath = fromBuild? 'resources/app/extensions' : 'data/extensions';
	
	targetRoot = resolve(fromBuild? targetRoot : VSCODE_ROOT, targetPath);
	sourceRoot = resolve(sourceRoot, 'extensions.kendryte');
	
	return {targetRoot, sourceRoot};
}