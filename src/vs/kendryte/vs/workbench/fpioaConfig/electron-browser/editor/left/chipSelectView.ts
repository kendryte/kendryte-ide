import { IListChipSelectElement, TEMPLATE_ID } from 'vs/kendryte/vs/workbench/fpioaConfig/electron-browser/editor/left/ids';
import { IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { ISelectData, ISelectOptionItem, SelectBox } from 'vs/base/browser/ui/selectBox/selectBox';
import { dispose, IDisposable } from 'vs/base/common/lifecycle';
import { getChipPackaging } from 'vs/kendryte/vs/workbench/fpioaConfig/common/packagingRegistry';
import { Emitter } from 'vs/base/common/event';
import { attachSelectBoxStyler } from 'vs/platform/theme/common/styler';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { addClass } from 'vs/base/browser/dom';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { localize } from 'vs/nls';
import { selectBoxFindIndex, selectBoxNames, selectBoxSplitter } from 'vs/kendryte/vs/base/browser/ui/selectBox';
import { ITreeNode, ITreeRenderer } from 'vs/base/browser/ui/tree/tree';

export interface IChipSelectTemplate {
	parent: HTMLElement;
	input: SelectBox;
	toDispose: IDisposable[];
}

export class ChipSelectRenderer implements ITreeRenderer<IListChipSelectElement, void, IChipSelectTemplate> {
	private readonly names: ISelectOptionItem[];

	private readonly _onDidChange = new Emitter<string | undefined>();
	readonly onDidChange = this._onDidChange.event;
	private firing: boolean;
	private lastSelect: number = 0;

	constructor(
		@IContextViewService protected contextViewService: IContextViewService,
		@IThemeService protected themeService: IThemeService,
		@IDialogService protected dialogService: IDialogService,
	) {
		this.names = getChipPackaging().map(item => item.name).map(selectBoxNames);
		this.names.unshift(selectBoxSplitter);
	}

	get templateId(): string {
		return TEMPLATE_ID.CHIP_SELECT;
	}

	renderTemplate(parent: HTMLElement): IChipSelectTemplate {
		const input = new SelectBox(this.names, 0, this.contextViewService);
		parent.innerHTML = '<h3>Select Chip Packaging:</h3>';
		input.render(parent);

		const toDispose = [
			input.onDidSelect((index: ISelectData) => this.handleChange(input, index)),
			attachSelectBoxStyler(input, this.themeService),
		];

		addClass(parent, 'chip-select');

		return {
			parent,
			input,
			toDispose,
		};
	}

	renderElement(element: ITreeNode<IListChipSelectElement>, index: number, template: IChipSelectTemplate, dynamicHeightProbing?: boolean | undefined): void {
		this.lastSelect = selectBoxFindIndex(this.names, element.element.selected);
		if (this.lastSelect === -1) {
			this.lastSelect = 0;
		}
		this.firing = true;
		template.input.select(this.lastSelect);
		this.firing = false;
	}

	public disposeElement(element: ITreeNode<IListChipSelectElement>, index: number, templateData: any): void {
	}

	disposeTemplate(template: IChipSelectTemplate): void {
		dispose(template.input, ...template.toDispose);
	}

	private handleChange(input: SelectBox, selected: ISelectData) {
		if (this.firing) {
			return;
		}
		if (this.lastSelect === selected.index) {
			return;
		}

		this.firing = true;

		if (this.lastSelect === 0) {
			this._onDidChange.fire(selected.selected);
			this.firing = false;
			return;
		}

		this.dialogService.confirm({
			title: localize('alert', 'Alert'),
			message: localize('chip.select.overwrite.alert', 'Your pin config will lost. Are you sure?'),
			type: 'warning',
		}).then(({ confirmed }) => {
			if (confirmed) {
				this.lastSelect = selected.index;
				if (selected.index === 0) {
					this._onDidChange.fire(void 0);
				} else {
					this._onDidChange.fire(selected.selected);
				}
			} else {
				input.select(this.lastSelect);
			}
			this.firing = false;
		}, () => {
			this.firing = false;
		});
	}
}
