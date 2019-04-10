import { ISerialMonitorField } from 'vs/kendryte/vs/workbench/serialMonitor/browser/fields/base';
import { IJSONSchema } from 'vs/base/common/jsonSchema';
import { IDisposable } from 'vs/base/common/lifecycle';
import { Emitter } from 'vs/base/common/event';
import { ISelectOptionItem } from 'vs/base/browser/ui/selectBox/selectBox';
import { IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { attachEditableSelectBoxStyler, EditableSelectBox } from 'vs/kendryte/vs/base/browser/ui/editableSelect';

export class SerialMonitorSelect implements ISerialMonitorField<any, any> {
	private readonly _onChange = new Emitter<any>();
	public readonly onChange = this._onChange.event;

	private readonly $input: EditableSelectBox;
	private readonly disposable: IDisposable[] = [];

	constructor(
		parent: HTMLElement,
		protected readonly def: IJSONSchema,
		@IContextViewService contextViewService: IContextViewService,
		@IThemeService themeService: IThemeService,
	) {
		const enumValues = (def.enum || []).slice();
		const enumDescriptions = (def.enumDescriptions || enumValues).slice();

		if (def.$comment && def.$comment.includes('undefined')) {
			enumValues.unshift(undefined);
			enumDescriptions.unshift('(default)');
		}
		const displayList: ISelectOptionItem[] = enumValues.map((value, index) => {
			const label = enumDescriptions[index] || value;
			return { text: label };
		});

		this.$input = this._register(new EditableSelectBox(parent, contextViewService));
		this._register(attachEditableSelectBoxStyler(this.$input, themeService));
		this._register(this.$input.onDidChange((val) => {
			const selected = displayList.findIndex(item => item.text === val);
			if (selected === -1) {
				this._onChange.fire(val);
			} else {
				this._onChange.fire(enumValues[selected]);
			}
		}));

		this.$input.editable = def.$comment ? def.$comment.includes('editable') : false;
		this.$input.registerSelection(displayList);
	}

	public setValue(val: any): void {
		// console.log('[serial][field] UI: %s = %s (%s)', this.def.title, val, typeof val);
		this.$input.value = val;
	}

	public toDispose(): IDisposable[] {
		return this.disposable;
	}

	private _register<T extends IDisposable>(dis: T): T {
		this.disposable.push(dis);
		return dis;
	}

	public setEnabled(enable: boolean): void {
		this.$input.setEnable(enable);
	}
}
