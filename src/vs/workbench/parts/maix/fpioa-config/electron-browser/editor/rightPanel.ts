import { IView } from 'vs/base/browser/ui/splitview/splitview';
import { Disposable } from 'vs/base/common/lifecycle';
import { Emitter, Event } from 'vs/base/common/event';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { $, addClasses, append } from 'vs/base/browser/dom';
import { attachStyler, IThemable } from 'vs/platform/theme/common/styler';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { editorWidgetBackground, editorWidgetBorder } from 'vs/platform/theme/common/colorRegistry';
import { getChipPackaging } from 'vs/workbench/parts/maix/fpioa-config/common/packagingRegistry';
import { chipRenderFactory } from 'vs/workbench/parts/maix/fpioa-config/electron-browser/editor/right/factory';
import { AbstractTableRender } from 'vs/workbench/parts/maix/fpioa-config/electron-browser/editor/right/abstract';
import { IFuncPinMap } from 'vs/workbench/parts/maix/fpioa-config/common/types';

export class FpioaRightPanel extends Disposable implements IView, IThemable {
	element: HTMLElement;
	minimumSize: number = 320;
	maximumSize: number = Infinity;

	private readonly _onDidChange = new Emitter<undefined>();
	readonly onDidChange: Event<undefined> = this._onDidChange.event;

	private table: AbstractTableRender<any>;
	private $table: HTMLElement;
	private tableDrawed = false;

	constructor(
		@IInstantiationService instantiationService: IInstantiationService,
		@IThemeService private themeService: IThemeService,
	) {
		super();
		this.element = $('div');
		addClasses(this.element, 'rightPanel', 'full-height-panel');

		this.$table = append(this.element, $('div.table'));

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

	public layout(): void {
		if (this.table) {
			const { clientWidth: width, clientHeight: height } = this.element;
			const min = Math.min(width, height);
			this.table.layout(min);
		}
	}

	fillTable(currentFuncMap: IFuncPinMap) {
		this.table.setFuncMap(currentFuncMap);
	}

	private destroyTable() {
		this.$table.innerHTML = '<h1 style="text-align:center;">Select a chip to start.</h1>';
		this.tableDrawed = false;
	}

	drawChip(chipName: string) {
		if (!chipName) {
			this.destroyTable();
			return;
		}

		if (this.tableDrawed && this.table.chipName === chipName) {
			return;
		}

		if (this.table) {
			this.table.dispose();
		}

		this.table = chipRenderFactory(getChipPackaging(chipName), this.themeService);

		this.$table.innerHTML = '';
		this.table.render(this.$table);
		this.tableDrawed = true;

		this.layout();
	}

	dispose() {
		super.dispose();
		if (this.table) {
			this.table.dispose();
			delete this.table;
		}
	}
}
