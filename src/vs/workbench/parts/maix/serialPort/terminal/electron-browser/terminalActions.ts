/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as nls from 'vs/nls';
import * as os from 'os';
import { Action, IAction } from 'vs/base/common/actions';
import { EndOfLinePreference } from 'vs/editor/common/model';
import { ICodeEditorService } from 'vs/editor/browser/services/codeEditorService';
import { Direction, ISerialMonitorService, TERMINAL_PANEL_ID } from 'vs/workbench/parts/maix/serialPort/terminal/common/terminal';
import { SelectActionItem } from 'vs/base/browser/ui/actionbar/actionbar';
import { TPromise } from 'vs/base/common/winjs.base';
import { TogglePanelAction } from 'vs/workbench/browser/panel';
import { IPartService } from 'vs/workbench/services/part/common/partService';
import { IPanelService } from 'vs/workbench/services/panel/common/panelService';
import { attachSelectBoxStyler } from 'vs/platform/theme/common/styler';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IQuickOpenService } from 'vs/platform/quickOpen/common/quickOpen';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { ActionBarContributor } from 'vs/workbench/browser/actions';
import { TerminalEntry } from 'vs/workbench/parts/maix/serialPort/terminal/browser/terminalQuickOpen';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { SERIAL_MONITOR_COMMAND_ID } from 'vs/workbench/parts/maix/serialPort/terminal/common/terminalCommands';
import { ISerialPortService } from 'vs/workbench/parts/maix/serialPort/common/type';

export const TERMINAL_PICKER_PREFIX = 'term ';

export class ToggleTerminalAction extends TogglePanelAction {

	public static readonly ID = SERIAL_MONITOR_COMMAND_ID.TOGGLE;
	public static readonly LABEL = nls.localize('workbench.action.maix.terminal.toggleTerminal', 'Toggle Integrated Terminal');

	constructor(
		id: string, label: string,
		@IPanelService panelService: IPanelService,
		@IPartService partService: IPartService,
		@ISerialMonitorService private terminalService: ISerialMonitorService,
		@ICommandService private commandService: ICommandService,
	) {
		super(id, label, TERMINAL_PANEL_ID, panelService, partService);
	}

	public run(event?: any): TPromise<any> {
		if (this.terminalService.terminalInstances.length === 0) {
			return this.commandService.executeCommand(SERIAL_MONITOR_COMMAND_ID.NEW);
		}
		return super.run();
	}
}

export class KillTerminalAction extends Action {

	public static readonly ID = SERIAL_MONITOR_COMMAND_ID.KILL;
	public static readonly LABEL = nls.localize('workbench.action.maix.terminal.kill', 'Kill the Active Monitor Instance');
	public static readonly PANEL_LABEL = nls.localize('workbench.action.maix.terminal.kill.short', 'Kill Monitor');

	constructor(
		id: string, label: string,
		@ISerialMonitorService private terminalService: ISerialMonitorService,
	) {
		super(id, label, 'terminal-action kill');
	}

	public run(event?: any): TPromise<any> {
		const instance = this.terminalService.getActiveInstance();
		if (instance) {
			instance.dispose();
			if (this.terminalService.terminalInstances.length > 0) {
				this.terminalService.showPanel(true);
			}
		}
		return TPromise.as(void 0);
	}
}

export class QuickKillTerminalAction extends Action {

	public static readonly ID = SERIAL_MONITOR_COMMAND_ID.QUICK_KILL;
	public static readonly LABEL = nls.localize('workbench.action.maix.terminal.quickKill', 'Kill Terminal Instance');

	constructor(
		id: string, label: string,
		private terminalEntry: TerminalEntry,
		@IQuickOpenService private quickOpenService: IQuickOpenService,
	) {
		super(id, label, 'terminal-action kill');
	}

	public run(event?: any): TPromise<any> {
		const instance = this.terminalEntry.instance;
		if (instance) {
			instance.dispose();
		}
		return TPromise.timeout(50).then(result => this.quickOpenService.show(TERMINAL_PICKER_PREFIX, null));
	}
}

/**
 * Copies the terminal selection. Note that since the command palette takes focus from the terminal,
 * this cannot be triggered through the command palette.
 */
export class CopyTerminalSelectionAction extends Action {

