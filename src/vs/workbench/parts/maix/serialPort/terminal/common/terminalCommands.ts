/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { KeybindingsRegistry, KeybindingWeight } from 'vs/platform/keybinding/common/keybindingsRegistry';
import { ISerialMonitorService } from 'vs/workbench/parts/maix/serialPort/terminal/common/terminal';

export const enum SERIAL_MONITOR_COMMAND_ID {
	TOGGLE = 'workbench.action.maix.serialMonitor.toggleTerminal',
	KILL = 'workbench.action.maix.serialMonitor.kill',
	QUICK_KILL = 'workbench.action.maix.serialMonitor.quickKill',
	COPY_SELECTION = 'workbench.action.maix.serialMonitor.copySelection',
	SELECT_ALL = 'workbench.action.maix.serialMonitor.selectAll',
	DELETE_WORD_LEFT = 'workbench.action.maix.serialMonitor.deleteWordLeft',
	DELETE_WORD_RIGHT = 'workbench.action.maix.serialMonitor.deleteWordRight',
	MOVE_TO_LINE_START = 'workbench.action.maix.serialMonitor.moveToLineStart',
	MOVE_TO_LINE_END = 'workbench.action.maix.serialMonitor.moveToLineEnd',
	NEW = 'workbench.action.maix.serialMonitor.new',
	CONFIG = 'workbench.action.maix.serialMonitor.config',
	FOCUS_PREVIOUS_PANE = 'workbench.action.maix.serialMonitor.focusPreviousPane',
	FOCUS_NEXT_PANE = 'workbench.action.maix.serialMonitor.focusNextPane',
	RESIZE_PANE_LEFT = 'workbench.action.maix.serialMonitor.resizePaneLeft',
	RESIZE_PANE_RIGHT = 'workbench.action.maix.serialMonitor.resizePaneRight',
	RESIZE_PANE_UP = 'workbench.action.maix.serialMonitor.resizePaneUp',
	RESIZE_PANE_DOWN = 'workbench.action.maix.serialMonitor.resizePaneDown',
	FOCUS_NEXT = 'workbench.action.maix.serialMonitor.focusNext',
	FOCUS_PREVIOUS = 'workbench.action.maix.serialMonitor.focusPrevious',
	PASTE = 'workbench.action.maix.serialMonitor.paste',
	SELECT_DEFAULT_SHELL = 'workbench.action.maix.serialMonitor.selectDefaultShell',
	RUN_SELECTED_TEXT = 'workbench.action.maix.serialMonitor.runSelectedText',
	RUN_ACTIVE_FILE = 'workbench.action.maix.serialMonitor.runActiveFile',
	SWITCH_TERMINAL = 'workbench.action.maix.serialMonitor.switchTerminal',
	SCROLL_DOWN_LINE = 'workbench.action.maix.serialMonitor.scrollDown',
	SCROLL_DOWN_PAGE = 'workbench.action.maix.serialMonitor.scrollDownPage',
	SCROLL_TO_BOTTOM = 'workbench.action.maix.serialMonitor.scrollToBottom',
	SCROLL_UP_LINE = 'workbench.action.maix.serialMonitor.scrollUp',
	SCROLL_UP_PAGE = 'workbench.action.maix.serialMonitor.scrollUpPage',
	SCROLL_TO_TOP = 'workbench.action.maix.serialMonitor.scrollToTop',
	CLEAR = 'workbench.action.maix.serialMonitor.clear',
	CLEAR_SELECTION = 'workbench.action.maix.serialMonitor.clearSelection',
	RENAME = 'workbench.action.maix.serialMonitor.rename',
	FIND_WIDGET_FOCUS = 'workbench.action.maix.serialMonitor.focusFindWidget',
	FIND_WIDGET_HIDE = 'workbench.action.maix.serialMonitor.hideFindWidget',
	QUICK_OPEN_TERM = 'workbench.action.maix.quickOpenTerm',
	SCROLL_TO_PREVIOUS_COMMAND = 'workbench.action.maix.serialMonitor.scrollToPreviousCommand',
	SCROLL_TO_NEXT_COMMAND = 'workbench.action.maix.serialMonitor.scrollToNextCommand',
	SELECT_TO_PREVIOUS_COMMAND = 'workbench.action.maix.serialMonitor.selectToPreviousCommand',
	SELECT_TO_NEXT_COMMAND = 'workbench.action.maix.serialMonitor.selectToNextCommand',
	SELECT_TO_PREVIOUS_LINE = 'workbench.action.maix.serialMonitor.selectToPreviousLine',
	SELECT_TO_NEXT_LINE = 'workbench.action.maix.serialMonitor.selectToNextLine',
	TOGGLE_ESCAPE_SEQUENCE_LOGGING = 'toggleEscapeSequenceLogging'
}


export function setupTerminalCommands(): void {
	registerOpenTerminalAtIndexCommands();
}

function registerOpenTerminalAtIndexCommands(): void {
	for (let i = 0; i < 9; i++) {
		const terminalIndex = i;
		const visibleIndex = i + 1;

		KeybindingsRegistry.registerCommandAndKeybindingRule({
			id: `workbench.action.maix.serialMonitor.focusAtIndex${visibleIndex}`,
			weight: KeybindingWeight.WorkbenchContrib,
			when: void 0,
			primary: null,
			handler: accessor => {
				const terminalService = accessor.get(ISerialMonitorService);
				terminalService.setActiveInstanceByIndex(terminalIndex);
				return terminalService.showPanel(true);
			}
		});
	}
}