import { INotificationService } from 'vs/platform/notification/common/notification';
import { localize } from 'vs/nls';
import { toErrorMessage } from 'vs/base/common/errorMessage';

export function promiseWithNotificationService(action: string, promise: Promise<any>, notificationService: INotificationService) {
	promise.then(() => {
		notificationService.info(localize('completeTo', 'Complete {0}', action));
	}, (e) => {
		notificationService.error(localize('failedTo', 'Failed to {0}', action) + ', ' + toErrorMessage(e));
	});
}