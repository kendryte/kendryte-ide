import { IWorkspaceFolder } from 'vs/platform/workspace/common/workspace';
import { resolve } from 'path';

export const startsWithFileSchema = /^file:\/\//;

export function resolveFrom(resolver: IWorkspaceFolder, relate: string) {
	return resolver.toResource(relate).toString().replace(startsWithFileSchema, '');
}

export function resolveAbsolute(base: string, relate: string) {
	return resolve(base, relate).replace(startsWithFileSchema, '');
}