import { IWorkspaceFolder } from 'vs/platform/workspace/common/workspace';
import { resolvePath } from 'vs/workbench/parts/maix/_library/node/resolvePath';

export const startsWithFileSchema = /^file:\/\//;

/** @deprecated */
export function resolveFrom(resolver: IWorkspaceFolder, relate: string) {
	return resolvePath(resolver.toResource(relate).toString().replace(startsWithFileSchema, ''));
}

/** @deprecated */
export function resolveAbsolute(base: string, relate: string) {
	return resolvePath(base.replace(startsWithFileSchema, ''), relate);
}