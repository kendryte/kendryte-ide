import { IPrivateReplService } from 'vs/workbench/contrib/debug/browser/repl';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';

export interface ISerialPrivateReplService extends IPrivateReplService {
}

export const ISerialPrivateReplService = createDecorator<IPrivateReplService>('serialPortReplService');
