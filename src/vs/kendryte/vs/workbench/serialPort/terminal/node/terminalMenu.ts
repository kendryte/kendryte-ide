/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as nls from 'vs/nls';
import { MenuId, MenuRegistry } from 'vs/platform/actions/common/actions';
import { SERIAL_MONITOR_COMMAND_ID } from 'vs/kendryte/vs/workbench/serialPort/terminal/common/terminalCommands';
import { ContextKeyExpr } from 'vs/platform/contextkey/common/contextkey';
import { ReloadSerialPortDevicesAction } from 'vs/kendryte/vs/workbench/serialPort/node/reloadAction';

export function setupTerminalMenu() {
	const MenuIdItem = new MenuId();

	// View menu

	MenuRegistry.appendMenuItem(MenuId.MenubarViewMenu, {
		group: '4_panels',
		command: {
			id: SERIAL_MONITOR_COMMAND_ID.TOGGLE,
			title: nls.localize({ key: 'miToggleIntegratedSerialMonitor', comment: ['&& denotes a mnemonic'] }, '&&Integrated Serial Monitor'),
		},
		order: 3,
	});

	// Manage
	const manageGroup = '1_manage';
	MenuRegistry.appendMenuItem(MenuIdItem, {
		group: manageGroup,
		command: {
			id: SERIAL_MONITOR_COMMAND_ID.NEW,
			title: nls.localize({ key: 'miNewSerialMonitor', comment: ['&& denotes a mnemonic'] }, '&&New Serial Monitor'),
		},
		order: 1,
	});

	MenuRegistry.appendMenuItem(MenuIdItem, {
		group: manageGroup,
		command: {
			id: ReloadSerialPortDevicesAction.ID,
			title: ReloadSerialPortDevicesAction.LABEL,
		},
		order: 2,
	});

	MenuRegistry.appendMenuItem(MenuIdItem, {
		group: manageGroup,
		command: {
			id: SERIAL_MONITOR_COMMAND_ID.KILL,
			title: nls.localize({ key: 'miKillSerialMonitor', comment: ['&& denotes a mnemonic'] }, '&&Kill Serial Monitor'),
			precondition: ContextKeyExpr.has('terminalIsOpen'),
		},
		order: 3,
	});

	// Run
	const runGroup = '2_run';
	MenuRegistry.appendMenuItem(MenuIdItem, {
		group: runGroup,
		command: {
			id: SERIAL_MONITOR_COMMAND_ID.CLEAR,
			title: nls.localize({ key: 'miClear', comment: ['&& denotes a mnemonic'] }, '&&Clear'),
			precondition: ContextKeyExpr.has('terminalIsOpen'),
		},
		order: 1,
	});
}
