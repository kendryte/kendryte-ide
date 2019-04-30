import { _util, IInstantiationService, optional } from 'vs/platform/instantiation/common/instantiation';

export function createSuperServices<T extends { _serviceBrand: any }>(superClass: any, instantiationService: IInstantiationService): T[] {
	return instantiationService.invokeFunction((access) => {
		let serviceDependencies = _util.getServiceDependencies(superClass).sort((a, b) => a.index - b.index);
		let serviceArgs: any[] = [];
		for (const dependency of serviceDependencies) {
			const service = access.get(dependency.id, dependency.optional ? optional : undefined);
			serviceArgs.push(service);
		}

		return serviceArgs;
	});
}
