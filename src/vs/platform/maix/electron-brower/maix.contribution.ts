'use strict';

import * as nls from 'vs/nls';
import { Registry } from 'vs/platform/registry/common/platform';
import { IWorkbenchActionRegistry, Extensions } from 'vs/workbench/common/actions';
import { SyncActionDescriptor } from 'vs/platform/actions/common/actions';
import { OpenMaixSettingsAction } from '../common/maixAction';
import { KeyCode, KeyMod } from 'vs/base/common/keyCodes';

const category = nls.localize('maixCategorg', "Maix");

const registry = Registry.as<IWorkbenchActionRegistry>(Extensions.WorkbenchActions);
registry.registerWorkbenchAction(
	new SyncActionDescriptor(OpenMaixSettingsAction, OpenMaixSettingsAction.ID, OpenMaixSettingsAction.LABEL, {
		primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KEY_A
	}),
	'Maix: Open Settings',
	category
);