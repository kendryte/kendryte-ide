import { IHistoryNavigationWidget } from 'vs/base/browser/history';
import { status } from 'vs/base/browser/ui/aria/aria';
import { IDisposable } from 'vs/base/common/lifecycle';
import { SERIAL_PORT_HISTORY_STORAGE_KEY } from 'vs/kendryte/vs/workbench/serialPort/common/type';
import { IStorageService, StorageScope } from 'vs/platform/storage/common/storage';
import { HistoryNavigator } from 'vs/base/common/history';
import { Emitter, Event } from 'vs/base/common/event';

export class SerialReplHistory implements IHistoryNavigationWidget, IDisposable {
	private readonly history: HistoryNavigator<string>;

	private readonly _onNavigate: Emitter<string> = new Emitter<string>();
	readonly onNavigate: Event<string> = this._onNavigate.event;

	constructor(
		@IStorageService private storageService: IStorageService,
	) {
		this.history = new HistoryNavigator(JSON.parse(this.storageService.get(SERIAL_PORT_HISTORY_STORAGE_KEY, StorageScope.WORKSPACE, '[]')), 50);
	}

	public showPreviousValue() {
		this.navigateHistory(true);
	}

	public showNextValue() {
		this.navigateHistory(false);
	}

	private navigateHistory(previous: boolean): void {
		const historyInput = previous ? this.history.previous() : this.history.next();
		if (historyInput) {
			status(historyInput);
			this._onNavigate.fire(historyInput);
		}
	}

	public dispose(): void {
		const replHistory = this.history.getHistory();
		if (replHistory.length) {
			this.storageService.store(SERIAL_PORT_HISTORY_STORAGE_KEY, JSON.stringify(replHistory), StorageScope.WORKSPACE);
		} else {
			this.storageService.remove(SERIAL_PORT_HISTORY_STORAGE_KEY, StorageScope.WORKSPACE);
		}
	}

	add(value: string) {
		this.history.add(value);
	}
}