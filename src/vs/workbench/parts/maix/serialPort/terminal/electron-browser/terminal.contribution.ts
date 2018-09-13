/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import 'vs/css!./media/scrollbar';
import 'vs/css!./media/terminal';
import 'vs/css!./media/xterm';
import 'vs/css!./media/widgets';
import * as nls from 'vs/nls';
import { Extensions as PanelExtensions, PanelDescriptor, PanelRegistry } from 'vs/workbench/browser/panel';
import * as platform from 'vs/base/common/platform';
import {
	ISerialMonitorService,
	KEYBINDING_CONTEXT_TERMINAL_FIND_WIDGET_NOT_VISIBLE,
	KEYBINDING_CONTEXT_TERMINAL_FIND_WIDGET_VISIBLE,
	KEYBINDING_CONTEXT_TERMINAL_FOCUS,
	KEYBINDING_CONTEXT_TERMINAL_TEXT_SELECTED,
	TERMINAL_PANEL_ID,
} from 'vs/workbench/parts/maix/serialPort/terminal/common/terminal';
import { Extensions as ActionExtensions, IWorkbenchActionRegistry } from 'vs/workbench/common/actions';
import { KeyCode, KeyMod } from 'vs/base/common/keyCodes';
import { ContextKeyExpr } from 'vs/platform/contextkey/common/contextkey';
import {
	ClearSelectionTerminalAction,
	ClearTerminalAction,
	CopyTerminalSelectionAction,
	CreateNewTerminalAction,
	DeleteWordLeftTerminalAction,
	DeleteWordRightTerminalAction,
	FocusNextPaneTerminalAction,
	FocusNextTerminalAction,
	FocusPreviousPaneTerminalAction,
	FocusPreviousTerminalAction,
	FocusTerminalFindWidgetAction,
	HideTerminalFindWidgetAction,
	KillTerminalAction,
	MoveToLineEndTerminalAction,
	MoveToLineStartTerminalAction,
	QuickOpenActionTermContributor,
	QuickOpenTermAction,
	RenameTerminalAction,
	ResizePaneDownTerminalAction,
	ResizePaneLeftTerminalAction,
	ResizePaneRightTerminalAction,
	ResizePaneUpTerminalAction,
	RunActiveFileInTerminalAction,
	RunSelectedTextInTerminalAction,
	ScrollDownPageTerminalAction,
	ScrollDownTerminalAction,
	ScrollToBottomTerminalAction,
	ScrollToNextCommandAction,
	ScrollToPreviousCommandAction,
	ScrollToTopTerminalAction,
	ScrollUpPageTerminalAction,
	ScrollUpTerminalAction,
	SelectAllTerminalAction,
	SelectDefaultShellWindowsTerminalAction,
	SelectToNextCommandAction,
	SelectToNextLineAction,
	SelectToPreviousCommandAction,
	SelectToPreviousLineAction,
	TERMINAL_PICKER_PREFIX,
	TerminalPasteAction,
	ToggleEscapeSequenceLoggingAction,
	ToggleTerminalAction,
} from 'vs/workbench/parts/maix/serialPort/terminal/electron-browser/terminalActions';
import { Registry } from 'vs/platform/registry/common/platform';
import { SyncActionDescriptor } from 'vs/platform/actions/common/actions';
import { TerminalService } from 'vs/workbench/parts/maix/serialPort/terminal/electron-browser/terminalService';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { KeybindingWeight } from 'vs/platform/keybinding/common/keybindingsRegistry';
import { getQuickNavigateHandler } from 'vs/workbench/browser/parts/quickopen/quickopen';
import { Extensions as QuickOpenExtensions, IQuickOpenRegistry, QuickOpenHandlerDescriptor } from 'vs/workbench/browser/quickopen';
import { Extensions as ActionBarExtensions, IActionBarRegistry, Scope } from 'vs/workbench/browser/actions';
import { CommandsRegistry } from 'vs/platform/commands/common/commands';
import { TerminalPanel } from 'vs/workbench/parts/maix/serialPort/terminal/electron-browser/terminalPanel';
import { TerminalPickerHandler } from 'vs/workbench/parts/maix/serialPort/terminal/browser/terminalQuickOpen';
import { SERIAL_MONITOR_COMMAND_ID, setupTerminalCommands } from 'vs/workbench/parts/maix/serialPort/terminal/common/terminalCommands';
import { setupTerminalMenu } from 'vs/workbench/parts/maix/serialPort/terminal/node/terminalMenu';

