import { IListFuncMapElement, TEMPLATE_ID } from 'vs/kendryte/vs/workbench/fpioaConfig/electron-browser/editor/left/ids';
import { IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { Disposable, dispose, IDisposable } from 'vs/base/common/lifecycle';
import { Emitter, Event } from 'vs/base/common/event';
import { $, addClass, append } from 'vs/base/browser/dom';
import { IOPinPlacement } from 'vs/kendryte/vs/workbench/fpioaConfig/common/packagingTypes';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { PinFuncSetEvent } from 'vs/kendryte/vs/workbench/fpioaConfig/common/types';
import { selectBoxNames } from 'vs/kendryte/vs/base/browser/ui/selectBox';
import { ITreeNode, ITreeRenderer } from 'vs/base/browser/ui/tree/tree';
import { attachEditableSelectBoxStyler } from 'vs/kendryte/vs/base/browser/ui/editableSelect';
import { ISelectOptionItem, SelectBox } from 'vs/base/browser/ui/selectBox/selectBox';
import { localize } from 'vs/nls';

export interface IFuncMapTemplate {
	input: SelectBox;
	$id: HTMLDivElement;
	$parent: HTMLElement;
	toDispose: IDisposable[];
}

export  type IPinIOMap = { [id: string]: string };

export class FuncMapListItemRender extends Disposable implements ITreeRenderer<IListFuncMapElement, void, IFuncMapTemplate> {
	private readonly _onSetPin = this._register(new Emitter<PinFuncSetEvent>());
	readonly onSetPin: Event<PinFuncSetEvent> = this._onSetPin.event;

	private readonly _onPinMapChange = this._register(new Emitter<void>());
	private _pin2Io: IPinIOMap;
	private _io2Pin: IPinIOMap;
	private _selectOptions: ISelectOptionItem[];
	// to cache

	// IO_2 => B6

	constructor(
		@IContextViewService protected contextViewService: IContextViewService,
		@IThemeService protected themeService: IThemeService,
	) {
		super();
	}

	notifyPinMapChange(ioToPin: IPinIOMap) {
		const unsetSelect: ISelectOptionItem = {
			text: '--',
			description: localize('useDefault', 'Use default'),
		};
		this._selectOptions = [unsetSelect];

		this._pin2Io = {};
		this._io2Pin = ioToPin;
		for (const [io, pin] of Object.entries(ioToPin)) {
			this._selectOptions.push(selectBoxNames(io));
			this._pin2Io[pin] = io;
		}

		this._onPinMapChange.fire();
	}

	setPinMap(ioPinMap: IOPinPlacement) {
	}

	get templateId(): string {
		return TEMPLATE_ID.FUNC_MAP;
	}

	renderTemplate(parent: HTMLElement): IFuncMapTemplate {
		addClass(parent, 'funcMapListItem');

		const $id = append(parent, $('div.id')) as HTMLDivElement;
		const $input = append(parent, $('div.select')) as HTMLDivElement;

		const input = new SelectBox(this._selectOptions, 0, this.contextViewService);
		const styler = attachEditableSelectBoxStyler(input, this.themeService);
		input.render($input);

		const setEvent = this._onPinMapChange.event(() => {
			input.setOptions(this._selectOptions);
		});

		return {
			$id,
			$parent: parent,
			input,
			toDispose: [input, styler, setEvent],
		};
	}

	renderElement({ element }: ITreeNode<IListFuncMapElement>, index: number, template: IFuncMapTemplate): void {
		if (element.selectEvent) {
			debugger;
		}

		if (element.currentPin !== undefined) {
			template.input.select(this._selectOptions.findIndex(item => item.text === this._pin2Io[element.currentPin]));
		} else {
			template.input.select(0);
		}

		element.selectEvent = template.input.onDidSelect(({ selected: io, index }) => {
			const isUnset = index === 0;
			if (!this._selectOptions) {
				template.input.select(0);
				console.log('invalid state: empty select.');
				debugger;
			}
			console.log('pin function select: pin[%s:%s] func[%s]', this._io2Pin[io], io, element.id);
			this._onSetPin.fire({
				pin: isUnset ? undefined : this._io2Pin[io],
				func: element.id,
				triggerBy: 'func',
			});
		});

		template.$id.innerText = element.id;
		template.$parent.title = element.description;
	}

	public disposeElement({ element }: ITreeNode<IListFuncMapElement>, index: number, templateData: IFuncMapTemplate): void {
		dispose(element.selectEvent);
		delete element.selectEvent;
		templateData.input.select(0);
	}

	disposeTemplate(template: IFuncMapTemplate): void {
		dispose(template.toDispose);
	}
}
