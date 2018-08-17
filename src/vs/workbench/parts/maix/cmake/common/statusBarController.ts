import { StatusBarItem } from 'vs/workbench/parts/maix/cmake/common/statusBarButton';

enum State {
	Lock,
	Unlock,
}

export class StatusBarController {
	protected state: State = State.Unlock;
	protected lastArgs: any;

	constructor(
		protected readonly messageButton: StatusBarItem,
		protected readonly selectVariantButton: StatusBarItem,
		protected readonly selectTargetButton: StatusBarItem,
		protected readonly workspaceButtons: StatusBarItem[],
	) {
		this.setSelectedVariant(null);
		this.setSelectedTargetTitle(null);
	}

	protected emptyState() {
		if (this.state === State.Lock) {
			return;
		}
		this.state = State.Lock;

		this.lastArgs = this.messageButton.sleep();

		this.messageButton.text = '$(file-directory) Open any project to start.';
		this.messageButton.command = 'workbench.action.files.openFolder';
		this.messageButton.show(true);

		this.showWorkspace(false);
	}

	protected notEmptyState() {
		if (this.state === State.Unlock) {
			return;
		}
		this.state = State.Unlock;

		this.messageButton.wakeup(this.lastArgs);

		this.showWorkspace(true);
	}

	protected showWorkspace(isShow: boolean) {
		for (const item of this.workspaceButtons) {
			item.show(isShow);
		}
	}

	showMessage(message: string) {
		if (this.state === State.Lock) {
			return;
		}
		this.messageButton.command = '';
		this.messageButton.text = message;
	}

	setEmptyState(empty: boolean) {
		if (empty) {
			this.emptyState();
		} else {
			this.showWorkspace(true);
		}
	}

	setSelectedVariant(title: string) {
		if (title) {
			this.selectVariantButton.text = '[' + title + ']';
		} else {
			this.selectVariantButton.text = '<Default>';
		}
	}

	setSelectedTargetTitle(title: string) {
		if (title) {
			this.selectTargetButton.text = '[' + title + ']';
		} else {
			this.selectTargetButton.text = '<ALL>';
		}
	}
}