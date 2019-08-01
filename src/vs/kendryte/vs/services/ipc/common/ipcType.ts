import { createDecorator, ServiceIdentifier } from 'vs/platform/instantiation/common/instantiation';
import { Event } from 'vs/base/common/event';
import { ChannelLogger } from 'vs/kendryte/vs/services/channelLogger/common/logger';

export const symbolIpcObj = Symbol('ipc-object');

export interface IPCServiceCaller {
	_callService(id: string, method: string, args: any[]): Promise<any>;
	_listenService(id: string, method: string, args?: any[]): Event<any>;
	_listenLogger(logger: ChannelLogger): void;
}

export interface IPCServiceAttachedData {
	readonly [symbolIpcObj]?: IPCServiceCaller;
}

export interface IKendryteClientService {
	_serviceBrand: any;

	/** @deprecated */
	markEvents<T>(service: ServiceIdentifier<T>, events: (keyof T)[]): void;
	/** @deprecated */
	markMethod<T>(service: ServiceIdentifier<T>, methods: (keyof T)[]): void;
	/** @deprecated */
	markEventMethod<T>(service: ServiceIdentifier<T>, ems: (keyof T)[]): void;
	/** @deprecated */
	as<T>(service: ServiceIdentifier<T>): T;

	isMeFirst(): Thenable<boolean>;
	initService<T extends { _serviceBrand: any }>(param: T, iinterface: ServiceIdentifier<T>): void;
}

export const IKendryteClientService = createDecorator<IKendryteClientService>('kendryteIPCService');

export function MainThreadMethod<T extends IPCServiceAttachedData>(id: ServiceIdentifier<T>): MethodDecorator {
	const idstr = id.toString();
	return (serviceType: T, method: string, desc: TypedPropertyDescriptor<any>) => {
		desc.value = function (this: T, ...arg: any[]) {
			return this[symbolIpcObj]!._callService(idstr, method, arg);
		};
		return desc;
	};
}

export function MainThreadEvent<T extends IPCServiceAttachedData>(id: ServiceIdentifier<T>): MethodDecorator {
	const idstr = id.toString();
	return (serviceType: T, event: string, desc: TypedPropertyDescriptor<any>) => {
		desc.get = function (this: T) {
			return this[symbolIpcObj]!._listenService(idstr, event);
		};
		return desc;
	};
}

export function MainThreadEventMethod<T extends IPCServiceAttachedData>(id: ServiceIdentifier<T>): MethodDecorator {
	const idstr = id.toString();
	return (serviceType: T, event: string, desc: TypedPropertyDescriptor<any>) => {
		desc.value = function (this: T, ...arg: any[]) {
			return this[symbolIpcObj]!._listenService(idstr, event, ...arg);
		};
		return desc;
	};
}
