import { Registry } from 'vs/platform/registry/common/platform';
import { Extensions as ActionExtensions, IWorkbenchActionRegistry } from 'vs/workbench/common/actions';
import { MenuId, MenuRegistry, SyncActionDescriptor } from 'vs/platform/actions/common/actions';
import { Action } from 'vs/base/common/actions';
import { IConstructorSignature2 } from 'vs/platform/instantiation/common/instantiation';
import { IKeybindings } from 'vs/platform/keybinding/common/keybindingsRegistry';
import { ContextKeyExpr } from 'vs/platform/contextkey/common/contextkey';

interface IActionToRegister extends IConstructorSignature2<string, string, Action> {
	ID: string;
	LABEL: string;
}

export function registerInternalAction(category: string, Action: IActionToRegister) {
	Registry.as<IWorkbenchActionRegistry>(ActionExtensions.WorkbenchActions)
		.registerWorkbenchAction(
			new SyncActionDescriptor(Action, Action.ID, Action.LABEL),
			`${category}: ${Action.LABEL}`,
			category,
		);
}

export function registerExternalAction(category: string, Action: IActionToRegister) {
	registerInternalAction(category, Action);
	MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
		command: {
			id: Action.ID,
			title: `${category}: ${Action.LABEL}`,
		},
	});
}

export function registerActionWithKey(category: string, Action: IActionToRegister, keybindings: IKeybindings, keybindingContext: ContextKeyExpr, keybindingWeight?: number) {
	Registry.as<IWorkbenchActionRegistry>(ActionExtensions.WorkbenchActions)
		.registerWorkbenchAction(
			new SyncActionDescriptor(Action, Action.ID, Action.LABEL, keybindings, keybindingContext, keybindingWeight),
			`${category}: ${Action.LABEL}`,
			category,
			keybindingContext,
		);
	MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
		command: {
			id: Action.ID,
			title: `${category}: ${Action.LABEL}`,
			when: keybindingContext,
			group: category,
		},
	});
}