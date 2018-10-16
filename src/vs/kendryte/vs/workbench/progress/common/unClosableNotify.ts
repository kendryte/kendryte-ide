import {
	INotification,
	INotificationActions,
	INotificationHandle,
	INotificationProgress,
	INotificationService,
	NotificationMessage,
	Severity,
} from 'vs/platform/notification/common/notification';
import { Event } from 'vs/base/common/event';
import { IDisposable } from 'vs/base/common/lifecycle';

export function unClosableNotify(notificationService: INotificationService, init: INotification): { revoke: () => void } & IDisposable & INotificationHandle {
	let handle: INotificationHandle;
	let progress: INotificationProgress;

	let closed = false;
	let total: number = NaN;
	let last = 0;

	let lastProgressInfinite = false;
	let lastTotal = NaN;
	let lastWorked = NaN;
	let lastDone = false;

	const start = () => {
		handle = notificationService.notify(init);
		if (isNaN(total)) {
			handle.progress.infinite();
		} else {
			handle.progress.total(total);
			handle.progress.worked(last);
		}

		const d = handle.onDidClose(() => {
			if (!closed) {
				start();
			}
			d.dispose();
		});

		if (lastProgressInfinite) {
			handle.progress.infinite();
		} else if (lastDone) {
			handle.progress.done();
		} else {
			if (!isNaN(lastTotal)) {
				handle.progress.total(lastTotal);
			}
			if (!isNaN(lastWorked)) {
				handle.progress.worked(lastWorked);
			}
		}

		progress = {
			infinite() {
				lastDone = false;
				lastProgressInfinite = true;
				handle.progress.infinite();
			},
			total(value: number) {
				lastDone = false;
				lastProgressInfinite = false;
				lastTotal = value;
				handle.progress.total(value);
			},
			worked(value: number) {
				lastDone = false;
				lastProgressInfinite = false;
				lastWorked = value;
				handle.progress.worked(value);
			},
			done() {
				lastDone = true;
				lastProgressInfinite = false;
				handle.progress.done();
			},
		};
	};

	start();

	return {
		get onDidClose(): Event<void> {
			return handle.onDidClose;
		},
		get progress(): INotificationProgress {
			return progress;
		},
		updateSeverity(severity: Severity): void {
			init.severity = severity;
			return handle.updateSeverity(severity);
		},
		updateMessage(message: NotificationMessage): void {
			init.message = message;
			return handle.updateMessage(message);
		},
		updateActions(actions?: INotificationActions): void {
			init.actions = actions;
			return handle.updateActions(actions);
		},
		close(): void {
			return handle.close();
		},
		revoke() {
			closed = true;
		},
		dispose() {
			closed = true;
			handle.close();
		},
	};
}