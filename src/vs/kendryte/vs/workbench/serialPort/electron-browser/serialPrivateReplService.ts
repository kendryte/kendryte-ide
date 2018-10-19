import { IPrivateReplService } from 'vs/workbench/parts/debug/electron-browser/repl';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';

export interface ISerialPrivateReplService extends IPrivateReplService {
}

export const ISerialPrivateReplService = createDecorator<IPrivateReplService>('serialPortReplService');
