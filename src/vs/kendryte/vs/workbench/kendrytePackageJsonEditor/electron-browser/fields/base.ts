import { Disposable } from 'vs/base/common/lifecycle';
import { IUISection, IUISectionWidget } from 'vs/kendryte/vs/workbench/kendrytePackageJsonEditor/common/type';
import { localize } from 'vs/nls';
import { Button } from 'vs/base/browser/ui/button/button';
import { attachButtonStyler } from 'vs/platform/theme/common/styler';
import { $ } from 'vs/base/browser/dom';
import { URI } from 'vs/base/common/uri';
import { IFileDialogService } from 'vs/platform/dialogs/common/dialogs';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { resolvePath } from 'vs/kendryte/vs/base/common/resolvePath';
import { FileFilter } from 'vs/platform/windows/common/windows';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { async as fastGlobAsync, Pattern } from 'fast-glob';
import { CMAKE_LIBRARY_FOLDER_NAME } from 'vs/kendryte/vs/base/common/jsonSchemas/cmakeConfigSchema';
import { alwaysIgnorePattern, ignorePattern } from 'vs/kendryte/vs/platform/fileDialog/common/globalIgnore';
import { Emitter } from 'vs/base/common/event';
import { IKendryteWorkspaceService } from 'vs/kendryte/vs/services/workspace/common/type';

export enum SelectType {
	SelectSingle = 1,
	SelectMany = 0,
}

export abstract class AbstractFieldControl<T> extends Disposable {
	protected readonly title: string;
	protected readonly parent: HTMLDivElement;
	private readonly widget: IUISectionWidget<T>;

	private readonly _onUpdate = new Emitter<any>();
	public readonly onUpdate = this._onUpdate.event;

	abstract createControlList(): void;

	constructor(
		control: IUISection<T>,
		@IFileDialogService private readonly fileDialogService: IFileDialogService,
		@IKendryteWorkspaceService private readonly kendryteWorkspaceService: IKendryteWorkspaceService,
		@IThemeService private readonly themeService: IThemeService,
		@IConfigurationService protected readonly configurationService: IConfigurationService,
	) {
		super();

		this.title = control.title;
		this.parent = control.sectionControl;
		this.widget = control.widget;

		this.createControlList();
	}

	protected createCommonButton(iconClass: string, label: string, title: string) {
		const btn = this._register(new Button(this.parent));
		this._register(attachButtonStyler(btn, this.themeService));

		const icon = $('span.icon');
		icon.classList.add(...iconClass.split(' '));

		btn.label = label;
		btn.element.title = title;

		btn.element.prepend(icon);

		return btn;
	}

	protected selectFileSystem(type: 'folder', select: SelectType): Promise<string[]>;
	protected selectFileSystem(type: 'file', select: SelectType, filters?: FileFilter[]): Promise<string[]>;
	protected async selectFileSystem(type: 'file' | 'folder', select: SelectType, filters?: FileFilter[]): Promise<string[]> {
		const workspaceRoot = this.kendryteWorkspaceService.requireCurrentWorkspace();
		const ret = await this.fileDialogService.showOpenDialog({
			title: localize('select', 'select ') + this.title,
			defaultUri: URI.file(workspaceRoot),
			openLabel: localize('add', 'Add'),
			canSelectFiles: type === 'file',
			canSelectFolders: type === 'folder',
			canSelectMany: select === SelectType.SelectMany,
			filters,
		});
		if (!ret) {
			return [];
		}

		const result: string[] = [];
		for (const file of ret) {
			const fsp = resolvePath(file.fsPath);
			if (!fsp.startsWith(workspaceRoot)) {
				continue;
			}

			const relative = fsp.replace(workspaceRoot, '').replace(/^\/+/, '');

			if (
				relative.startsWith('build/') || relative === 'build' ||
				relative.startsWith('config/') || relative === 'config' ||
				relative.startsWith(CMAKE_LIBRARY_FOLDER_NAME + '/') || relative === CMAKE_LIBRARY_FOLDER_NAME ||
				/(^|\/)\./.test(relative) // is hidden file (or in hidden folder)
			) {
				continue;
			}
			result.push(relative);
		}

		return result;
	}

	protected mergeArray<T extends any[]>(list: T) {
		if (list.length === 0) {
			return;
		}
		const arr: T = this.widget.get() as any;
		list.forEach((item: any) => {
			if (!arr.includes(item)) {
				arr.push(item);
			}
		});
		this.updateSimple(arr);
	}

	protected globPath(sourceDir: string, recursive: boolean, types: string[]): Promise<string[]> {
		let exclude: Pattern[];
		if (sourceDir === '') {
			exclude = ignorePattern;
		} else {
			exclude = alwaysIgnorePattern;
		}
		const glob = `${sourceDir}${recursive ? '/**' : ''}/*.{${types.join(',')}}`;
		// console.log('glob files: "%s" in %s', glob, sourceDir);
		return fastGlobAsync(glob, {
			cwd: this.kendryteWorkspaceService.requireCurrentWorkspace(),
			stats: false,
			onlyFiles: true,
			followSymlinkedDirectories: false,
			absolute: false,
			brace: true,
			ignore: exclude,
		});
	}

	protected updateSimple(value: any): void {
		this.widget.set(value);
		this._onUpdate.fire(value);
	}
}

