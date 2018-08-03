import { IRenderer } from 'vs/base/browser/ui/list/list';
import { IListFuncMapEntry, TEMPLATE_ID } from 'vs/workbench/parts/maix/fpioa-config/electron-browser/editor/left/ids';
import { IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { SelectBox } from 'vs/base/browser/ui/selectBox/selectBox';
import { dispose, IDisposable } from 'vs/base/common/lifecycle';
import { Emitter, Event } from 'vs/base/common/event';
import { $, addClass, append } from 'vs/base/browser/dom';
import { PinFuncSetEvent } from 'vs/workbench/parts/maix/fpioa-config/electron-browser/editor/fpioaEditor';
import { selectValueCache } from 'vs/workbench/parts/maix/fpioa-config/electron-browser/lib/selectValueCache';
import { IOPinPlacement } from 'vs/workbench/parts/maix/fpioa-config/common/packagingTypes';
import { attachSelectBoxStyler } from 'vs/platform/theme/common/styler';
import { IThemeService } from 'vs/platform/theme/common/themeService';

export interface IFuncMapTemplate {
	input: SelectBox;
	toDispose: IDisposable[];
	$id: HTMLDivElement;
	$desc: HTMLDivElement;
	currentFunc?: string;
}

export class FuncMapListItemRender implements IRenderer<IListFuncMapEntry, IFuncMapTemplate> {
	private readonly _onSetPin = new Emitter<PinFuncSetEvent>();
	readonly onSetPin: Event<PinFuncSetEvent> = this._onSetPin.event;

	private readonly _firePinMapChange = new Emitter<IOPinPlacement>();
	readonly notifyPinMapChange = this._firePinMapChange.fire.bind(this._firePinMapChange);

	protected pinToIO: { [id: string]: string }; // A4 => IO_7
	protected ioToPin: { [id: string]: string };
	private cacheMap: IOPinPlacement;
	private changeEvent: IDisposable;
	// to cache

	// IO_2 => B6

	constructor(
		@IContextViewService protected contextViewService: IContextViewService,
		@IThemeService protected themeService: IThemeService,
	) {
		this.changeEvent = this._firePinMapChange.event((ioplace: IOPinPlacement) => {
			if (this.cacheMap === ioplace) {
				return;
			}
			const map = this.cacheMap = ioplace;

			this.pinToIO = {};
			this.ioToPin = {};

			Object.keys(map).forEach((key) => {
				const value = `IO_${map[key]}`;

				this.pinToIO[key] = value;
				this.ioToPin[value] = key;
			});
		});
	}

	setPinMap(ioPinMap: IOPinPlacement) {
	}

	get templateId(): string {
		return TEMPLATE_ID.FUNC_MAP;
	}

	renderTemplate(parent: HTMLElement): IFuncMapTemplate {
		addClass(parent, 'funcMapListItem');

		const $header = append(parent, $('div.header')) as HTMLDivElement;
		const $id = append($header, $('div.id')) as HTMLDivElement;
		const $input = append($header, $('div.select')) as HTMLDivElement;
		const $desc = append(parent, $('div.desc')) as HTMLDivElement;

		const input = new SelectBox([], undefined, this.contextViewService);
		input.render($input);
		const styler = attachSelectBoxStyler(input, this.themeService);

		const selectEvent = selectValueCache(input, ({ index, selected }) => {
			if (ret.currentFunc) {
				this._onSetPin.fire({
					pin: index === 0 ? undefined : this.ioToPin[selected],
					func: ret.currentFunc,
				});
			}
		});

		input.setOptions(['--'].concat(Object.keys(this.ioToPin)));
		const setOptions = this._firePinMapChange.event((ioplace: IOPinPlacement) => {
			input.setOptions(['--'].concat(Object.keys(this.ioToPin)));
		});

		const ret: IFuncMapTemplate = {
			$id,
			$desc,
			input,
			toDispose: [styler, selectEvent, setOptions],
		};
		return ret;
	}

	renderElement(entry: IListFuncMapEntry, index: number, template: IFuncMapTemplate): void {
		if (!this.pinToIO) {
			return;
		}
		template.currentFunc = entry.full;

		const io = this.pinToIO[entry.currentPin];
		const select = Object.keys(this.ioToPin).indexOf(io) + 1; // padding for --
		template.input.select(select);

		template.$id.innerText = entry.id;
		template.$desc.innerText = entry.description;
	}

	public disposeElement(element: IListFuncMapEntry, index: number, templateData: IFuncMapTemplate): void {
		// noop?
	}

	disposeTemplate(template: IFuncMapTemplate): void {
		dispose(template.input, ...template.toDispose);
	}

	dispose() {
		this.changeEvent.dispose();
	}
}
