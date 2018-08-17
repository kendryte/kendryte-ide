import { Action } from 'vs/base/common/actions';
import { TPromise } from 'vs/base/common/winjs.base';
import { localize } from 'vs/nls';
import { ACTION_ID_MAIX_CMAKE_UPLOAD } from 'vs/workbench/parts/maix/cmake/common/type';

export class MaixCMakeUploadAction extends Action {
	public static readonly ID = ACTION_ID_MAIX_CMAKE_UPLOAD;
	public static readonly LABEL = localize('Upload', 'Upload');

	constructor() {
		super(MaixCMakeUploadAction.ID, MaixCMakeUploadAction.LABEL);
	}

	async run(): TPromise<void> {

	}
}