import { Disposable } from 'vs/base/common/lifecycle';
import { addClass, addStandardDisposableListener, Dimension, EventType, removeClass } from 'vs/base/browser/dom';
import { getSimpleEditorOptions } from 'vs/workbench/parts/codeEditor/browser/simpleEditorOptions';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { CodeEditorWidget } from 'vs/editor/browser/widget/codeEditorWidget';
import { getSimpleCodeEditorWidgetOptions } from 'vs/workbench/parts/codeEditor/electron-browser/simpleEditorOptions';
import { Emitter, Event } from 'vs/base/common/event';
import { IPosition } from 'vs/editor/common/core/position';
import { ITextModel } from 'vs/editor/common/model';

export class SerialReplInput extends Disposable {
	private readonly replInput: CodeEditorWidget;

	private replInputHeight: number = 19;
	private dimension: Dimension;

	private readonly _onHeightChange: Emitter<number> = new Emitter<number>();
	readonly onHeightChange: Event<number> = this._onHeightChange.event;
	private readonly _onValueChange: Emitter<string> = new Emitter<string>();
	readonly onValueChange: Event<string> = this._onValueChange.event;

	constructor(
		private readonly replInputContainer: HTMLElement,
		@IInstantiationService instantiationService: IInstantiationService,
	) {
		super();

		this.replInput = instantiationService.createInstance(CodeEditorWidget, this.replInputContainer, getSimpleEditorOptions(), getSimpleCodeEditorWidgetOptions());
		this._register(this.replInput);

		this._register(this.replInput.onDidScrollChange(e => {
			if (!e.scrollHeightChanged) {
				return;
			}
			this.replInputHeight = Math.max(19, Math.min(170, e.scrollHeight, this.dimension.height));
			console.log('this.replInputHeight =', 170, e.scrollHeight, this.dimension.height);
			this._onHeightChange.fire(this.replInputHeight);
		}));
		this._register(this.replInput.onDidChangeModelContent(() => {
			this._onValueChange.fire(this.replInput.getModel().getValue());
		}));

		this._register(addStandardDisposableListener(this.replInputContainer, EventType.FOCUS, () => addClass(this.replInputContainer, 'synthetic-focus')));
		this._register(addStandardDisposableListener(this.replInputContainer, EventType.BLUR, () => removeClass(this.replInputContainer, 'synthetic-focus')));

		this.replInputContainer.style.display = 'none';
	}

	layout(dimension: Dimension) {
		if (!this.replInput.getModel()) {
			return 0;
		}
		this.dimension = dimension;

		this.replInputContainer.style.height = `${this.replInputHeight}px`;
		this.replInput.layout({ width: dimension.width - 20, height: this.replInputHeight });

		return this.replInputHeight;
	}

	setValue(historyInput: string) {
		this.replInput.setValue(historyInput);
	}

	setPosition(param: IPosition) {
		this.replInput.setPosition(param);
	}

	setModel(model: ITextModel = null) {
		if (this.replInput.getModel() === model) {
			return false;
		}
		this.replInput.setModel(model);

		this.replInputContainer.style.display = model ? 'block' : 'none';

		return true;
	}

	getValue() {
		return this.replInput.getValue();
	}
}