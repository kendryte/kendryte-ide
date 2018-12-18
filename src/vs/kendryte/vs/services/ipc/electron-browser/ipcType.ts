import { createDecorator, ServiceIdentifier } from 'vs/platform/instantiation/common/instantiation';

export interface IKendryteClientService {
	_serviceBrand: any;

	/** @deprecated */
	markEvents<T>(service: ServiceIdentifier<T>, events: (keyof T)[]);
	/** @deprecated */
	markMethod<T>(service: ServiceIdentifier<T>, methods: (keyof T)[]);
	/** @deprecated */
	markEventMethod<T>(service: ServiceIdentifier<T>, ems: (keyof T)[]);
	/** @deprecated */
	as<T>(service: ServiceIdentifier<T>): T;

	isMeFirst(): Thenable<boolean>;
	initService<T>(param: T, iinterface: ServiceIdentifier<T>): void;
}

export const IKendryteClientService = createDecorator<IKendryteClientService>('kendryteIPCService');

export const symbolIpcObj = Symbol('ipc-object');

export function MainThreadMethod<T>(id: ServiceIdentifier<T>): MethodDecorator {
	const idstr = id.toString();
	return (serviceType: T, method: string, desc: TypedPropertyDescriptor<any>) => {
		desc.value = function (this: T, ...arg: any[]) {
			return this[symbolIpcObj]._callService(idstr, method, arg);
		};
		return desc;
	};
}

export function MainThreadEvent<T>(id: ServiceIdentifier<T>): MethodDecorator {
	const idstr = id.toString();
	return (serviceType: T, event: string, desc: TypedPropertyDescriptor<any>) => {
		desc.get = function (this: T,) {
			return this[symbolIpcObj]._listenService(idstr, event);
		};
		return desc;
	};
}

export function MainThreadEventMethod<T>(id: ServiceIdentifier<T>): MethodDecorator {
	const idstr = id.toString();
	return (serviceType: T, event: string, desc: TypedPropertyDescriptor<any>) => {
		desc.value = function (this: T, ...arg: any[]) {
			return this[symbolIpcObj]._listenService(idstr, event, ...arg);
		};
		return desc;
	};
}
