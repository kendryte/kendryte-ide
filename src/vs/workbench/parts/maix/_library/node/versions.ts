// @return ['exact platform name', 'fallback name 1', 'fallback name 2']
import * as os from 'os';
import { isWindows } from 'vs/base/common/platform';

export const executableExtension = isWindows ? '.exe' : '';
export const is64Bit = os.arch() === 'x64';
