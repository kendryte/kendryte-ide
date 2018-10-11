import { createDecorator } from 'vs/platform/instantiation/common/instantiation';

export interface IKendryteServerService {
	_serviceBrand: any;

}

export const IKendryteServerService = createDecorator<IKendryteServerService>('kendryteIPCService');
