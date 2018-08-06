/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { KeybindingsRegistry, KeybindingWeight } from 'vs/platform/keybinding/common/keybindingsRegistry';
import { ISerialMonitorService } from 'vs/workbench/parts/maix/serialPort/terminal/common/terminal';

export const enum SERIAL_MONITOR_COMMAND_ID {
	TOGGLE = 'workbench.action.serialMonitor.toggleTerminal',
	KILL = 'workbench.action.serialMonitor.kill',
	QUICK_KILL = 'workbench.action.serialMonitor.quickKill',
	COPY_SELECTION = 'workbench.action.serialMonitor.copySelection',
	SELECT_ALL = 'workbench.action.serialMonitor.selectAll',
	DELETE_WORD_LEFT = 'workbench.action.serialMonitor.deleteWordLeft',
	DELETE_WORD_RIGHT = 'workbench.action.serialMonitor.deleteWordRight',
	MOVE_TO_LINE_START = 'workbench.action.serialMonitor.moveToLineStart',
	MOVE_TO_LINE_END = 'workbench.action.serialMonitor.moveToLineEnd',
	NEW = 'workbench.action.serialMonitor.new',
	CONFIG = 'workbench.action.serialMonitor.config',
	FOCUS_PREVIOUS_PANE = 'workbench.action.serialMonitor.focusPreviousPane',
	FOCUS_NEXT_PANE = 'workbench.action.serialMonitor.focusNextPane',
	RESIZE_PANE_LEFT = 'workbench.action.serialMonitor.resizePaneLeft',
	RESIZE_PANE_RIGHT = 'workbench.action.serialMonitor.resizePaneRight',
	RESIZE_PANE_UP = 'workbench.action.serialMonitor.resizePaneUp',
	RESIZE_PANE_DOWN = 'workbench.action.serialMonitor.resizePaneDown',
	FOCUS = 'workbench.action.serialMonitor.focus',
	FOCUS_NEXT = 'workbench.action.serialMonitor.focusNext',
	FOCUS_PREVIOUS = 'workbench.action.serialMonitor.focusPrevious',
	PASTE = 'workbench.action.serialMonitor.paste',
	SELECT_DEFAULT_SHELL = 'workbench.action.serialMonitor.selectDefaultShell',
	RUN_SELECTED_TEXT = 'workbench.action.serialMonitor.runSelectedText',
	RUN_ACTIVE_FILE = 'workbench.action.serialMonitor.runActiveFile',
	SWITCH_TERMINAL = 'workbench.action.serialMonitor.switchTerminal',
	SCROLL_DOWN_LINE = 'workbench.action.serialMonitor.scrollDown',
	SCROLL_DOWN_PAGE = 'workbench.action.serialMonitor.scrollDownPage',
	SCROLL_TO_BOTTOM = 'workbench.action.serialMonitor.scrollToBottom',
	SCROLL_UP_LINE = 'workbench.action.serialMonitor.scrollUp',
	SCROLL_UP_PAGE = 'workbench.action.serialMonitor.scrollUpPage',
	SCROLL_TO_TOP = 'workbench.action.serialMonitor.scrollToTop',
	CLEAR = 'workbench.action.serialMonitor.clear',
	CLEAR_SELECTION = 'workbench.action.serialMonitor.clearSelection',
	RENAME = 'workbench.action.serialMonitor.rename',
	FIND_WIDGET_FOCUS = 'workbench.action.serialMonitor.focusFindWidget',
	FIND_WIDGET_HIDE = 'workbench.action.serialMonitor.hideFindWidget',
	QUICK_OPEN_TERM = 'workbench.action.quickOpenTerm',
	SCROLL_TO_PREVIOUS_COMMAND = 'workbench.action.serialMonitor.scrollToPreviousCommand',
	SCROLL_TO_NEXT_COMMAND = 'workbench.action.serialMonitor.scrollToNextCommand',
	SELECT_TO_PREVIOUS_COMMAND = 'workbench.action.serialMonitor.selectToPreviousCommand',
	SELECT_TO_NEXT_COMMAND = 'workbench.action.serialMonitor.selectToNextCommand',
	SELECT_TO_PREVIOUS_LINE = 'workbench.action.serialMonitor.selectToPreviousLine',
	SELECT_TO_NEXT_LINE = 'workbench.action.serialMonitor.selectToNextLine',
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
			id: `workbench.action.serialMonitor.focusAtIndex${visibleIndex}`,
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