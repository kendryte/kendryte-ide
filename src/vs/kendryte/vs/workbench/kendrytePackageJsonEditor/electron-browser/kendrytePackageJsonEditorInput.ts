import { KENDRYTE_PACKAGE_JSON_EDITOR_ID, KENDRYTE_PACKAGE_JSON_EDITOR_INPUT_ID } from 'vs/kendryte/vs/workbench/kendrytePackageJsonEditor/common/ids';
import { Verbosity } from 'vs/workbench/common/editor';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { CMAKE_LIBRARY_FOLDER_NAME } from 'vs/kendryte/vs/base/common/jsonSchemas/cmakeConfigSchema';
import { localize } from 'vs/nls';
import { KendrytePackageJsonEditorModel } from 'vs/kendryte/vs/workbench/kendrytePackageJsonEditor/node/kendrytePackageJsonEditorModel';
import { CMAKE_CONFIG_FILE_NAME } from 'vs/kendryte/vs/base/common/constants/wellknownFiles';
import { JsonEditorInputBase } from 'vs/kendryte/vs/workbench/jsonGUIEditor/browser/editorInputBaseImpl';

export class KendrytePackageJsonEditorInput extends JsonEditorInputBase<KendrytePackageJsonEditorModel> {
	public static readonly EDITOR_ID: string = KENDRYTE_PACKAGE_JSON_EDITOR_ID;
	public static readonly ID: string = KENDRYTE_PACKAGE_JSON_EDITOR_INPUT_ID;

	createModel(instantiationService: IInstantiationService) {
		return instantiationService.createInstance(KendrytePackageJsonEditorModel, this.resource);
	}

	supportsSplitEditor(): boolean {
		return false;
	}

	matches(otherInput: KendrytePackageJsonEditorInput): boolean {
		if (this === otherInput) {
			return true;
		}
		try {
			return otherInput.getResource().toString() === this.getResource().toString();
		} catch (e) {
			return false;
		}
	}

	getTitle(verbosity: Verbosity = Verbosity.MEDIUM): string {
		if (verbosity === Verbosity.LONG) {
			const name = this.getPackageDirName();
			if (name) {
				return localize('kendrytePackageJson.editor.description.long', 'Configure CMake settings for {1} project', name);
			} else {
				return localize('kendrytePackageJson.editor.description.long_for', 'Configure CMake settings for this project');
			}
		} else if (verbosity === Verbosity.SHORT) {
			const name = this.getPackageDirName();
			if (name) {
				return `${CMAKE_CONFIG_FILE_NAME} [${name}]`;
			} else {
				return CMAKE_CONFIG_FILE_NAME;
			}
		} else {
			const name = this.getPackageDirName();
			if (name) {
				return localize('kendrytePackageJson.editor.description.medium_for', 'Project {0} settings', name);
			} else {
				return localize('kendrytePackageJson.editor.description.medium', 'Current project settings');
			}
		}
	}

	getDescription(verbosity: Verbosity = Verbosity.MEDIUM): string {
		return this.getPackageDirName() || '/';
	}

	private getPackageDirName(): string | void {
		const path = this.model.resource.fsPath;
		const parts = path.split(CMAKE_LIBRARY_FOLDER_NAME);
		if (parts.length === 1) {
			return void 0;
		}
		const last = parts.pop() as string;
		const m = /^[\/\\]([^\/\\]+)/.exec(last);

		return (m && m[1]) || 'Unknown';
	}
}
