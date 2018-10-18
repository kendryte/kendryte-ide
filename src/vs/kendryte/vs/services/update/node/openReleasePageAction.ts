import { localize } from 'vs/nls';
import { shell } from 'electron';
import { TPromise } from 'vs/base/common/winjs.base';
import { Action } from 'vs/base/common/actions';
import { IDE_HOMEPAGE } from 'vs/kendryte/vs/services/update/common/protocol';

export class OpenKendryteReleasePageAction extends Action {
	public static readonly ID = 'workbench.action.kendryte.homepage';
	public static readonly LABEL = localize('update now', 'Update now');

	constructor(
		public readonly url = IDE_HOMEPAGE,
	) {
		super(OpenKendryteReleasePageAction.ID, OpenKendryteReleasePageAction.LABEL);
	}

	public run(event?: any): TPromise<boolean> {
		return new TPromise<boolean>((resolve, reject) => {
			resolve(shell.openExternal(this.url, undefined, e => reject(e)));
		});
	}
}