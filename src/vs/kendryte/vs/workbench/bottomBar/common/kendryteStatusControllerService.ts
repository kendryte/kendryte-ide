import { ILifecycleService, LifecyclePhase } from 'vs/platform/lifecycle/common/lifecycle';
import { IStatusbarService, StatusbarAlignment } from 'vs/platform/statusbar/common/statusbar';
import { IKendryteStatusControllerService, IPartMyStatusBarItem, StatusBarLeftLocation } from 'vs/kendryte/vs/workbench/bottomBar/common/type';
import { MyStatusBarItem } from 'vs/kendryte/vs/workbench/bottomBar/common/myStatusBarItem';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { DisposableSet } from 'vs/kendryte/vs/base/common/lifecycle/disposableSet';
import { StackArray } from 'vs/kendryte/vs/base/common/lifecycle/stackArray';
import { dispose, IDisposable } from 'vs/base/common/lifecycle';

interface DisposeStatusBarItem extends MyStatusBarItem {
	__originalDispose: Function;
}

export class KendryteStatusControllerService implements IDisposable, IKendryteStatusControllerService {
	public _serviceBrand: any;
	private readonly counter = new Map<number, number>();
	private readonly instanceList: DisposableSet<MyStatusBarItem>;
	private readonly messageButtonMap = new Map<string, MyStatusBarItem>();
	private readonly messageIdStack = new StackArray<string>();
	private readonly toDispose: IDisposable[];

	constructor(
		@ILifecycleService lifecycleService: ILifecycleService,
		@IStatusbarService private readonly statusbarService: IStatusbarService,
		@IContextKeyService private readonly contextKeyService: IContextKeyService,
	) {
		this.instanceList = new DisposableSet();

		const changeEvent = contextKeyService.onDidChangeContext((e) => {
			this.instanceList.forEach((item) => {
				const contextKey = item.getContextKey();
				if (contextKey && e.affectsSome(contextKey.list)) {
					const willShow = contextKey.expr.evaluate(contextKeyService.getContext(null));
					// console.log(' changed, ', contextKey.list.values(), willShow, contextKeyService);
					if (willShow) {
						item.show();
					} else {
						item.hide();
					}
				}
			});
		});

		this.toDispose = [changeEvent];

		lifecycleService.onShutdown(() => {
			this.dispose();
		});

		lifecycleService.when(LifecyclePhase.Ready).then(() => {
			this.onReady();
		});
	}

	createInstance(bigPos?: number): MyStatusBarItem {
		const button = new MyStatusBarItem(this.statusbarService) as DisposeStatusBarItem;
		button.align = StatusbarAlignment.LEFT;

		if (bigPos) {
			const value = this.counter.get(bigPos) || 100;

			this.counter.set(bigPos, value - 1);
			button.position = bigPos + parseFloat(((value - 1) / 100).toFixed(2));
		}

		this.instanceList.add(button);
		return button;
	}

	destroyInstance(button: MyStatusBarItem): void {
		this.instanceList.delete(button);
	}

	resolveMessage(id: string) {
		if (this.messageButtonMap.has(id)) {
			(this.messageButtonMap.get(id) as MyStatusBarItem).dispose();
		}
	}

	showMessage(id: string): IPartMyStatusBarItem {
		if (this.messageButtonMap.has(id)) {
			return this.messageButtonMap.get(id) as MyStatusBarItem;
		}

		if (this.messageIdStack.size()) {
			(this.messageButtonMap.get(this.messageIdStack.top()) as MyStatusBarItem).hide();
		}

		const button = this.createInstance();
		button.align = StatusbarAlignment.LEFT;
		button.position = StatusBarLeftLocation.MESSAGE;

		this.messageButtonMap.set(id, button);
		this.messageIdStack.push(id);

		button.onDispose(() => {
			this.messageButtonMap.delete(id);
			if (id === this.messageIdStack.top()) {
				this.messageIdStack.pop();
			} else {
				this.messageIdStack.removeFrame(id);
			}
		});

		setImmediate(() => {
			button.show();
		});

		return button;
	}

	private onReady() {
		for (const item of this.instanceList) {
			this.refreshShowStatusByContext(item);
		}
	}

	private refreshShowStatusByContext(button: MyStatusBarItem) {
		const contextKey = button.getContextKey();
		if (contextKey) {
			if (contextKey.expr.evaluate(this.contextKeyService.getContext(null))) {
				button.show();
			} else {
				button.hide();
			}
		} else {
			button.show();
		}
	}

	dispose() {
		this.instanceList.dispose();
		this.counter.clear();
		dispose(this.toDispose);
	}
}
