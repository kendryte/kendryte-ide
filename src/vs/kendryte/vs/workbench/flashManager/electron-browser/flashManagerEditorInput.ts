import { ConfirmResult, EditorInput, IEditorInputFactory, IRevertOptions, Verbosity } from 'vs/workbench/common/editor';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { URI } from 'vs/base/common/uri';
import { CMAKE_LIBRARY_FOLDER_NAME } from 'vs/kendryte/vs/base/common/jsonSchemas/cmakeConfigSchema';
import { localize } from 'vs/nls';
import { KENDRYTE_FLASH_MANAGER_ID, KENDRYTE_FLASH_MANAGER_INPUT_ID, KENDRYTE_FLASH_MANAGER_TITLE } from 'vs/kendryte/vs/workbench/flashManager/common/ids';
import { FlashManagerModel } from 'vs/kendryte/vs/workbench/flashManager/node/flashManagerModel';

export class FlashManagerEditorInput extends EditorInput {
	public static readonly ID: string = KENDRYTE_FLASH_MANAGER_INPUT_ID;

	private readonly model: FlashManagerModel;
	private _dirty: boolean = false;

	/**
	 * An editor input who's contents are retrieved from file services.
	 */
	constructor(
		resource: URI,
		@IInstantiationService instantiationService: IInstantiationService,
	) {
		super();
		this.model = instantiationService.createInstance(FlashManagerModel, resource);
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

	confirmSave(): Promise<ConfirmResult> {
		return Promise.resolve(ConfirmResult.DONT_SAVE);
	}

	save(): Promise<boolean> {
		return Promise.resolve(true);
	}

	revert(options?: IRevertOptions): Promise<boolean> {
		return Promise.resolve(true);
	}

	getName(): string {
		return KENDRYTE_FLASH_MANAGER_TITLE;
	}

	getResource(): URI {
		return this.model.resource;
	}

	getTypeId(): string {
		return FlashManagerEditorInput.ID;
	}

	getPreferredEditorId(candidates: string[]): string {
		return KENDRYTE_FLASH_MANAGER_ID;
	}

	supportsSplitEditor(): boolean {
		return false;
	}

	matches(otherInput: FlashManagerEditorInput): boolean {
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
		const last = parts.pop() as string;
		const m = /^[\/\\]([^\/\\]+)/.exec(last);

		return (m && m[1]) || 'Unknown';
	}

	public resolve(): Promise<FlashManagerModel> {
		return this.model.load();
	}
}

interface ISerializedKendrytePackageJsonEditorInput {
	resource: string;
}

export class KendrytePackageJsonEditorInputFactory implements IEditorInputFactory {
	constructor() { }

	public serialize(editorInput: EditorInput): string {
		const input = <FlashManagerEditorInput>editorInput;

		const serialized: ISerializedKendrytePackageJsonEditorInput = {
			resource: input.getResource().toString(),
		};

		return JSON.stringify(serialized);
	}

	public deserialize(instantiationService: IInstantiationService, serializedEditorInput: string): EditorInput {
		const deserialized: ISerializedKendrytePackageJsonEditorInput = JSON.parse(serializedEditorInput);

		return instantiationService.createInstance(
			FlashManagerEditorInput,
			URI.parse(deserialized.resource),
		);
	}
}