const quickOpenRegistry = (Registry.as<IQuickOpenRegistry>(QuickOpenExtensions.Quickopen));

const inTerminalsPicker = 'inTerminalPicker';

quickOpenRegistry.registerQuickOpenHandler(
	new QuickOpenHandlerDescriptor(
		TerminalPickerHandler,
		TerminalPickerHandler.ID,
		TERMINAL_PICKER_PREFIX,
		inTerminalsPicker,
		nls.localize('quickOpen.terminal', 'Show All Opened Terminals'),
	),
);

const quickOpenNavigateNextInTerminalPickerId = 'workbench.action.kendryte.quickOpenNavigateNextInTerminalPicker';
CommandsRegistry.registerCommand(
	{ id: quickOpenNavigateNextInTerminalPickerId, handler: getQuickNavigateHandler(quickOpenNavigateNextInTerminalPickerId, true) });

const quickOpenNavigatePreviousInTerminalPickerId = 'workbench.action.kendryte.quickOpenNavigatePreviousInTerminalPicker';
CommandsRegistry.registerCommand(
	{ id: quickOpenNavigatePreviousInTerminalPickerId, handler: getQuickNavigateHandler(quickOpenNavigatePreviousInTerminalPickerId, false) });

const registry = Registry.as<IWorkbenchActionRegistry>(ActionExtensions.WorkbenchActions);
registry.registerWorkbenchAction(new SyncActionDescriptor(QuickOpenTermAction, QuickOpenTermAction.ID, QuickOpenTermAction.LABEL), 'Terminal: Switch Active Terminal', nls.localize('terminal', 'Terminal'));
const actionBarRegistry = Registry.as<IActionBarRegistry>(ActionBarExtensions.Actionbar);
actionBarRegistry.registerActionBarContributor(Scope.VIEWER, QuickOpenActionTermContributor);

registerSingleton(ISerialMonitorService, TerminalService);

Registry.as<PanelRegistry>(PanelExtensions.Panels).registerPanel(new PanelDescriptor(
	TerminalPanel,
	TERMINAL_PANEL_ID,
	nls.localize('serial port', 'Serial Port'),
	'serialPanel',
	100,
	SERIAL_MONITOR_COMMAND_ID.TOGGLE,
));

