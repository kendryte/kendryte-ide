import { EditorModel } from 'vs/workbench/common/editor';
import { ISetting } from 'vs/workbench/services/preferences/common/preferences';
import { DefaultSettingsEditorModel } from 'vs/workbench/services/preferences/common/preferencesModels';

export interface ITitle {
	title: '';
}

export class MySettingsEditorModelWrapper extends EditorModel {
	protected mapper: { [id: string]: ISetting };
	protected filteredList: (ITitle | ISetting)[] = [];

	public get settings(): (ITitle | ISetting)[] {
		return this.filteredList;
	}

	constructor(private readonly model: DefaultSettingsEditorModel) {
		super();

		this.recreate();
		this._register(model.onDidChangeGroups(() => this.recreate()));
	}

	private recreate() {
		this.mapper = {};
		for (const group of this.model.settingsGroups) {
			for (const section of group.sections) {
				for (const setting of section.settings) {
					this.mapper[setting.key] = setting;
				}
			}
		}
	}

	public setCategoryFilter(idList: string[]) {
		this.filteredList = (idList || []).map((settingId) => {
			if (settingId.indexOf('--') === 0) {
				return {
					title: settingId.replace(/^--/, '')
				} as ITitle;
			} else {
				return this.mapper[settingId];
			}
		});
	}
}
