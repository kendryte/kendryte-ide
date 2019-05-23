import { IConstructorSignature0 } from 'vs/platform/instantiation/common/instantiation';

const _registry: IMainContributionSignature[] = [];

export interface IMainContribution {
	// Marker Interface
}

export type IMainContributionSignature = IConstructorSignature0<IMainContribution>;

export function registerMainContribution<T>(ctor: IMainContributionSignature): void {
	_registry.push(ctor);
}

export function getMainContributions(): ReadonlyArray<IMainContributionSignature> {
	return _registry;
}
