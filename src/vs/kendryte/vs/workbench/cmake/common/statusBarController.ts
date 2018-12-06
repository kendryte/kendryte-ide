import { StatusBarItem } from 'vs/kendryte/vs/workbench/cmake/common/statusBarButton';
import { ACTION_ID_MAIX_CMAKE_HELLO_WORLD, ACTION_ID_OPEN_CMAKE_LIST_CONFIG } from 'vs/kendryte/vs/workbench/cmake/common/actionIds';
import { CMAKE_CONFIG_FILE_NAME } from 'vs/kendryte/vs/base/common/jsonSchemas/cmakeConfigSchema';

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
		// console.log('[cmake] message =', message);
		if (this.state === State.Lock) {
			this.messageButton.text = message;
			this.messageButton.command = command;
			this.messageButton.show(true);
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

		// console.log('[cmake] button =', this.lastArgs);
		this.messageButton.wakeup(this.lastArgs);

		this.showWorkspace(true);
	}

	protected showWorkspace(isShow: boolean) {
		// console.log('[cmake] workspace =', isShow);
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

	setError() {
		this.emptyState('CMake config failed!', ACTION_ID_OPEN_CMAKE_LIST_CONFIG);
	}

	setWorking() {
		this.emptyState('CMake is working, please wait...', '');
	}

	setEmptyState(empty: false, cmakeProject: boolean);
	setEmptyState(empty: true);
	setEmptyState(empty: boolean, cmakeProject?: boolean) {
		if (empty) {
			// console.log('empty, need open folder.');
			this.emptyState(
				'$(file-directory) Open any project to start.',
				'workbench.action.files.openFolder',
			);
		} else if (cmakeProject) {
			// console.log('CMake project found');
			this.notEmptyState();
		} else {
			// console.log('no cmake file, need create hello_world.');
			this.emptyState(
				'$(plus) Create ' + CMAKE_CONFIG_FILE_NAME + ' to start a project.',
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