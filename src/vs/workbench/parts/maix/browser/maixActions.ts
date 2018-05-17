'use strict';

import { Action } from 'vs/base/common/actions';
import { TPromise } from 'vs/base/common/winjs.base';
import { localize } from 'vs/nls';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { FullScreenEditor } from 'vs/workbench/parts/maix/browser/frame/FullScreenEditor';
import { MaixSettingsEditor } from 'vs/workbench/parts/maix/browser/frame/maixSettingsEditor';
import { MaixSettingsEditorInput } from 'vs/workbench/parts/maix/common/maixEditorInput';
import { IWorkbenchEditorService } from '../../../services/editor/common/editorService';

export const ShowMaixSettingsActionId = 'workbench.action.showMaixSettings';
export const ShowMaixSettingsActionLabel = localize('settingsPage', 'Show Settings Page');

export class ShowMaixSettingsAction extends Action {
	constructor(
		id: string,
		label: string,
		// @IWorkbenchEditorService private editorService: IWorkbenchEditorService,
		@IInstantiationService private instantiationService: IInstantiationService
	) {
		super(id, label);
	}

	run(): TPromise<void> {
		// const input = this.instantiationService.createInstance(MaixSettingsEditorInput);
		// this.editorService.openEditor(input, { pinned: true }, Position.ONE).then(() => null);
		const inputData = this.instantiationService.createInstance(MaixSettingsEditorInput, '{}');
		const $editor = this.instantiationService.createInstance(MaixSettingsEditor);
		const $container = this.instantiationService.createInstance(FullScreenEditor, $editor);

		return $container.create().then(async () => {
			await $container.setVisible(true);

			$container.layout();

			await $editor.setInput(inputData);

			$editor.focus();

			return new TPromise<void>((resolve) => {
				$container.toDispose({
					dispose() {
						resolve(void 0);
					}
				});
			});
		});
	}
}

export const PopMaixSettingsActionId = 'workbench.action.popMaixSettings';
export const PopMaixSettingsActionLabel = localize('settingsWindow', 'Open Settings Window');

export class PopMaixSettingsAction extends Action {
	constructor(
		id: string,
		label: string,
		@IWorkbenchEditorService private editorService: IWorkbenchEditorService,
		@IInstantiationService private instantiationService: IInstantiationService
	) {
		super(id, label);
	}

	run(): TPromise<void> {
		const input = this.instantiationService.createInstance(MaixSettingsEditorInput, '{}');
		return this.editorService.openEditor(input, { pinned: true }).then(() => null);
	}
}
