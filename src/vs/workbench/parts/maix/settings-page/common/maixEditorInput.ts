import URI from 'vs/base/common/uri';
import { TPromise } from 'vs/base/common/winjs.base';
import * as nls from 'vs/nls';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { EditorInput, IEditorInputFactory } from 'vs/workbench/common/editor';
import { MySettingsEditorModelWrapper } from 'vs/workbench/parts/maix/common/preferencesModels';
import { IPreferencesService } from 'vs/workbench/services/preferences/common/preferences';
import { DefaultSettingsEditorModel } from 'vs/workbench/services/preferences/common/preferencesModels';
import { IStorageService, StorageScope } from 'vs/platform/storage/common/storage';
import { ILogService } from 'vs/platform/log/common/log';

const settingsInputTypeId = 'workbench.input.maixSettingsInput';

export class SettingsInputFactory implements IEditorInputFactory {
	static readonly ID = settingsInputTypeId;

	public serialize(editorInput: EditorInput): string {
		if (editorInput instanceof MaixSettingsEditorInput) {
			return editorInput.serialize();
		} else {
			return '';
		}
	}

	public deserialize(instantiationService: IInstantiationService, serializedEditorInput: string): MaixSettingsEditorInput {
		return instantiationService.createInstance(MaixSettingsEditorInput, serializedEditorInput);
	}
}

export class MaixSettingsEditorInput extends EditorInput {
	public static readonly ID: string = settingsInputTypeId;
	private model: MySettingsEditorModelWrapper;

	constructor(
		protected readonly switchTab: string = '',
		@IPreferencesService private preferencesService: IPreferencesService,
		@IInstantiationService private instantiationService: IInstantiationService,
		@IStorageService private storageService: IStorageService,
		@ILogService private log: ILogService,
	) {
		super();
	}

	getTypeId(): string {
		return MaixSettingsEditorInput.ID;
	}

	getName(): string {
		return nls.localize('maixSettingsEditorInputName', 'Settings Gui');
	}

	async resolve(refresh?: boolean): TPromise<MySettingsEditorModelWrapper> {
		if (!this.model) {
			const defaultModel = await this.preferencesService.createPreferencesEditorModel(
				URI.parse('vscode://defaultsettings/0/settings.json')) as DefaultSettingsEditorModel;
			const tab = this.storageService.get('MaixSettingsEditorInput', StorageScope.GLOBAL, '');
			this.log.debug('instantiationService. (MySettingsEditorModelWrapper): ', this.switchTab || tab);
			this.model = this.instantiationService.createInstance(MySettingsEditorModelWrapper, defaultModel, this.switchTab || tab);
		}
		return this.model;
	}

	matches(otherInput: any): boolean {
		return otherInput instanceof MaixSettingsEditorInput;
	}

	toString() {
		return '{MaixSettingsEditorInput}';
	}

	serialize() {
		return this.model.getRememberedCategory();
	}
}
