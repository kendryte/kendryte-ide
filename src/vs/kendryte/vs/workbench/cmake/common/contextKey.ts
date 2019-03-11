import { RawContextKey } from 'vs/platform/contextkey/common/contextkey';

export const CONTEXT_CMAKE_SEEMS_OK = new RawContextKey<boolean>('cmakeProjectStatusOk', false);
export const CONTEXT_CMAKE_WORKING = new RawContextKey<boolean>('cmakeProjectWorking', false);
