import { ConsoleLogMainService, ConsoleLogService, ILogService } from 'vs/platform/log/common/log';
import { isNative } from 'vs/base/common/platform';

const isMain = isNative && process.type === 'browser';

export const defaultConsoleLogger: ILogService = isMain ? new ConsoleLogMainService() : new ConsoleLogService();
