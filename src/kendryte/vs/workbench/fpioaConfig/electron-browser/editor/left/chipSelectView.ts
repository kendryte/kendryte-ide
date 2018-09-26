import { IRenderer } from 'vs/base/browser/ui/list/list';
import { IListChipSelectEntry, TEMPLATE_ID } from 'kendryte/vs/workbench/fpioaConfig/electron-browser/editor/left/ids';
import { IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { ISelectData, SelectBox } from 'vs/base/browser/ui/selectBox/selectBox';
import { dispose, IDisposable } from 'vs/base/common/lifecycle';
import { getChipPackaging } from 'kendryte/vs/workbench/fpioaConfig/common/packagingRegistry';
import { Emitter, Event } from 'vs/base/common/event';
import { attachSelectBoxStyler } from 'vs/platform/theme/common/styler';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { addClass } from 'vs/base/browser/dom';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { localize } from 'vs/nls';

export interface IChipSelectTemplate {
	parent: HTMLElement;
	input: SelectBox;
	toDispose: IDisposable[];
}

export class ChipSelectRenderer implements IRenderer<IListChipSelectEntry, IChipSelectTemplate> {
	private names: string[];

	private readonly _onDidChange = new Emitter<string>();
	readonly onDidChange: Event<string> = this._onDidChange.event;
	private firing: boolean;
	private lastSelect: number = 0;

	constructor(
		@IContextViewService protected contextViewService: IContextViewService,
		@IThemeService protected themeService: IThemeService,
		@IDialogService protected dialogService: IDialogService,
	) {
		this.names = getChipPackaging().map(item => item.name);
		this.names.unshift('--');
	}

	get templateId(): string {
		return TEMPLATE_ID.CHIP_SELECT;
	}

	renderTemplate(parent: HTMLElement): IChipSelectTemplate {
		const input = new SelectBox(this.names, undefined, this.contextViewService);
		parent.innerHTML = '<h3>Select Chip Packaging:</h3>';
		input.render(parent);

		const toDispose = [
			input.onDidSelect(index => this.handleChange(input, index)),
			attachSelectBoxStyler(input, this.themeService),
		];

		addClass(parent, 'chip-select');

		return {
			parent,
			input,
			toDispose,
		};
	}

	renderElement(element: IListChipSelectEntry, index: number, template: IChipSelectTemplate): void {
		this.lastSelect = this.names.indexOf(element.selected);
		if (this.lastSelect === -1) {
			this.lastSelect = 0;
		}
		this.firing = true;
		template.input.select(this.lastSelect);
		this.firing = false;
	}

	public disposeElement(element: IListChipSelectEntry, index: number, templateData: any): void {
		// noop?
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
					this._onDidChange.fire(undefined);
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
