/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { KeybindingsRegistry, KeybindingWeight } from 'vs/platform/keybinding/common/keybindingsRegistry';
import { ISerialMonitorService } from 'kendryte/vs/workbench/serialPort/terminal/common/terminal';

export const enum SERIAL_MONITOR_COMMAND_ID {
	TOGGLE = 'workbench.action.kendryte.serialMonitor.toggleTerminal',
	KILL = 'workbench.action.kendryte.serialMonitor.kill',
	QUICK_KILL = 'workbench.action.kendryte.serialMonitor.quickKill',
	COPY_SELECTION = 'workbench.action.kendryte.serialMonitor.copySelection',
	SELECT_ALL = 'workbench.action.kendryte.serialMonitor.selectAll',
	DELETE_WORD_LEFT = 'workbench.action.kendryte.serialMonitor.deleteWordLeft',
	DELETE_WORD_RIGHT = 'workbench.action.kendryte.serialMonitor.deleteWordRight',
	MOVE_TO_LINE_START = 'workbench.action.kendryte.serialMonitor.moveToLineStart',
	MOVE_TO_LINE_END = 'workbench.action.kendryte.serialMonitor.moveToLineEnd',
	NEW = 'workbench.action.kendryte.serialMonitor.new',
	CONFIG = 'workbench.action.kendryte.serialMonitor.config',
	FOCUS_PREVIOUS_PANE = 'workbench.action.kendryte.serialMonitor.focusPreviousPane',
	FOCUS_NEXT_PANE = 'workbench.action.kendryte.serialMonitor.focusNextPane',
	RESIZE_PANE_LEFT = 'workbench.action.kendryte.serialMonitor.resizePaneLeft',
	RESIZE_PANE_RIGHT = 'workbench.action.kendryte.serialMonitor.resizePaneRight',
	RESIZE_PANE_UP = 'workbench.action.kendryte.serialMonitor.resizePaneUp',
	RESIZE_PANE_DOWN = 'workbench.action.kendryte.serialMonitor.resizePaneDown',
	FOCUS_NEXT = 'workbench.action.kendryte.serialMonitor.focusNext',
	FOCUS_PREVIOUS = 'workbench.action.kendryte.serialMonitor.focusPrevious',
	PASTE = 'workbench.action.kendryte.serialMonitor.paste',
	SELECT_DEFAULT_SHELL = 'workbench.action.kendryte.serialMonitor.selectDefaultShell',
	RUN_SELECTED_TEXT = 'workbench.action.kendryte.serialMonitor.runSelectedText',
	RUN_ACTIVE_FILE = 'workbench.action.kendryte.serialMonitor.runActiveFile',
	SWITCH_TERMINAL = 'workbench.action.kendryte.serialMonitor.switchTerminal',
	SCROLL_DOWN_LINE = 'workbench.action.kendryte.serialMonitor.scrollDown',
	SCROLL_DOWN_PAGE = 'workbench.action.kendryte.serialMonitor.scrollDownPage',
	SCROLL_TO_BOTTOM = 'workbench.action.kendryte.serialMonitor.scrollToBottom',
	SCROLL_UP_LINE = 'workbench.action.kendryte.serialMonitor.scrollUp',
	SCROLL_UP_PAGE = 'workbench.action.kendryte.serialMonitor.scrollUpPage',
	SCROLL_TO_TOP = 'workbench.action.kendryte.serialMonitor.scrollToTop',
	CLEAR = 'workbench.action.kendryte.serialMonitor.clear',
	CLEAR_SELECTION = 'workbench.action.kendryte.serialMonitor.clearSelection',
	RENAME = 'workbench.action.kendryte.serialMonitor.rename',
	FIND_WIDGET_FOCUS = 'workbench.action.kendryte.serialMonitor.focusFindWidget',
	FIND_WIDGET_HIDE = 'workbench.action.kendryte.serialMonitor.hideFindWidget',
	QUICK_OPEN_TERM = 'workbench.action.kendryte.quickOpenTerm',
	SCROLL_TO_PREVIOUS_COMMAND = 'workbench.action.kendryte.serialMonitor.scrollToPreviousCommand',
	SCROLL_TO_NEXT_COMMAND = 'workbench.action.kendryte.serialMonitor.scrollToNextCommand',
	SELECT_TO_PREVIOUS_COMMAND = 'workbench.action.kendryte.serialMonitor.selectToPreviousCommand',
	SELECT_TO_NEXT_COMMAND = 'workbench.action.kendryte.serialMonitor.selectToNextCommand',
	SELECT_TO_PREVIOUS_LINE = 'workbench.action.kendryte.serialMonitor.selectToPreviousLine',
	SELECT_TO_NEXT_LINE = 'workbench.action.kendryte.serialMonitor.selectToNextLine',
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
			id: `workbench.action.kendryte.serialMonitor.focusAtIndex${visibleIndex}`,
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