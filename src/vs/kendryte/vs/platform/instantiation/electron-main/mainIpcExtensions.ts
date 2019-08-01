import { IConstructorSignature0, ServiceIdentifier } from 'vs/platform/instantiation/common/instantiation';
import { SyncDescriptor } from 'vs/platform/instantiation/common/descriptors';
import { IChannel } from 'vs/base/parts/ipc/common/ipc';
import { IServiceContribution } from 'vs/kendryte/vs/platform/instantiation/common/mainExtensions';

const _registry: IServiceContribution<IChannel>[] = [];

export function registerMainIPC<T extends IChannel>(id: ServiceIdentifier<T>, ctor: IConstructorSignature0<T>): void {
	_registry.push({ id, descriptor: new SyncDescriptor<T>(ctor) });
}

export function getMainIPCs(): IServiceContribution<IChannel>[] {
	return _registry;
}
