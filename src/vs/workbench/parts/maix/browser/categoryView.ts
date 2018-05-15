import { addClass } from 'vs/base/browser/dom';
import { IView, Orientation, SplitView } from 'vs/base/browser/ui/splitview/splitview';
import 'vs/css!./media/shit';

export interface ICanRender {
	renderEntries(): void;
}

export class CategoryView extends SplitView {
	private renderItems: Function[] = [];

	constructor(container: HTMLElement) {
		super(container, { orientation: Orientation.HORIZONTAL });
		addClass(container, 'maix-config-editor');
	}

	removeView(index: number) {
		super.removeView(index);
		this.renderItems.splice(index, 1);
	}

	layout(size: number): void {
		if (size > 1200) {
			size = 1200;
		} else if (size < 770) {
			size = 770;
		}
		super.layout(size - 27 * 2/*padding*/);
	}

	addView(view: IView & ICanRender, size: number): void {
		super.addView(view, size);
		this.renderItems.push(view.renderEntries.bind(view));
	}

	render() {
		for (const renderEntries of this.renderItems) {
			renderEntries();
		}
	}
}