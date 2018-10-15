import { IVersionUrlHandler, VersionUrlHandler } from 'vs/kendryte/vs/services/update/node/versionUrlHandler';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import Severity from 'vs/base/common/severity';
import { localize } from 'vs/nls';
import { shell } from 'electron';
import { IDE_HOMEPAGE } from 'vs/kendryte/vs/services/update/common/protocol';
import { registerMainSingleton } from 'vs/kendryte/vs/platform/instantiation/common/mainExtensions';

class MainVersionUrlHandler extends VersionUrlHandler {
	constructor(
		@IDialogService private dialogService: IDialogService,
	) {
		super();
	}

	protected alertNotSupport() {
		this.dialogService.show(
			Severity.Error,
			`Kendryte IDE does not support your platform.`,
			[localize('more', 'More Info'), localize('cancel', 'Cancel')],
		).then((selection) => {
			if (selection === 0) {
				return new Promise((resolve, reject) => {
					resolve(shell.openExternal(IDE_HOMEPAGE, undefined, e => reject(e)));
				});
			} else {
				return Promise.resolve();
			}
		});
	}
}

registerMainSingleton(IVersionUrlHandler, MainVersionUrlHandler);