// On mac cmd+` is reserved to cycle between windows, that's why the keybindings use WinCtrl
const category = nls.localize('serialPortCategory', 'Serial Port');
const actionRegistry = Registry.as<IWorkbenchActionRegistry>(ActionExtensions.WorkbenchActions);
actionRegistry.registerWorkbenchAction(new SyncActionDescriptor(KillTerminalAction, KillTerminalAction.ID, KillTerminalAction.LABEL), 'Terminal: Kill the Active Terminal Instance', category);
actionRegistry.registerWorkbenchAction(new SyncActionDescriptor(CopyTerminalSelectionAction, CopyTerminalSelectionAction.ID, CopyTerminalSelectionAction.LABEL, {
	primary: KeyMod.CtrlCmd | KeyCode.KEY_C,
	linux: { primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KEY_C },
}, ContextKeyExpr.and(KEYBINDING_CONTEXT_TERMINAL_TEXT_SELECTED, KEYBINDING_CONTEXT_TERMINAL_FOCUS)), 'Terminal: Copy Selection', category);
actionRegistry.registerWorkbenchAction(new SyncActionDescriptor(CreateNewTerminalAction, CreateNewTerminalAction.ID, CreateNewTerminalAction.LABEL, {
	primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.US_BACKTICK,
	mac: { primary: KeyMod.WinCtrl | KeyMod.Shift | KeyCode.US_BACKTICK },
}), 'Terminal: Create New Integrated Terminal', category);
actionRegistry.registerWorkbenchAction(new SyncActionDescriptor(ClearSelectionTerminalAction, ClearSelectionTerminalAction.ID, ClearSelectionTerminalAction.LABEL, {
	primary: KeyCode.Escape,
	linux: { primary: KeyCode.Escape },
}, ContextKeyExpr.and(KEYBINDING_CONTEXT_TERMINAL_FOCUS, KEYBINDING_CONTEXT_TERMINAL_TEXT_SELECTED, KEYBINDING_CONTEXT_TERMINAL_FIND_WIDGET_NOT_VISIBLE)), 'Terminal: Escape selection', category);
actionRegistry.registerWorkbenchAction(new SyncActionDescriptor(FocusNextTerminalAction, FocusNextTerminalAction.ID, FocusNextTerminalAction.LABEL), 'Terminal: Focus Next Terminal', category);
actionRegistry.registerWorkbenchAction(new SyncActionDescriptor(FocusPreviousTerminalAction, FocusPreviousTerminalAction.ID, FocusPreviousTerminalAction.LABEL), 'Terminal: Focus Previous Terminal', category);
actionRegistry.registerWorkbenchAction(new SyncActionDescriptor(TerminalPasteAction, TerminalPasteAction.ID, TerminalPasteAction.LABEL, {
	primary: KeyMod.CtrlCmd | KeyCode.KEY_V,
	linux: { primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KEY_V },
	// Don't apply to Mac since cmd+v works
	mac: { primary: null },
}, KEYBINDING_CONTEXT_TERMINAL_FOCUS), 'Terminal: Paste into Active Terminal', category);
actionRegistry.registerWorkbenchAction(new SyncActionDescriptor(SelectAllTerminalAction, SelectAllTerminalAction.ID, SelectAllTerminalAction.LABEL, {
	// Don't use ctrl+a by default as that would override the common go to start
	// of prompt shell binding
	primary: null,
	// Technically this doesn't need to be here as it will fall back to this
	// behavior anyway when handed to xterm.js, having this handled by VS Code
	// makes it easier for users to see how it works though.
	mac: { primary: KeyMod.CtrlCmd | KeyCode.KEY_A },
}, KEYBINDING_CONTEXT_TERMINAL_FOCUS), 'Terminal: Select All', category);
actionRegistry.registerWorkbenchAction(new SyncActionDescriptor(RunSelectedTextInTerminalAction, RunSelectedTextInTerminalAction.ID, RunSelectedTextInTerminalAction.LABEL), 'Terminal: Run Selected Text In Active Terminal', category);
actionRegistry.registerWorkbenchAction(new SyncActionDescriptor(RunActiveFileInTerminalAction, RunActiveFileInTerminalAction.ID, RunActiveFileInTerminalAction.LABEL), 'Terminal: Run Active File In Active Terminal', category);
actionRegistry.registerWorkbenchAction(new SyncActionDescriptor(ToggleTerminalAction, ToggleTerminalAction.ID, ToggleTerminalAction.LABEL, {
	primary: KeyMod.CtrlCmd | KeyMod.Alt | KeyCode.KEY_S,
	mac: { primary: KeyMod.WinCtrl | KeyMod.Alt | KeyCode.KEY_S },
}), 'View: Toggle Integrated Terminal', nls.localize('viewCategory', 'View'));
actionRegistry.registerWorkbenchAction(new SyncActionDescriptor(ScrollDownTerminalAction, ScrollDownTerminalAction.ID, ScrollDownTerminalAction.LABEL, {
	primary: KeyMod.CtrlCmd | KeyMod.Alt | KeyCode.PageDown,
	linux: { primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.DownArrow },
}, KEYBINDING_CONTEXT_TERMINAL_FOCUS), 'Terminal: Scroll Down (Line)', category);
actionRegistry.registerWorkbenchAction(new SyncActionDescriptor(ScrollDownPageTerminalAction, ScrollDownPageTerminalAction.ID, ScrollDownPageTerminalAction.LABEL, {
	primary: KeyMod.Shift | KeyCode.PageDown,
	mac: { primary: KeyCode.PageDown },
}, KEYBINDING_CONTEXT_TERMINAL_FOCUS), 'Terminal: Scroll Down (Page)', category);
actionRegistry.registerWorkbenchAction(new SyncActionDescriptor(ScrollToBottomTerminalAction, ScrollToBottomTerminalAction.ID, ScrollToBottomTerminalAction.LABEL, {
	primary: KeyMod.CtrlCmd | KeyCode.End,
	linux: { primary: KeyMod.Shift | KeyCode.End },
}, KEYBINDING_CONTEXT_TERMINAL_FOCUS), 'Terminal: Scroll to Bottom', category);
actionRegistry.registerWorkbenchAction(new SyncActionDescriptor(ScrollUpTerminalAction, ScrollUpTerminalAction.ID, ScrollUpTerminalAction.LABEL, {
	primary: KeyMod.CtrlCmd | KeyMod.Alt | KeyCode.PageUp,
	linux: { primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.UpArrow },
}, KEYBINDING_CONTEXT_TERMINAL_FOCUS), 'Terminal: Scroll Up (Line)', category);
actionRegistry.registerWorkbenchAction(new SyncActionDescriptor(ScrollUpPageTerminalAction, ScrollUpPageTerminalAction.ID, ScrollUpPageTerminalAction.LABEL, {
	primary: KeyMod.Shift | KeyCode.PageUp,
	mac: { primary: KeyCode.PageUp },
}, KEYBINDING_CONTEXT_TERMINAL_FOCUS), 'Terminal: Scroll Up (Page)', category);
actionRegistry.registerWorkbenchAction(new SyncActionDescriptor(ScrollToTopTerminalAction, ScrollToTopTerminalAction.ID, ScrollToTopTerminalAction.LABEL, {
	primary: KeyMod.CtrlCmd | KeyCode.Home,
	linux: { primary: KeyMod.Shift | KeyCode.Home },
}, KEYBINDING_CONTEXT_TERMINAL_FOCUS), 'Terminal: Scroll to Top', category);
actionRegistry.registerWorkbenchAction(new SyncActionDescriptor(ClearTerminalAction, ClearTerminalAction.ID, ClearTerminalAction.LABEL, {
	primary: KeyMod.CtrlCmd | KeyCode.KEY_K,
	linux: { primary: null },
}, KEYBINDING_CONTEXT_TERMINAL_FOCUS, KeybindingWeight.WorkbenchContrib + 1), 'Terminal: Clear', category);
if (platform.isWindows) {
	actionRegistry.registerWorkbenchAction(new SyncActionDescriptor(SelectDefaultShellWindowsTerminalAction, SelectDefaultShellWindowsTerminalAction.ID, SelectDefaultShellWindowsTerminalAction.LABEL), 'Terminal: Select Default Shell', category);
}
actionRegistry.registerWorkbenchAction(new SyncActionDescriptor(RenameTerminalAction, RenameTerminalAction.ID, RenameTerminalAction.LABEL), 'Terminal: Rename', category);
actionRegistry.registerWorkbenchAction(new SyncActionDescriptor(FocusTerminalFindWidgetAction, FocusTerminalFindWidgetAction.ID, FocusTerminalFindWidgetAction.LABEL, {
	primary: KeyMod.CtrlCmd | KeyCode.KEY_F,
}, KEYBINDING_CONTEXT_TERMINAL_FOCUS), 'Terminal: Focus Find Widget', category);
actionRegistry.registerWorkbenchAction(new SyncActionDescriptor(HideTerminalFindWidgetAction, HideTerminalFindWidgetAction.ID, HideTerminalFindWidgetAction.LABEL, {
	primary: KeyCode.Escape,
	secondary: [KeyMod.Shift | KeyCode.Escape],
}, ContextKeyExpr.and(KEYBINDING_CONTEXT_TERMINAL_FOCUS, KEYBINDING_CONTEXT_TERMINAL_FIND_WIDGET_VISIBLE)), 'Terminal: Hide Find Widget', category);
actionRegistry.registerWorkbenchAction(new SyncActionDescriptor(DeleteWordLeftTerminalAction, DeleteWordLeftTerminalAction.ID, DeleteWordLeftTerminalAction.LABEL, {
	primary: KeyMod.CtrlCmd | KeyCode.Backspace,
	mac: { primary: KeyMod.Alt | KeyCode.Backspace },
}, KEYBINDING_CONTEXT_TERMINAL_FOCUS), 'Terminal: Delete Word Left', category);
actionRegistry.registerWorkbenchAction(new SyncActionDescriptor(DeleteWordRightTerminalAction, DeleteWordRightTerminalAction.ID, DeleteWordRightTerminalAction.LABEL, {
	primary: KeyMod.CtrlCmd | KeyCode.Delete,
	mac: { primary: KeyMod.Alt | KeyCode.Delete },
}, KEYBINDING_CONTEXT_TERMINAL_FOCUS), 'Terminal: Delete Word Right', category);
actionRegistry.registerWorkbenchAction(new SyncActionDescriptor(MoveToLineStartTerminalAction, MoveToLineStartTerminalAction.ID, MoveToLineStartTerminalAction.LABEL, {
	primary: null,
	mac: { primary: KeyMod.CtrlCmd | KeyCode.LeftArrow },
}, KEYBINDING_CONTEXT_TERMINAL_FOCUS), 'Terminal: Move To Line Start', category);
actionRegistry.registerWorkbenchAction(new SyncActionDescriptor(MoveToLineEndTerminalAction, MoveToLineEndTerminalAction.ID, MoveToLineEndTerminalAction.LABEL, {
	primary: null,
	mac: { primary: KeyMod.CtrlCmd | KeyCode.RightArrow },
}, KEYBINDING_CONTEXT_TERMINAL_FOCUS), 'Terminal: Move To Line End', category);
actionRegistry.registerWorkbenchAction(new SyncActionDescriptor(FocusPreviousPaneTerminalAction, FocusPreviousPaneTerminalAction.ID, FocusPreviousPaneTerminalAction.LABEL, {
	primary: KeyMod.Alt | KeyCode.LeftArrow,
	secondary: [KeyMod.Alt | KeyCode.UpArrow],
	mac: {
		primary: KeyMod.Alt | KeyMod.CtrlCmd | KeyCode.LeftArrow,
		secondary: [KeyMod.Alt | KeyMod.CtrlCmd | KeyCode.UpArrow],
	},
}, KEYBINDING_CONTEXT_TERMINAL_FOCUS), 'Terminal: Focus Previous Pane', category);
actionRegistry.registerWorkbenchAction(new SyncActionDescriptor(FocusNextPaneTerminalAction, FocusNextPaneTerminalAction.ID, FocusNextPaneTerminalAction.LABEL, {
	primary: KeyMod.Alt | KeyCode.RightArrow,
	secondary: [KeyMod.Alt | KeyCode.DownArrow],
	mac: {
		primary: KeyMod.Alt | KeyMod.CtrlCmd | KeyCode.RightArrow,
		secondary: [KeyMod.Alt | KeyMod.CtrlCmd | KeyCode.DownArrow],
	},
}, KEYBINDING_CONTEXT_TERMINAL_FOCUS), 'Terminal: Focus Next Pane', category);
actionRegistry.registerWorkbenchAction(new SyncActionDescriptor(ResizePaneLeftTerminalAction, ResizePaneLeftTerminalAction.ID, ResizePaneLeftTerminalAction.LABEL, {
	primary: null,
	linux: { primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.LeftArrow },
	mac: { primary: KeyMod.CtrlCmd | KeyMod.WinCtrl | KeyCode.LeftArrow },
}, KEYBINDING_CONTEXT_TERMINAL_FOCUS), 'Terminal: Resize Pane Left', category);
actionRegistry.registerWorkbenchAction(new SyncActionDescriptor(ResizePaneRightTerminalAction, ResizePaneRightTerminalAction.ID, ResizePaneRightTerminalAction.LABEL, {
	primary: null,
	linux: { primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.RightArrow },
	mac: { primary: KeyMod.CtrlCmd | KeyMod.WinCtrl | KeyCode.RightArrow },
}, KEYBINDING_CONTEXT_TERMINAL_FOCUS), 'Terminal: Resize Pane Right', category);
actionRegistry.registerWorkbenchAction(new SyncActionDescriptor(ResizePaneUpTerminalAction, ResizePaneUpTerminalAction.ID, ResizePaneUpTerminalAction.LABEL, {
	primary: null,
	linux: { primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.UpArrow },
	mac: { primary: KeyMod.CtrlCmd | KeyMod.WinCtrl | KeyCode.UpArrow },
}, KEYBINDING_CONTEXT_TERMINAL_FOCUS), 'Terminal: Resize Pane Up', category);
actionRegistry.registerWorkbenchAction(new SyncActionDescriptor(ResizePaneDownTerminalAction, ResizePaneDownTerminalAction.ID, ResizePaneDownTerminalAction.LABEL, {
	primary: null,
	linux: { primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.DownArrow },
	mac: { primary: KeyMod.CtrlCmd | KeyMod.WinCtrl | KeyCode.DownArrow },
}, KEYBINDING_CONTEXT_TERMINAL_FOCUS), 'Terminal: Resize Pane Down', category);
actionRegistry.registerWorkbenchAction(new SyncActionDescriptor(ScrollToPreviousCommandAction, ScrollToPreviousCommandAction.ID, ScrollToPreviousCommandAction.LABEL, {
	primary: null,
	mac: { primary: KeyMod.CtrlCmd | KeyCode.UpArrow },
}, KEYBINDING_CONTEXT_TERMINAL_FOCUS), 'Terminal: Scroll To Previous Command', category);
actionRegistry.registerWorkbenchAction(new SyncActionDescriptor(ScrollToNextCommandAction, ScrollToNextCommandAction.ID, ScrollToNextCommandAction.LABEL, {
	primary: null,
	mac: { primary: KeyMod.CtrlCmd | KeyCode.DownArrow },
}, KEYBINDING_CONTEXT_TERMINAL_FOCUS), 'Terminal: Scroll To Next Command', category);
actionRegistry.registerWorkbenchAction(new SyncActionDescriptor(SelectToPreviousCommandAction, SelectToPreviousCommandAction.ID, SelectToPreviousCommandAction.LABEL, {
	primary: null,
	mac: { primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.UpArrow },
}, KEYBINDING_CONTEXT_TERMINAL_FOCUS), 'Terminal: Select To Previous Command', category);
actionRegistry.registerWorkbenchAction(new SyncActionDescriptor(SelectToNextCommandAction, SelectToNextCommandAction.ID, SelectToNextCommandAction.LABEL, {
	primary: null,
	mac: { primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.DownArrow },
}, KEYBINDING_CONTEXT_TERMINAL_FOCUS), 'Terminal: Select To Next Command', category);
actionRegistry.registerWorkbenchAction(new SyncActionDescriptor(SelectToPreviousLineAction, SelectToPreviousLineAction.ID, SelectToPreviousLineAction.LABEL), 'Terminal: Select To Previous Line', category);
actionRegistry.registerWorkbenchAction(new SyncActionDescriptor(SelectToNextLineAction, SelectToNextLineAction.ID, SelectToNextLineAction.LABEL), 'Terminal: Select To Next Line', category);
actionRegistry.registerWorkbenchAction(new SyncActionDescriptor(ToggleEscapeSequenceLoggingAction, ToggleEscapeSequenceLoggingAction.ID, ToggleEscapeSequenceLoggingAction.LABEL), 'Terminal: Toggle Escape Sequence Logging', category);

setupTerminalCommands();
setupTerminalMenu();