	public static readonly ID = SERIAL_MONITOR_COMMAND_ID.COPY_SELECTION;
	public static readonly LABEL = nls.localize('workbench.action.maix.terminal.copySelection', 'Copy Selection');
	public static readonly SHORT_LABEL = nls.localize('workbench.action.maix.terminal.copySelection.short', 'Copy');

	constructor(
		id: string, label: string,
		@ISerialMonitorService private terminalService: ISerialMonitorService,
	) {
		super(id, label);
	}

	public run(event?: any): TPromise<any> {
		const terminalInstance = this.terminalService.getActiveInstance();
		if (terminalInstance) {
			terminalInstance.copySelection();
		}
		return TPromise.as(void 0);
	}
}

export class SelectAllTerminalAction extends Action {

	public static readonly ID = SERIAL_MONITOR_COMMAND_ID.SELECT_ALL;
	public static readonly LABEL = nls.localize('workbench.action.maix.terminal.selectAll', 'Select All');

	constructor(
		id: string, label: string,
		@ISerialMonitorService private terminalService: ISerialMonitorService,
	) {
		super(id, label);
	}

	public run(event?: any): TPromise<any> {
		const terminalInstance = this.terminalService.getActiveInstance();
		if (terminalInstance) {
			terminalInstance.selectAll();
		}
		return TPromise.as(void 0);
	}
}

export abstract class BaseSendTextTerminalAction extends Action {
	constructor(
		id: string,
		label: string,
		private _text: string,
		@ISerialMonitorService private readonly _terminalService: ISerialMonitorService,
	) {
		super(id, label);
	}

	public run(event?: any): TPromise<any> {
		const terminalInstance = this._terminalService.getActiveInstance();
		if (terminalInstance) {
			terminalInstance.sendText(this._text, false);
		}
		return TPromise.as(void 0);
	}
}

export class DeleteWordLeftTerminalAction extends BaseSendTextTerminalAction {
	public static readonly ID = SERIAL_MONITOR_COMMAND_ID.DELETE_WORD_LEFT;
	public static readonly LABEL = nls.localize('workbench.action.maix.terminal.deleteWordLeft', 'Delete Word Left');

	constructor(
		id: string,
		label: string,
		@ISerialMonitorService terminalService: ISerialMonitorService,
	) {
		// Send ctrl+W
		super(id, label, String.fromCharCode('W'.charCodeAt(0) - 64), terminalService);
	}
}

export class DeleteWordRightTerminalAction extends BaseSendTextTerminalAction {
	public static readonly ID = SERIAL_MONITOR_COMMAND_ID.DELETE_WORD_RIGHT;
	public static readonly LABEL = nls.localize('workbench.action.maix.terminal.deleteWordRight', 'Delete Word Right');

	constructor(
		id: string,
		label: string,
		@ISerialMonitorService terminalService: ISerialMonitorService,
	) {
		// Send alt+D
		super(id, label, '\x1bD', terminalService);
	}
}

export class MoveToLineStartTerminalAction extends BaseSendTextTerminalAction {
	public static readonly ID = SERIAL_MONITOR_COMMAND_ID.MOVE_TO_LINE_START;
	public static readonly LABEL = nls.localize('workbench.action.maix.terminal.moveToLineStart', 'Move To Line Start');

	constructor(
		id: string,
		label: string,
		@ISerialMonitorService terminalService: ISerialMonitorService,
	) {
		// Send ctrl+A
		super(id, label, String.fromCharCode('A'.charCodeAt(0) - 64), terminalService);
	}
}

export class MoveToLineEndTerminalAction extends BaseSendTextTerminalAction {
	public static readonly ID = SERIAL_MONITOR_COMMAND_ID.MOVE_TO_LINE_END;
	public static readonly LABEL = nls.localize('workbench.action.maix.terminal.moveToLineEnd', 'Move To Line End');

	constructor(
		id: string,
		label: string,
		@ISerialMonitorService terminalService: ISerialMonitorService,
	) {
		// Send ctrl+E
		super(id, label, String.fromCharCode('E'.charCodeAt(0) - 64), terminalService);
	}
}

export class CreateNewTerminalAction extends Action {

	public static readonly ID = SERIAL_MONITOR_COMMAND_ID.NEW;
	public static readonly LABEL = nls.localize('workbench.action.maix.terminal.new', 'Create New Serial Monitor');
	public static readonly SHORT_LABEL = nls.localize('workbench.action.maix.terminal.new.short', 'New Monitor');

