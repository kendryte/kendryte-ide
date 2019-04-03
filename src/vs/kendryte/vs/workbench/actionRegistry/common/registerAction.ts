import { Registry } from 'vs/platform/registry/common/platform';
import { Extensions as ActionExtensions, IWorkbenchActionRegistry } from 'vs/workbench/common/actions';
import { MenuId, MenuRegistry, SyncActionDescriptor } from 'vs/platform/actions/common/actions';
import { Action } from 'vs/base/common/actions';
import { IConstructorSignature2, IInstantiationService, ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
import { IKeybindings } from 'vs/platform/keybinding/common/keybindingsRegistry';
import { ContextKeyExpr } from 'vs/platform/contextkey/common/contextkey';
import { CommandsRegistry } from 'vs/platform/commands/common/commands';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { TypeConstraint } from 'vs/base/common/types';

const DescRegistry: { [id: string]: SyncActionDescriptor; } = {};

interface IActionToRegister extends IConstructorSignature2<string, string, Action> {
	ID: string;
	LABEL_SHORT?: string;
	LABEL: string;
	ARGUMENTS?: { name: string; description?: string; constraint?: TypeConstraint; }[];
}

export function registerInternalAction(category: string, Action: IActionToRegister) {
	if (DescRegistry[Action.ID]) {
		throw new Error(`Action ${Action.ID} has already registered.`);
	}
	DescRegistry[Action.ID] = new SyncActionDescriptor(Action, Action.ID, Action.LABEL_SHORT || Action.LABEL);

	Registry.as<IWorkbenchActionRegistry>(ActionExtensions.WorkbenchActions)
		.registerWorkbenchAction(
			DescRegistry[Action.ID],
			`${category}: ${Action.LABEL}`,
			category,
		);

	CommandsRegistry.registerCommand({
		id: Action.ID,
		handler(access: ServicesAccessor, ...args: any[]) {
			const actionObject = access.get(IInstantiationService).createInstance(DescRegistry[Action.ID].syncDescriptor);
			const notificationService = access.get(INotificationService);
			Promise.resolve(actionObject.run(args, undefined)).catch((e) => {
				notificationService.error(`Failed to run action: ${Action.ID}\n${e.message}`);
				throw e;
			}).finally(() => {
				actionObject.dispose();
			});
		},
		description: {
			description: `${category}: ${Action.LABEL}`,
			args: Action.ARGUMENTS || [],
		},
	});
}

export function registerExternalAction(category: string, Action: IActionToRegister) {
	registerInternalAction(category, Action);
	MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
		command: {
			id: Action.ID,
			title: `${category}: ${Action.LABEL_SHORT || Action.LABEL}`,
		},
	});
}

export function registerActionWithKey(category: string, Action: IActionToRegister, keybindings: IKeybindings, keybindingContext: ContextKeyExpr, keybindingWeight?: number) {
	if (DescRegistry[Action.ID]) {
		throw new Error(`Action ${Action.ID} has already registered.`);
	}
	DescRegistry[Action.ID] = new SyncActionDescriptor(Action, Action.ID, Action.LABEL_SHORT || Action.LABEL, keybindings, keybindingContext, keybindingWeight);

	Registry.as<IWorkbenchActionRegistry>(ActionExtensions.WorkbenchActions)
		.registerWorkbenchAction(
			DescRegistry[Action.ID],
			`${category}: ${Action.LABEL}`,
			category,
			keybindingContext,
		);
	MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
		command: {
			id: Action.ID,
			title: `${category}: ${Action.LABEL_SHORT || Action.LABEL}`,
			when: keybindingContext,
			group: category,
		},
	});
}

export function createActionInstance<T extends Action>(instantiationService: IInstantiationService, actionId: string): T {
	const ActionDesc = DescRegistry[actionId];
	if (!ActionDesc) {
		throw new Error('No action id: ' + actionId);
	}

	return instantiationService.createInstance(ActionDesc.syncDescriptor) as any;
}
