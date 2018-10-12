import { VersionUrlHandler } from 'vs/kendryte/vs/services/update/node/versionUrlHandler';
import { INotificationService, Severity } from 'vs/platform/notification/common/notification';
import { localize } from 'vs/nls';
import { shell } from 'electron';
import { Action } from 'vs/base/common/actions';
import { IDE_HOMEPAGE } from 'vs/kendryte/vs/services/update/common/protocol';

function notifyAction() {
	return new Action(
		'kendryte.open',
		localize('more', 'More Info'),
		'',
		true,
		() => {
			return new Promise((resolve, reject) => {
				resolve(shell.openExternal(IDE_HOMEPAGE, undefined, e => reject(e)));
			});
		},
	);
}

export class RenderVersionUrlHandler extends VersionUrlHandler {
	constructor(
		@INotificationService private notificationService: INotificationService,
	) {
		super();
	}

	protected alertNotSupport() {
		this.notificationService.notify({
			severity: Severity.Error,
			message: `Kendryte IDE does not support your platform.`,
			actions: { primary: [notifyAction()] },
		});
	}
}