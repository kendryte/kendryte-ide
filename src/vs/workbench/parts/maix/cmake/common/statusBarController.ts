import { StatusBarItem } from 'vs/workbench/parts/maix/cmake/common/statusBarButton';
import { ACTION_ID_MAIX_CMAKE_HELLO_WORLD } from 'vs/workbench/parts/maix/_library/common/type';

enum State {
	Lock,
	Unlock,
}

export class StatusBarController {
	protected state: State;
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

	protected emptyState(message: string, command: string) {
		if (this.state === State.Lock) {
			return;
		}
		this.state = State.Lock;

		this.lastArgs = this.messageButton.sleep();

		this.messageButton.text = message;
		this.messageButton.command = command;
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
		this.messageButton.show(message.length > 0);
	}

	setEmptyState(empty: false, cmakeProject: boolean);
	setEmptyState(empty: true);
	setEmptyState(empty: boolean, cmakeProject?: boolean) {
		if (empty) {
			console.log('empty, need open folder.');
			this.emptyState(
				'$(file-directory) Open any project to start.',
				'workbench.action.files.openFolder',
			);
		} else if (cmakeProject) {
			console.log('CMake project found');
			this.notEmptyState();
		} else {
			console.log('no cmake file, need create hello_world.');
			this.emptyState(
				'$(plus) Create CMakeFiles.txt to start a project.',
				ACTION_ID_MAIX_CMAKE_HELLO_WORLD,
			);
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