	constructor(
		id: string, label: string,
		@ISerialMonitorService private terminalService: ISerialMonitorService,
		@ISerialPortService private serialPortService: ISerialPortService,
	) {
		super(id, label, 'terminal-action new');
	}

	public async run(event?: any): TPromise<any> {
		const dev = await this.serialPortService.quickOpenDevice();

		if (!dev) {
			return 0;
		}

		const instance = this.terminalService.createTerminal({
			name: dev,
			serialDevice: dev,
		}, true);

		if (!instance) {
			return 0;
		}

		this.terminalService.setActiveInstance(instance);
		return this.terminalService.showPanel(true);
	}
}

export class FocusPreviousPaneTerminalAction extends Action {
	public static readonly ID = SERIAL_MONITOR_COMMAND_ID.FOCUS_PREVIOUS_PANE;
	public static readonly LABEL = nls.localize('workbench.action.maix.terminal.focusPreviousPane', 'Focus Previous Pane');

	constructor(
		id: string, label: string,
		@ISerialMonitorService private readonly _terminalService: ISerialMonitorService,
	) {
		super(id, label);
	}

	public run(event?: any): TPromise<any> {
		const tab = this._terminalService.getActiveTab();
		if (!tab) {
			return TPromise.as(void 0);
		}
		tab.focusPreviousPane();
		return this._terminalService.showPanel(true);
	}
}

export class FocusNextPaneTerminalAction extends Action {
	public static readonly ID = SERIAL_MONITOR_COMMAND_ID.FOCUS_NEXT_PANE;
	public static readonly LABEL = nls.localize('workbench.action.maix.terminal.focusNextPane', 'Focus Next Pane');

	constructor(
		id: string, label: string,
		@ISerialMonitorService private readonly _terminalService: ISerialMonitorService,
	) {
		super(id, label);
	}

	public run(event?: any): TPromise<any> {
		const tab = this._terminalService.getActiveTab();
		if (!tab) {
			return TPromise.as(void 0);
		}
		tab.focusNextPane();
		return this._terminalService.showPanel(true);
	}
}

export abstract class BaseFocusDirectionTerminalAction extends Action {
	constructor(
		id: string, label: string,
		private _direction: Direction,
		@ISerialMonitorService private readonly _terminalService: ISerialMonitorService,
	) {
		super(id, label);
	}

	public run(event?: any): TPromise<any> {
		const tab = this._terminalService.getActiveTab();
		if (tab) {
			tab.resizePane(this._direction);
		}
		return TPromise.as(void 0);
	}
}

export class ResizePaneLeftTerminalAction extends BaseFocusDirectionTerminalAction {
	public static readonly ID = SERIAL_MONITOR_COMMAND_ID.RESIZE_PANE_LEFT;
	public static readonly LABEL = nls.localize('workbench.action.maix.terminal.resizePaneLeft', 'Resize Pane Left');

	constructor(
		id: string, label: string,
		@ISerialMonitorService readonly terminalService: ISerialMonitorService,
	) {
		super(id, label, Direction.Left, terminalService);
	}
}

export class ResizePaneRightTerminalAction extends BaseFocusDirectionTerminalAction {
	public static readonly ID = SERIAL_MONITOR_COMMAND_ID.RESIZE_PANE_RIGHT;
	public static readonly LABEL = nls.localize('workbench.action.maix.terminal.resizePaneRight', 'Resize Pane Right');

	constructor(
		id: string, label: string,
		@ISerialMonitorService readonly terminalService: ISerialMonitorService,
	) {
		super(id, label, Direction.Right, terminalService);
	}
}

export class ResizePaneUpTerminalAction extends BaseFocusDirectionTerminalAction {
	public static readonly ID = SERIAL_MONITOR_COMMAND_ID.RESIZE_PANE_UP;
	public static readonly LABEL = nls.localize('workbench.action.maix.terminal.resizePaneUp', 'Resize Pane Up');

	constructor(
		id: string, label: string,
		@ISerialMonitorService readonly terminalService: ISerialMonitorService,
	) {
		super(id, label, Direction.Up, terminalService);
	}
}

export class ResizePaneDownTerminalAction extends BaseFocusDirectionTerminalAction {
	public static readonly ID = SERIAL_MONITOR_COMMAND_ID.RESIZE_PANE_DOWN;
	public static readonly LABEL = nls.localize('workbench.action.maix.terminal.resizePaneDown', 'Resize Pane Down');

