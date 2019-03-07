import {
	KENDRYTE_PACKAGE_JSON_EDITOR_ID,
	KENDRYTE_PACKAGE_JSON_EDITOR_INPUT_ID,
	KENDRYTE_PACKAGE_JSON_EDITOR_TITLE,
} from 'vs/kendryte/vs/workbench/kendrytePackageJsonEditor/common/ids';
import { ConfirmResult, EditorInput, IEditorInputFactory, IRevertOptions, Verbosity } from 'vs/workbench/common/editor';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { URI } from 'vs/base/common/uri';
import { CMAKE_LIBRARY_FOLDER_NAME } from 'vs/kendryte/vs/base/common/jsonSchemas/cmakeConfigSchema';
import { localize } from 'vs/nls';
import { KendrytePackageJsonEditorModel } from 'vs/kendryte/vs/workbench/kendrytePackageJsonEditor/node/kendrytePackageJsonEditorModel';
import { TPromise } from 'vs/base/common/winjs.base';

export class KendrytePackageJsonEditorInput extends EditorInput {
	public static readonly ID: string = KENDRYTE_PACKAGE_JSON_EDITOR_INPUT_ID;

	private readonly model: KendrytePackageJsonEditorModel;
	private _dirty: boolean = false;

	/**
	 * An editor input who's contents are retrieved from file services.
	 */
	constructor(
		resource: URI,
		@IInstantiationService instantiationService: IInstantiationService,
	) {
		super();
		this.model = instantiationService.createInstance(KendrytePackageJsonEditorModel, resource);
	}

	protected setDirty(dirty: boolean = true) {
		if (this._dirty === dirty) {
			return;
		}
		this._dirty = !!dirty;
		this._onDidChangeDirty.fire();
	}

	isDirty(): boolean {
		return this._dirty;
	}

	confirmSave(): TPromise<ConfirmResult> {
		return TPromise.wrap(ConfirmResult.DONT_SAVE);
	}

	save(): TPromise<boolean> {
		return TPromise.as(true);
	}

	revert(options?: IRevertOptions): TPromise<boolean> {
		return TPromise.as(true);
	}

	getName(): string {
		return KENDRYTE_PACKAGE_JSON_EDITOR_TITLE;
	}

	getResource(): URI {
		return this.model.resource;
	}

	getTypeId(): string {
		return KendrytePackageJsonEditorInput.ID;
	}

	getPreferredEditorId(candidates: string[]): string {
		return KENDRYTE_PACKAGE_JSON_EDITOR_ID;
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
				return `kendryte-package.json [${name}]`;
			} else {
				return 'kendryte-package.json';
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
		const last = parts.pop();
		const m = /^[\/\\]([^\/\\]+)/.exec(last);

		return m[1] || 'Unknown';
	}

	public resolve(): Promise<KendrytePackageJsonEditorModel> {
		return this.model.load();
	}
}

interface ISerializedKendrytePackageJsonEditorInput {
	resource: string;
}

export class KendrytePackageJsonEditorInputFactory implements IEditorInputFactory {
	constructor() { }

	public serialize(editorInput: EditorInput): string {
		const input = <KendrytePackageJsonEditorInput>editorInput;

		const serialized: ISerializedKendrytePackageJsonEditorInput = {
			resource: input.getResource().toString(),
		};

		return JSON.stringify(serialized);
	}

	public deserialize(instantiationService: IInstantiationService, serializedEditorInput: string): EditorInput {
		const deserialized: ISerializedKendrytePackageJsonEditorInput = JSON.parse(serializedEditorInput);

		return instantiationService.createInstance(
			KendrytePackageJsonEditorInput,
			URI.parse(deserialized.resource),
		);
	}
}

