import { IRenderer } from 'vs/base/browser/ui/list/list';
import { IListFuncMapEntry, TEMPLATE_ID } from 'kendryte/vs/workbench/fpioaConfig/electron-browser/editor/left/ids';
import { IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { SelectBox } from 'vs/base/browser/ui/selectBox/selectBox';
import { dispose, IDisposable } from 'vs/base/common/lifecycle';
import { Emitter, Event } from 'vs/base/common/event';
import { $, addClass, append } from 'vs/base/browser/dom';
import { IOPinPlacement } from 'kendryte/vs/workbench/fpioaConfig/common/packagingTypes';
import { attachSelectBoxStyler } from 'vs/platform/theme/common/styler';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { PinFuncSetEvent } from 'kendryte/vs/workbench/fpioaConfig/common/types';

export interface IFuncMapTemplate {
	input: SelectBox;
	toDispose: IDisposable[];
	$id: HTMLDivElement;
	$desc: HTMLDivElement;
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

		const input = new SelectBox(['--'].concat(Object.keys(this.ioToPin)), 0, this.contextViewService);
		input.render($input);
		const styler = attachSelectBoxStyler(input, this.themeService);

		const setOptions = this._firePinMapChange.event((ioplace: IOPinPlacement) => {
			input.setOptions(['--'].concat(Object.keys(this.ioToPin)));
		});

		return {
			$id,
			$desc,
			input,
			toDispose: [styler, setOptions],
		};
	}

	renderElement(entry: IListFuncMapEntry, index: number, template: IFuncMapTemplate): void {
		if (!this.pinToIO) {
			console.log('not ready yet.');
			debugger;
			return;
		}

		if (entry.selectEvent) {
			debugger;
		}

		let select = 0;
		if (entry.currentPin !== undefined) {
			console.log('func[%s] -> pin[%s:%s]', entry.fullId, entry.currentPin, this.pinToIO[entry.currentPin]);
			const io = this.pinToIO[entry.currentPin];
			select = Object.keys(this.ioToPin).indexOf(io) + 1; // padding for --
		} else {
			console.log('func[%s] -> nil', entry.fullId);
		}
		template.input.select(select);

		entry.selectEvent = template.input.onDidSelect(({ index, selected }) => {
			if (this.ioToPin) {
				if (index !== 0 && !this.ioToPin[selected]) {
					console.log('invalid select.');
					template.input.select(0);
					return;
				}
				console.log('pin function select: pin[%s:%s] func[%s]', this.ioToPin[selected], selected, entry.fullId);
				this._onSetPin.fire({
					pin: index === 0 ? undefined : this.ioToPin[selected],
					func: entry.fullId,
					triggerBy: 'func',
				});
			} else {
				console.log('empty select.');
				debugger;
			}
		});

		template.$id.innerText = entry.id;
		template.$desc.innerText = entry.description;
	}

	public disposeElement(entry: IListFuncMapEntry, index: number, templateData: IFuncMapTemplate): void {
		dispose(entry.selectEvent);
		entry.selectEvent = null;
		templateData.input.select(0);
	}

	disposeTemplate(template: IFuncMapTemplate): void {
		dispose(template.input, ...template.toDispose);
	}

	dispose() {
		this.changeEvent.dispose();
	}
}
