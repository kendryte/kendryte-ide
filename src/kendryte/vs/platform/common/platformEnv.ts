import { isWindows } from 'vs/base/common/platform';

export const PathListSep = isWindows ? ';' : ':';
export const ShellExportCommand = isWindows ? 'SET' : 'export';
