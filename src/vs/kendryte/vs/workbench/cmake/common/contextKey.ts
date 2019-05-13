import { RawContextKey } from 'vs/platform/contextkey/common/contextkey';

export const CONTEXT_CMAKE_CONFIGURE_SEEMS_OK = new RawContextKey<boolean>('cmakeProjectStatusOk', false);
export const CONTEXT_CMAKE_CURRENT_IS_PROJECT = new RawContextKey<boolean>('cmakeProjectWorking', false);
