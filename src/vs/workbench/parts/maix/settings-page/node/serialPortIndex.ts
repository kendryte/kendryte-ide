/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import { list } from 'serialport';
import { Registry } from 'vs/platform/registry/common/platform';
import { KeyCode, KeyMod } from 'vs/base/common/keyCodes';
import { Extensions as ActionExtensions, IWorkbenchActionRegistry } from 'vs/workbench/common/actions';
import { MenuId, MenuRegistry, SyncActionDescriptor } from 'vs/platform/actions/common/actions';
import { Action } from 'vs/base/common/actions';
import { localize } from 'vs/nls';
import { TPromise } from 'vs/base/common/winjs.base';
import { Extensions as ConfigurationExtensions, IConfigurationRegistry } from 'vs/platform/configuration/common/configurationRegistry';
import { Emitter } from 'vs/base/common/event';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { array_has_diff } from 'vs/workbench/parts/maix/settings-page/common/utils';
import { EnumProviderService } from 'vs/workbench/parts/maix/settings-page/common/type';

const category = localize('serialport', 'Serial Port');

export interface ISerialPortService extends EnumProviderService {
	_serviceBrand: any;
}

const ISerialPortService = createDecorator<ISerialPortService>('serialPortService');

class SerialPortService implements ISerialPortService {
	_serviceBrand: any;
	private devices: string[];

	private devicesListChange = new Emitter<string[]>();

	protected cachedPromise: TPromise<void>;

	constructor() {
		this.devices = [];
		this.refreshDevices();
	}

	public refreshDevices(): TPromise<void> {
		if (this.cachedPromise) {
			return this.cachedPromise;
		}
		this.cachedPromise = this._refreshDevices();
		this.cachedPromise.done(() => {
			delete this.cachedPromise;
		});
		return this.cachedPromise;
	}

	private async _refreshDevices(): TPromise<void> {
		const dList = await list();
		const newList = dList.map((item) => {
			return item.comName;
		});
		if (array_has_diff(newList, this.devices)) {
			this.devices = newList.slice();
			Object.freeze(this.devices);
			this.devicesListChange.fire(newList);
		}
	}

	public getValues(): string[] {
		return this.devices;
	}

	public onChange(cb) {
		return this.devicesListChange.event(cb);
	}
}

registerSingleton(ISerialPortService, SerialPortService);

class ReloadSerialPortDevicesAction extends Action {
	public static readonly ID = 'ReloadSerialPortDevicesAction';
	public static readonly LABEL = localize('serialport.reloadDevice.title', 'Reload device list');

	constructor(
		id: string,
		label: string,
		@ISerialPortService private serialPortService: ISerialPortService,
	) {
		super(id, label);
	}

	public async run(event?: any): TPromise<string[]> {
		await this.serialPortService.refreshDevices();
		return this.serialPortService.getValues();
	}
}

Registry.as<IWorkbenchActionRegistry>(ActionExtensions.WorkbenchActions)
	.registerWorkbenchAction(new SyncActionDescriptor(ReloadSerialPortDevicesAction, ReloadSerialPortDevicesAction.ID, ReloadSerialPortDevicesAction.LABEL, { primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.US_COMMA }), 'Maix: OpenSettingsAlias', category);

MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
	command: {
		id: ReloadSerialPortDevicesAction.ID,
		title: `${category}: ${ReloadSerialPortDevicesAction.LABEL}`,
	},
});

Registry.as<IConfigurationRegistry>(ConfigurationExtensions.Configuration).registerConfiguration({
	id: 'serialport',
	overridable: true,
	properties: {
		'serialport.device': {
			title: localize('serialport.device.title', 'UART Device'),
			type: 'string',
			enumSource: ISerialPortService,
			enumEditable: true,
			description: localize('serialport.device.desc', 'Select Device'),
			overridable: true,
		} as any,
		'serialport.reloadDevice': {
			title: localize('serialport.reloadDevice.title', 'Reload device list'),
			type: 'button',
			description: localize('serialport.reloadDevice.desc', 'Reload device list'),
			overridable: false,
			default: ReloadSerialPortDevicesAction.ID,
		},
	}
});