	constructor(
		id: string, label: string,
		@ISerialMonitorService readonly terminalService: ISerialMonitorService,
	) {
		super(id, label, Direction.Down, terminalService);
	}
}

export class FocusNextTerminalAction extends Action {

	public static readonly ID = SERIAL_MONITOR_COMMAND_ID.FOCUS_NEXT;
	public static readonly LABEL = nls.localize('workbench.action.maix.terminal.focusNext', 'Focus Next Terminal');

	constructor(
		id: string, label: string,
		@ISerialMonitorService private terminalService: ISerialMonitorService,
	) {
		super(id, label);
	}

	public run(event?: any): TPromise<any> {
		this.terminalService.setActiveTabToNext();
		return this.terminalService.showPanel(true);
	}
}

export class FocusPreviousTerminalAction extends Action {

	public static readonly ID = SERIAL_MONITOR_COMMAND_ID.FOCUS_PREVIOUS;
	public static readonly LABEL = nls.localize('workbench.action.maix.terminal.focusPrevious', 'Focus Previous Terminal');

	constructor(
		id: string, label: string,
		@ISerialMonitorService private terminalService: ISerialMonitorService,
	) {
		super(id, label);
	}

	public run(event?: any): TPromise<any> {
		this.terminalService.setActiveTabToPrevious();
		return this.terminalService.showPanel(true);
	}
}

export class TerminalPasteAction extends Action {

	public static readonly ID = SERIAL_MONITOR_COMMAND_ID.PASTE;
	public static readonly LABEL = nls.localize('workbench.action.maix.terminal.paste', 'Paste into Active Terminal');
	public static readonly SHORT_LABEL = nls.localize('workbench.action.maix.terminal.paste.short', 'Paste');

	constructor(
		id: string, label: string,
		@ISerialMonitorService private terminalService: ISerialMonitorService,
	) {
		super(id, label);
	}

	public run(event?: any): TPromise<any> {
		const instance = this.terminalService.getActiveOrCreateInstance();
		if (instance) {
			instance.paste();
		}
		return TPromise.as(void 0);
	}
}

export class SelectDefaultShellWindowsTerminalAction extends Action {

	public static readonly ID = SERIAL_MONITOR_COMMAND_ID.SELECT_DEFAULT_SHELL;
	public static readonly LABEL = nls.localize('workbench.action.maix.terminal.selectDefaultShell', 'Select Default Shell');

	constructor(
		id: string, label: string,
		@ISerialMonitorService private terminalService: ISerialMonitorService,
	) {
		super(id, label);
	}

	public run(event?: any): TPromise<any> {
		return this.terminalService.selectDefaultWindowsShell();
	}
}

export class RunSelectedTextInTerminalAction extends Action {

	public static readonly ID = SERIAL_MONITOR_COMMAND_ID.RUN_SELECTED_TEXT;
	public static readonly LABEL = nls.localize('workbench.action.maix.terminal.runSelectedText', 'Run Selected Text In Active Terminal');

	constructor(
		id: string, label: string,
		@ICodeEditorService private codeEditorService: ICodeEditorService,
		@ISerialMonitorService private terminalService: ISerialMonitorService,
	) {
		super(id, label);
	}

	public run(event?: any): TPromise<any> {
		const instance = this.terminalService.getActiveOrCreateInstance();
		if (!instance) {
			return TPromise.as(void 0);
		}
		let editor = this.codeEditorService.getFocusedCodeEditor();
		if (!editor) {
			return TPromise.as(void 0);
		}
		let selection = editor.getSelection();
		let text: string;
		if (selection.isEmpty()) {
			text = editor.getModel().getLineContent(selection.selectionStartLineNumber).trim();
		} else {
			const endOfLinePreference = os.EOL === '\n' ? EndOfLinePreference.LF : EndOfLinePreference.CRLF;
			text = editor.getModel().getValueInRange(selection, endOfLinePreference);
		}
		instance.sendText(text, true);
		return this.terminalService.showPanel();
	}
}

export class RunActiveFileInTerminalAction extends Action {

	public static readonly ID = SERIAL_MONITOR_COMMAND_ID.RUN_ACTIVE_FILE;
	public static readonly LABEL = nls.localize('workbench.action.maix.terminal.runActiveFile', 'Run Active File In Active Terminal');

