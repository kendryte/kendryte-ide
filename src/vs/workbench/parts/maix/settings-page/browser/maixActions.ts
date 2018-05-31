'use strict';

import { Action } from 'vs/base/common/actions';
import { TPromise } from 'vs/base/common/winjs.base';
import { localize } from 'vs/nls';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { FullScreenEditor } from 'vs/workbench/parts/maix/settings-page/browser/frame/FullScreenEditor';
import { MaixSettingsEditor } from 'vs/workbench/parts/maix/settings-page/browser/frame/maixSettingsEditor';
import { MaixSettingsEditorInput } from 'vs/workbench/parts/maix/settings-page/common/maixEditorInput';
import { IWorkbenchEditorService } from 'vs/workbench/services/editor/common/editorService';
import { ILogService } from 'vs/platform/log/common/log';

export const ShowMaixSettingsActionId = 'workbench.action.showMaixSettings';
export const ShowMaixSettingsActionLabel = localize('settingsPage', 'Show Settings Page');

export class ShowMaixSettingsAction extends Action {
	constructor(
		id: string,
		label: string,
		// @IWorkbenchEditorService private editorService: IWorkbenchEditorService,
		@IInstantiationService private instantiationService: IInstantiationService,
		@ILogService private log: ILogService,
	) {
		super(id, label);
	}

	async run(switchTab: string): TPromise<void> {
		// const input = this.instantiationService.createInstance(MaixSettingsEditorInput);
		// this.editorService.openEditor(input, { pinned: true }, Position.ONE).then(() => null);
		const inputData = this.instantiationService.createInstance(MaixSettingsEditorInput, switchTab);
		const $editor = this.instantiationService.createInstance(MaixSettingsEditor);
		const $container = this.instantiationService.createInstance(FullScreenEditor, $editor);

		await $container.create();
		await $container.setVisible(true);

		$container.layout();

		await $editor.setInput(inputData);

		$editor.focus();

		this.log.debug('ShowMaixSettingsAction Window Popup.');

		await new TPromise<void>((resolve) => {
			$container.toDispose({
				dispose() {
					resolve(void 0);
				}
			});
		});

		this.log.debug('ShowMaixSettingsAction Finished.');
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

	run(): TPromise<any> {
		const input = this.instantiationService.createInstance(MaixSettingsEditorInput, '{}');
		return this.editorService.openEditor(input, { pinned: true });
	}
}
