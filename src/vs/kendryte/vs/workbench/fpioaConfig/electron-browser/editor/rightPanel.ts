import { IView } from 'vs/base/browser/ui/splitview/splitview';
import { Disposable, dispose, IDisposable } from 'vs/base/common/lifecycle';
import { Emitter, Event } from 'vs/base/common/event';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { $, addClasses, append } from 'vs/base/browser/dom';
import { attachStyler, IThemable } from 'vs/platform/theme/common/styler';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { editorWidgetBackground, editorWidgetBorder } from 'vs/platform/theme/common/colorRegistry';
import { getChipPackaging } from 'vs/kendryte/vs/workbench/fpioaConfig/common/packagingRegistry';
import { chipRenderFactory } from 'vs/kendryte/vs/workbench/fpioaConfig/electron-browser/editor/right/factory';
import { AbstractTableRender } from 'vs/kendryte/vs/workbench/fpioaConfig/electron-browser/editor/right/abstract';
import { ContextMenuData, IFuncPinMap, PinFuncSetEvent } from 'vs/kendryte/vs/workbench/fpioaConfig/common/types';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IMenuService } from 'vs/platform/actions/common/actions';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { Separator } from 'vs/base/browser/ui/actionbar/actionbar';
import { ContextSubMenuSelector } from 'vs/kendryte/vs/workbench/fpioaConfig/electron-browser/editor/contextMenu';

export class FpioaRightPanel extends Disposable implements IView, IThemable {
	element: HTMLElement;
	minimumSize: number = 320;
	maximumSize: number = Infinity;

	private readonly _onDidChange = new Emitter<undefined>();
	readonly onDidChange: Event<undefined> = this._onDidChange.event;

	private readonly _onSetPinFunc = new Emitter<PinFuncSetEvent>();
	readonly onSetPinFunc: Event<PinFuncSetEvent> = this._onSetPinFunc.event;

	private table: AbstractTableRender<any>;
	private $table: HTMLElement;
	private contextEvent: IDisposable;
	private funcSetActions: ContextSubMenuSelector;

	constructor(
		@IInstantiationService protected instantiationService: IInstantiationService,
		@IContextMenuService protected contextMenuService: IContextMenuService,
		@IThemeService protected themeService: IThemeService,
		@IMenuService menuService: IMenuService,
		@IContextKeyService contextKeyService: IContextKeyService,
	) {
		super();
		this.element = $('div');
		addClasses(this.element, 'rightPanel', 'full-height-panel');

		this.$table = append(this.element, $('div.table'));

		this._register(attachStyler(themeService, {
			background: editorWidgetBackground,
			leftLine: editorWidgetBorder,
		}, this));
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
		this.disposeTable();
		this.$table.innerHTML = '<h1 style="text-align:center;">Select a chip to start.</h1>';
	}

	drawChip(chipName: string | undefined) {
		if (!chipName) {
			this.destroyTable();
			return;
		}

		if (this.table && this.table.chipName === chipName) {
			return;
		}

		this.disposeTable();

		const chip = getChipPackaging(chipName);
		if (!chip) {
			return;
		}
		this.table = chipRenderFactory(chip, this.themeService);
		this.funcSetActions = this.instantiationService.createInstance(ContextSubMenuSelector, chipName);

		this.contextEvent = this.table.onContextMenu((data: ContextMenuData) => {
			this.funcSetActions.select(data.currentFunctionId);

			this.contextMenuService.showContextMenu({
				getAnchor: () => data.pointer,
				getActions: () => [this.funcSetActions, new Separator],
				getActionsContext: () => [data, this._onSetPinFunc.fire.bind(this._onSetPinFunc)],
			});
		});

		this.$table.innerHTML = '';
		this.table.render(this.$table);

		this.layout();
	}

	private disposeTable() {
		if (this.table) {
			dispose(this.contextEvent, this.table);
			delete this.table;
			delete this.funcSetActions;
		}
	}

	dispose() {
		super.dispose();
		this.disposeTable();
	}
}