	constructor(
		id: string, label: string,
		@ICodeEditorService private codeEditorService: ICodeEditorService,
		@ISerialMonitorService private terminalService: ISerialMonitorService,
		@INotificationService private notificationService: INotificationService,
	) {
		super(id, label);
	}

	public run(event?: any): TPromise<any> {
		const instance = this.terminalService.getActiveOrCreateInstance();
		if (!instance) {
			return TPromise.as(void 0);
		}
		const editor = this.codeEditorService.getActiveCodeEditor();
		if (!editor) {
			return TPromise.as(void 0);
		}
		const uri = editor.getModel().uri;
		if (uri.scheme !== 'file') {
			this.notificationService.warn(nls.localize('workbench.action.maix.terminal.runActiveFile.noFile', 'Only files on disk can be run in the terminal'));
			return TPromise.as(void 0);
		}
		instance.sendText(uri.fsPath, true);
		return this.terminalService.showPanel();
	}
}

export class SwitchTerminalAction extends Action {

	public static readonly ID = SERIAL_MONITOR_COMMAND_ID.SWITCH_TERMINAL;
	public static readonly LABEL = nls.localize('workbench.action.maix.terminal.switchTerminal', 'Switch Terminal');

	constructor(
		id: string, label: string,
		@ISerialMonitorService private terminalService: ISerialMonitorService,
	) {
		super(id, label, 'terminal-action switch-terminal');
	}

	public run(item?: string): TPromise<any> {
		if (!item || !item.split) {
			return TPromise.as(null);
		}
		const selectedTabIndex = parseInt(item.split(':')[0], 10) - 1;
		this.terminalService.setActiveTabByIndex(selectedTabIndex);
		return this.terminalService.showPanel(true);
	}
}

export class SwitchTerminalActionItem extends SelectActionItem {

	constructor(
		action: IAction,
		@ISerialMonitorService private terminalService: ISerialMonitorService,
		@IThemeService themeService: IThemeService,
		@IContextViewService contextViewService: IContextViewService,
	) {
		super(null, action, terminalService.getTabLabels(), terminalService.activeTabIndex, contextViewService, { ariaLabel: nls.localize('terminals', 'Terminals') });

		this.toDispose.push(terminalService.onInstancesChanged(this._updateItems, this));
		this.toDispose.push(terminalService.onActiveTabChanged(this._updateItems, this));
		this.toDispose.push(terminalService.onInstanceTitleChanged(this._updateItems, this));
		this.toDispose.push(attachSelectBoxStyler(this.selectBox, themeService));
	}

	private _updateItems(): void {
		this.setOptions(this.terminalService.getTabLabels(), this.terminalService.activeTabIndex);
	}
}

export class ScrollDownTerminalAction extends Action {

	public static readonly ID = SERIAL_MONITOR_COMMAND_ID.SCROLL_DOWN_LINE;
	public static readonly LABEL = nls.localize('workbench.action.maix.terminal.scrollDown', 'Scroll Down (Line)');

	constructor(
		id: string, label: string,
		@ISerialMonitorService private terminalService: ISerialMonitorService,
	) {
		super(id, label);
	}

	public run(event?: any): TPromise<any> {
		const terminalInstance = this.terminalService.getActiveInstance();
		if (terminalInstance) {
			terminalInstance.scrollDownLine();
		}
		return TPromise.as(void 0);
	}
}

export class ScrollDownPageTerminalAction extends Action {

	public static readonly ID = SERIAL_MONITOR_COMMAND_ID.SCROLL_DOWN_PAGE;
	public static readonly LABEL = nls.localize('workbench.action.maix.terminal.scrollDownPage', 'Scroll Down (Page)');

	constructor(
		id: string, label: string,
		@ISerialMonitorService private terminalService: ISerialMonitorService,
	) {
		super(id, label);
	}

	public run(event?: any): TPromise<any> {
		const terminalInstance = this.terminalService.getActiveInstance();
		if (terminalInstance) {
			terminalInstance.scrollDownPage();
		}
		return TPromise.as(void 0);
	}
}

export class ScrollToBottomTerminalAction extends Action {

	public static readonly ID = SERIAL_MONITOR_COMMAND_ID.SCROLL_TO_BOTTOM;
	public static readonly LABEL = nls.localize('workbench.action.maix.terminal.scrollToBottom', 'Scroll to Bottom');

