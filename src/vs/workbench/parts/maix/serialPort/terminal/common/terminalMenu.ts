/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as nls from 'vs/nls';
import { MenuId, MenuRegistry } from 'vs/platform/actions/common/actions';
import { SERIAL_MONITOR_COMMAND_ID } from 'vs/workbench/parts/maix/serialPort/terminal/common/terminalCommands';
import { ContextKeyExpr } from 'vs/platform/contextkey/common/contextkey';

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
			id: SERIAL_MONITOR_COMMAND_ID.CONFIG,
			title: nls.localize({ key: 'miConfigSerialMonitor', comment: ['&& denotes a mnemonic'] }, '&&Config Serial Port'),
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
	MenuRegistry.appendMenuItem(MenuIdItem, {
		group: runGroup,
		command: {
			id: SERIAL_MONITOR_COMMAND_ID.RUN_ACTIVE_FILE,
			title: nls.localize({ key: 'miRunActiveFile', comment: ['&& denotes a mnemonic'] }, 'Run &&Active File'),
		},
		order: 2,
	});
	MenuRegistry.appendMenuItem(MenuIdItem, {
		group: runGroup,
		command: {
			id: SERIAL_MONITOR_COMMAND_ID.RUN_SELECTED_TEXT,
			title: nls.localize({ key: 'miRunSelectedText', comment: ['&& denotes a mnemonic'] }, 'Run &&Selected Text'),
		},
		order: 3,
	});

	// Navigation
	const navigationGroup = '3_navigation';
	MenuRegistry.appendMenuItem(MenuIdItem, {
		group: navigationGroup,
		command: {
			id: SERIAL_MONITOR_COMMAND_ID.SCROLL_TO_PREVIOUS_COMMAND,
			title: nls.localize({ key: 'miScrollToPreviousCommand', comment: ['&& denotes a mnemonic'] }, 'Scroll To Previous Command'),
			precondition: ContextKeyExpr.has('terminalIsOpen'),
		},
		order: 1,
	});
	MenuRegistry.appendMenuItem(MenuIdItem, {
		group: navigationGroup,
		command: {
			id: SERIAL_MONITOR_COMMAND_ID.SCROLL_TO_NEXT_COMMAND,
			title: nls.localize({ key: 'miScrollToNextCommand', comment: ['&& denotes a mnemonic'] }, 'Scroll To Next Command'),
			precondition: ContextKeyExpr.has('terminalIsOpen'),
		},
		order: 2,
	});
	MenuRegistry.appendMenuItem(MenuIdItem, {
		group: navigationGroup,
		command: {
			id: SERIAL_MONITOR_COMMAND_ID.SELECT_TO_PREVIOUS_COMMAND,
			title: nls.localize({ key: 'miSelectToPreviousCommand', comment: ['&& denotes a mnemonic'] }, 'Select To Previous Command'),
			precondition: ContextKeyExpr.has('terminalIsOpen'),
		},
		order: 3,
	});
	MenuRegistry.appendMenuItem(MenuIdItem, {
		group: navigationGroup,
		command: {
			id: SERIAL_MONITOR_COMMAND_ID.SELECT_TO_NEXT_COMMAND,
			title: nls.localize({ key: 'miSelectToNextCommand', comment: ['&& denotes a mnemonic'] }, 'Select To Next Command'),
			precondition: ContextKeyExpr.has('terminalIsOpen'),
		},
		order: 4,
	});
}
