/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import { SyncDescriptor } from 'vs/platform/instantiation/common/descriptors';
import { IConstructorSignature0, ServiceIdentifier } from 'vs/platform/instantiation/common/instantiation';
import { getSingletonServiceDescriptors } from 'vs/platform/instantiation/common/extensions';

export interface IServiceContribution<T> {
	id: ServiceIdentifier<T>;
	descriptor: SyncDescriptor<T>;
}

const _registry: IServiceContribution<any>[] = [];

export function registerMainSingleton<T>(id: ServiceIdentifier<T>, ctor: IConstructorSignature0<T>): void {
	_registry.push({ id, descriptor: new SyncDescriptor<T>(ctor) });
}

export function getMainServices(): IServiceContribution<any>[] {
	return _registry;
}

getSingletonServiceDescriptors();