	constructor(
		id: string, label: string,
		@ISerialMonitorService private terminalService: ISerialMonitorService,
	) {
		super(id, label);
	}

	public run(event?: any): TPromise<any> {
		const terminalInstance = this.terminalService.getActiveInstance();
		if (terminalInstance) {
			terminalInstance.scrollToBottom();
		}
		return TPromise.as(void 0);
	}
}

export class ScrollUpTerminalAction extends Action {

	public static readonly ID = SERIAL_MONITOR_COMMAND_ID.SCROLL_UP_LINE;
	public static readonly LABEL = nls.localize('workbench.action.maix.terminal.scrollUp', 'Scroll Up (Line)');

	constructor(
		id: string, label: string,
		@ISerialMonitorService private terminalService: ISerialMonitorService,
	) {
		super(id, label);
	}

	public run(event?: any): TPromise<any> {
		const terminalInstance = this.terminalService.getActiveInstance();
		if (terminalInstance) {
			terminalInstance.scrollUpLine();
		}
		return TPromise.as(void 0);
	}
}

export class ScrollUpPageTerminalAction extends Action {

	public static readonly ID = SERIAL_MONITOR_COMMAND_ID.SCROLL_UP_PAGE;
	public static readonly LABEL = nls.localize('workbench.action.maix.terminal.scrollUpPage', 'Scroll Up (Page)');

	constructor(
		id: string, label: string,
		@ISerialMonitorService private terminalService: ISerialMonitorService,
	) {
		super(id, label);
	}

	public run(event?: any): TPromise<any> {
		const terminalInstance = this.terminalService.getActiveInstance();
		if (terminalInstance) {
			terminalInstance.scrollUpPage();
		}
		return TPromise.as(void 0);
	}
}

export class ScrollToTopTerminalAction extends Action {

	public static readonly ID = SERIAL_MONITOR_COMMAND_ID.SCROLL_TO_TOP;
	public static readonly LABEL = nls.localize('workbench.action.maix.terminal.scrollToTop', 'Scroll to Top');

	constructor(
		id: string, label: string,
		@ISerialMonitorService private terminalService: ISerialMonitorService,
	) {
		super(id, label);
	}

	public run(event?: any): TPromise<any> {
		const terminalInstance = this.terminalService.getActiveInstance();
		if (terminalInstance) {
			terminalInstance.scrollToTop();
		}
		return TPromise.as(void 0);
	}
}

export class ClearTerminalAction extends Action {

	public static readonly ID = SERIAL_MONITOR_COMMAND_ID.CLEAR;
	public static readonly LABEL = nls.localize('workbench.action.maix.terminal.clear', 'Clear');

	constructor(
		id: string, label: string,
		@ISerialMonitorService private terminalService: ISerialMonitorService,
	) {
		super(id, label);
	}

	public run(event?: any): TPromise<any> {
		const terminalInstance = this.terminalService.getActiveInstance();
		if (terminalInstance) {
			terminalInstance.clear();
		}
		return TPromise.as(void 0);
	}
}

export class ClearSelectionTerminalAction extends Action {

	public static readonly ID = SERIAL_MONITOR_COMMAND_ID.CLEAR_SELECTION;
	public static readonly LABEL = nls.localize('workbench.action.maix.terminal.clearSelection', 'Clear Selection');

	constructor(
		id: string, label: string,
		@ISerialMonitorService private terminalService: ISerialMonitorService,
	) {
		super(id, label);
	}

	public run(event?: any): TPromise<any> {
		const terminalInstance = this.terminalService.getActiveInstance();
		if (terminalInstance && terminalInstance.hasSelection()) {
			terminalInstance.clearSelection();
		}
		return TPromise.as(void 0);
	}
}

export class RenameTerminalAction extends Action {

	public static readonly ID = SERIAL_MONITOR_COMMAND_ID.RENAME;
	public static readonly LABEL = nls.localize('workbench.action.maix.terminal.rename', 'Rename');

	constructor(
		id: string, label: string,
		@IQuickOpenService protected quickOpenService: IQuickOpenService,
		@IQuickInputService protected quickInputService: IQuickInputService,
		@ISerialMonitorService protected terminalService: ISerialMonitorService,
	) {
		super(id, label);
	}

