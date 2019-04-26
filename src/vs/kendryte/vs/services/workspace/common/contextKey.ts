import { RawContextKey } from 'vs/platform/contextkey/common/contextkey';

export const CONTEXT_KENDRYTE_NOT_EMPTY = new RawContextKey<boolean>('workspaceNotEmpty', false);
export const CONTEXT_KENDRYTE_MULTIPLE_PROJECT = new RawContextKey<boolean>('usingMultipleFolders', false);
