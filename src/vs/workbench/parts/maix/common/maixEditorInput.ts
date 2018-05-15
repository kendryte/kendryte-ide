import URI from 'vs/base/common/uri';
import { TPromise } from 'vs/base/common/winjs.base';
import * as nls from 'vs/nls';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { EditorInput, IEditorInputFactory } from 'vs/workbench/common/editor';
import { MySettingsEditorModelWrapper } from 'vs/workbench/parts/maix/common/preferencesModels';
import { IPreferencesService } from 'vs/workbench/services/preferences/common/preferences';
import { DefaultSettingsEditorModel } from 'vs/workbench/services/preferences/common/preferencesModels';

const settingsInputTypeId = 'workbench.input.maixSettingsInput';

export class SettingsInputFactory implements IEditorInputFactory {
	static readonly ID = settingsInputTypeId;

	public serialize(editorInput: EditorInput): string {
		if (editorInput instanceof MaixSettingsEditorInput) {
			return editorInput.serialize();
		} else {
			return '{}';
		}
	}

	public deserialize(instantiationService: IInstantiationService, serializedEditorInput: string): MaixSettingsEditorInput {
		return instantiationService.createInstance(MaixSettingsEditorInput, serializedEditorInput);
	}
}

export class MaixSettingsEditorInput extends EditorInput {
	public static readonly ID: string = settingsInputTypeId;

	constructor(
		input: string = '{}',
		@IPreferencesService private preferencesService: IPreferencesService
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
		const defaultModel = await this.preferencesService.createPreferencesEditorModel(URI.parse('vscode://defaultsettings/0/settings.json')) as DefaultSettingsEditorModel;
		return new MySettingsEditorModelWrapper(defaultModel);
	}

	matches(otherInput: any): boolean {
		return otherInput instanceof MaixSettingsEditorInput;
	}

	toString() {
		return '{MaixSettingsEditorInput}';
	}

	serialize() {
		return '{}';
	}
}