	public run(entry?: TerminalEntry): TPromise<any> {
		const terminalInstance = entry ? entry.instance : this.terminalService.getActiveInstance();
		if (!terminalInstance) {
			return TPromise.as(void 0);
		}
		return this.quickInputService.input({
			value: terminalInstance.title,
			prompt: nls.localize('workbench.action.maix.terminal.rename.prompt', 'Enter terminal name'),
		}).then(name => {
			if (name) {
				terminalInstance.setTitle(name, false);
			}
		});
	}
}

export class FocusTerminalFindWidgetAction extends Action {

	public static readonly ID = SERIAL_MONITOR_COMMAND_ID.FIND_WIDGET_FOCUS;
	public static readonly LABEL = nls.localize('workbench.action.maix.terminal.focusFindWidget', 'Focus Find Widget');
	public static readonly SHORT_LABEL = nls.localize('workbench.action.maix.terminal.find', 'Find');

	constructor(
		id: string, label: string,
		@ISerialMonitorService private terminalService: ISerialMonitorService,
	) {
		super(id, label, 'terminal-action octicon octicon-search');
	}

	public run(): TPromise<any> {
		return this.terminalService.focusFindWidget();
	}
}

export class HideTerminalFindWidgetAction extends Action {

	public static readonly ID = SERIAL_MONITOR_COMMAND_ID.FIND_WIDGET_HIDE;
	public static readonly LABEL = nls.localize('workbench.action.maix.terminal.hideFindWidget', 'Hide Find Widget');

	constructor(
		id: string, label: string,
		@ISerialMonitorService private terminalService: ISerialMonitorService,
	) {
		super(id, label);
	}

	public run(): TPromise<any> {
		return TPromise.as(this.terminalService.hideFindWidget());
	}
}

export class QuickOpenActionTermContributor extends ActionBarContributor {

	constructor(
		@IInstantiationService private instantiationService: IInstantiationService,
	) {
		super();
	}

	public getActions(context: any): IAction[] {
		const actions: Action[] = [];
		if (context.element instanceof TerminalEntry) {
			actions.push(this.instantiationService.createInstance(RenameTerminalQuickOpenAction, RenameTerminalQuickOpenAction.ID, RenameTerminalQuickOpenAction.LABEL, context.element));
			actions.push(this.instantiationService.createInstance(QuickKillTerminalAction, QuickKillTerminalAction.ID, QuickKillTerminalAction.LABEL, context.element));
		}
		return actions;
	}

	public hasActions(context: any): boolean {
		return true;
	}
}

export class QuickOpenTermAction extends Action {

	public static readonly ID = SERIAL_MONITOR_COMMAND_ID.QUICK_OPEN_TERM;
	public static readonly LABEL = nls.localize('quickOpenTerm', 'Switch Active Terminal');

	constructor(
		id: string,
		label: string,
		@IQuickOpenService private quickOpenService: IQuickOpenService,
	) {
		super(id, label);
	}

	public run(): TPromise<void> {
		return this.quickOpenService.show(TERMINAL_PICKER_PREFIX, null);
	}
}

export class RenameTerminalQuickOpenAction extends RenameTerminalAction {

	constructor(
		id: string, label: string,
		private terminal: TerminalEntry,
		@IQuickOpenService quickOpenService: IQuickOpenService,
		@IQuickInputService quickInputService: IQuickInputService,
		@ISerialMonitorService terminalService: ISerialMonitorService,
	) {
		super(id, label, quickOpenService, quickInputService, terminalService);
		this.class = 'quick-open-terminal-configure';
	}

	public run(): TPromise<any> {
		super.run(this.terminal)
			// This timeout is needed to make sure the previous quickOpen has time to close before we show the next one
			.then(() => TPromise.timeout(50))
			.then(result => this.quickOpenService.show(TERMINAL_PICKER_PREFIX, null));
		return TPromise.as(null);
	}
}

export class ScrollToPreviousCommandAction extends Action {
	public static readonly ID = SERIAL_MONITOR_COMMAND_ID.SCROLL_TO_PREVIOUS_COMMAND;
	public static readonly LABEL = nls.localize('workbench.action.maix.terminal.scrollToPreviousCommand', 'Scroll To Previous Command');

	constructor(
		id: string, label: string,
		@ISerialMonitorService private terminalService: ISerialMonitorService,
	) {
		super(id, label);
	}

