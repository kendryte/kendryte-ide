'use strict';

import { TPromise } from 'vs/base/common/winjs.base';
import * as nls from 'vs/nls';
import { Action } from 'vs/base/common/actions';
import { IPartService } from 'vs/workbench/services/part/common/partService';

export class OpenMaixSettingsAction extends Action {

	public static readonly ID = 'workbench.action.openMaixSettings';
	public static readonly LABEL = nls.localize('openMaixSettings', "Open Maix Settings");

	constructor(
		id: string,
		label: string,
		@IPartService private partService: IPartService
	) {
		super(id, label);
	}

	public run(event?: any): TPromise<any> {
		return this.partService.setMaixHidden(false);
	}
}