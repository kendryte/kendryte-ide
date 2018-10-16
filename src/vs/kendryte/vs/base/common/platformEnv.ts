import { isWindows } from 'vs/base/common/platform';

export const PathListSep = isWindows ? ';' : ':';
export const ShellExportCommand = isWindows ? 'SET' : 'export';

export const executableExtension = isWindows ? '.exe' : '';
export const is64Bit = process.arch === 'x64';