	public run(): TPromise<any> {
		const instance = this.terminalService.getActiveInstance();
		if (instance) {
			instance.commandTracker.scrollToPreviousCommand();
			instance.focus();
		}
		return TPromise.as(void 0);
	}
}

export class ScrollToNextCommandAction extends Action {
	public static readonly ID = SERIAL_MONITOR_COMMAND_ID.SCROLL_TO_NEXT_COMMAND;
	public static readonly LABEL = nls.localize('workbench.action.maix.terminal.scrollToNextCommand', 'Scroll To Next Command');

	constructor(
		id: string, label: string,
		@ISerialMonitorService private terminalService: ISerialMonitorService,
	) {
		super(id, label);
	}

	public run(): TPromise<any> {
		const instance = this.terminalService.getActiveInstance();
		if (instance) {
			instance.commandTracker.scrollToNextCommand();
			instance.focus();
		}
		return TPromise.as(void 0);
	}
}

export class SelectToPreviousCommandAction extends Action {
	public static readonly ID = SERIAL_MONITOR_COMMAND_ID.SELECT_TO_PREVIOUS_COMMAND;
	public static readonly LABEL = nls.localize('workbench.action.maix.terminal.selectToPreviousCommand', 'Select To Previous Command');

	constructor(
		id: string, label: string,
		@ISerialMonitorService private terminalService: ISerialMonitorService,
	) {
		super(id, label);
	}

	public run(): TPromise<any> {
		const instance = this.terminalService.getActiveInstance();
		if (instance) {
			instance.commandTracker.selectToPreviousCommand();
			instance.focus();
		}
		return TPromise.as(void 0);
	}
}

export class SelectToNextCommandAction extends Action {
	public static readonly ID = SERIAL_MONITOR_COMMAND_ID.SELECT_TO_NEXT_COMMAND;
	public static readonly LABEL = nls.localize('workbench.action.maix.terminal.selectToNextCommand', 'Select To Next Command');

	constructor(
		id: string, label: string,
		@ISerialMonitorService private terminalService: ISerialMonitorService,
	) {
		super(id, label);
	}

	public run(): TPromise<any> {
		const instance = this.terminalService.getActiveInstance();
		if (instance) {
			instance.commandTracker.selectToNextCommand();
			instance.focus();
		}
		return TPromise.as(void 0);
	}
}

export class SelectToPreviousLineAction extends Action {
	public static readonly ID = SERIAL_MONITOR_COMMAND_ID.SELECT_TO_PREVIOUS_LINE;
	public static readonly LABEL = nls.localize('workbench.action.maix.terminal.selectToPreviousLine', 'Select To Previous Line');

	constructor(
		id: string, label: string,
		@ISerialMonitorService private terminalService: ISerialMonitorService,
	) {
		super(id, label);
	}

	public run(): TPromise<any> {
		const instance = this.terminalService.getActiveInstance();
		if (instance) {
			instance.commandTracker.selectToPreviousLine();
			instance.focus();
		}
		return TPromise.as(void 0);
	}
}

export class SelectToNextLineAction extends Action {
	public static readonly ID = SERIAL_MONITOR_COMMAND_ID.SELECT_TO_NEXT_LINE;
	public static readonly LABEL = nls.localize('workbench.action.maix.terminal.selectToNextLine', 'Select To Next Line');

	constructor(
		id: string, label: string,
		@ISerialMonitorService private terminalService: ISerialMonitorService,
	) {
		super(id, label);
	}

	public run(): TPromise<any> {
		const instance = this.terminalService.getActiveInstance();
		if (instance) {
			instance.commandTracker.selectToNextLine();
			instance.focus();
		}
		return TPromise.as(void 0);
	}
}

export class ToggleEscapeSequenceLoggingAction extends Action {
	public static readonly ID = SERIAL_MONITOR_COMMAND_ID.TOGGLE_ESCAPE_SEQUENCE_LOGGING;
	public static readonly LABEL = nls.localize('workbench.action.maix.terminal.toggleEscapeSequenceLogging', 'Toggle Escape Sequence Logging');

	constructor(
		id: string, label: string,
		@ISerialMonitorService private terminalService: ISerialMonitorService,
	) {
		super(id, label);
	}

	public run(): TPromise<any> {
		const instance = this.terminalService.getActiveInstance();
		if (instance) {
			instance.toggleEscapeSequenceLogging();
		}
		return TPromise.as(void 0);
	}
}
