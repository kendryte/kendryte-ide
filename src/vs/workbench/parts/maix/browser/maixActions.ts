'use strict';

import { Action } from 'vs/base/common/actions';
import { TPromise } from 'vs/base/common/winjs.base';
import { localize } from 'vs/nls';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { FullScreenEditor } from 'vs/workbench/parts/maix/browser/FullScreenEditor';
import { MaixSettingsEditor } from 'vs/workbench/parts/maix/browser/maixSettingsEditor';
import { MaixSettingsEditorInput } from 'vs/workbench/parts/maix/common/maixEditorInput';

export const ShowMaixSettingsActionId = 'workbench.action.showMaixSettings';
export const ShowMaixSettingsActionLabel = localize('settings', 'Open Maix Settings Page');

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