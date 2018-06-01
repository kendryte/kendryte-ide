import { IView } from 'vs/base/browser/ui/splitview/splitview';
import { Disposable } from 'vs/base/common/lifecycle';
import { Orientation } from 'vs/base/browser/ui/sash/sash';
import { Emitter, Event } from 'vs/base/common/event';
import { IFuncPinMap } from 'vs/workbench/parts/maix/fpgio-config/electron-browser/fpgioModel';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { $, addClasses } from 'vs/base/browser/dom';
import { attachStyler, IThemable } from 'vs/platform/theme/common/styler';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { editorWidgetBackground, editorWidgetBorder } from 'vs/platform/theme/common/colorRegistry';
import { getChipPackaging } from 'vs/workbench/parts/maix/fpgio-config/common/packagingRegistry';
import { chipRenderFactory } from 'vs/workbench/parts/maix/fpgio-config/electron-browser/editor/right/factory';
import { AbstractTableRender } from 'vs/workbench/parts/maix/fpgio-config/electron-browser/editor/right/abstract';

export class FpgioRightPanel extends Disposable implements IView, IThemable {
	element: HTMLElement;
	minimumSize: number = 320;
	maximumSize: number = Infinity;

	private readonly _onDidChange = new Emitter<undefined>();
	readonly onDidChange: Event<undefined> = this._onDidChange.event;

	private table: AbstractTableRender;

	constructor(
		@IInstantiationService instantiationService: IInstantiationService,
		@IThemeService themeService: IThemeService,
	) {
		super();
		this.element = $('div');
		addClasses(this.element, 'rightPanel', 'full-height-panel');

		this._register(attachStyler(themeService, {
			background: editorWidgetBackground,
			leftLine: editorWidgetBorder,
		}, this));
		/// create table
	}

	style(colors: any) {
		this.element.style.background = colors.background.toString();
		this.element.style.borderLeft = colors.leftLine.toString() + ' 1px solid';
	}

	public layout(size: number, orientation: Orientation): void {
	}

	fillTable(currentFuncMap: IFuncPinMap) {
	}

	destroyTable() {

	}

	drawChip(chipName: string) {
		if (this.table && this.table.chipName === chipName) {
			return;
		}

		this.element.innerHTML = '';

		const chip = getChipPackaging(chipName);

		this.table = chipRenderFactory(chip);
		this.table.render(this.element);
		this._register(this.table);
	}
}
