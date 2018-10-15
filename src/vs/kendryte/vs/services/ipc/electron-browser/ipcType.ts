import { createDecorator, ServiceIdentifier } from 'vs/platform/instantiation/common/instantiation';

export interface IKendryteClientService {
	_serviceBrand: any;

	markEvents<T>(service: ServiceIdentifier<T>, events: (keyof T)[]);
	markMethod<T>(service: ServiceIdentifier<T>, methods: (keyof T)[]);
	markEventMethod<T>(service: ServiceIdentifier<T>, ems: (keyof T)[]);
	as<T>(service: ServiceIdentifier<T>): T;
}

export const IKendryteClientService = createDecorator<IKendryteClientService>('kendryteIPCService');
