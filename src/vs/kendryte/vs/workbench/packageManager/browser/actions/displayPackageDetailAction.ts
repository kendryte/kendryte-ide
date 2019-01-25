import { localize } from 'vs/nls';
import { TPromise } from 'vs/base/common/winjs.base';
import { Action } from 'vs/base/common/actions';
import { PACKAGE_MANAGER_ACTION_ID_OPEN_PACKAGE } from 'vs/kendryte/vs/workbench/packageManager/common/type';
import { IRemotePackageInfo } from 'vs/kendryte/vs/workbench/packageManager/common/distribute';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { ILibraryProject } from 'vs/kendryte/vs/base/common/jsonSchemas/cmakeConfigSchema';
import { PackageDetailCompletionInput } from 'vs/kendryte/vs/workbench/packageManager/common/editors/packageDetailInput';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';

export class DisplayPackageDetailAction extends Action {
	public static readonly ID = PACKAGE_MANAGER_ACTION_ID_OPEN_PACKAGE;
	public static readonly LABEL = localize('openurl.package.homepage', 'Open Package Homepage');

	constructor(
		id: string = DisplayPackageDetailAction.ID,
		label: string = DisplayPackageDetailAction.LABEL,
		@IEditorService private editorService: IEditorService,
		@IInstantiationService private instantiationService: IInstantiationService,
	) {
		super(id, label);
	}

	public run(event: IRemotePackageInfo | ILibraryProject): TPromise<void> {
		const input = this.instantiationService.createInstance(PackageDetailCompletionInput, event.name, event.type);
		return this.editorService.openEditor(input, { pinned: true })
			.then(() => void (0));
	}
}