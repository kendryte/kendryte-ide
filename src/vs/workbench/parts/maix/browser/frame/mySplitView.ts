import { addClass } from 'vs/base/browser/dom';
import { IView, Orientation, SplitView } from 'vs/base/browser/ui/splitview/splitview';
import 'vs/css!../media/shit';

export interface ICanRender {
	renderEntries(): any;
}

export class MySplitView extends SplitView {
	private leftView: ICanRender;
	private rightView: ICanRender;

	constructor(container: HTMLElement) {
		super(container, { orientation: Orientation.HORIZONTAL });
		addClass(container, 'maix-config-editor');
	}

	layout(size: number): void {
		if (size > 1200) {
			size = 1200;
		} else if (size < 770) {
			size = 770;
		}
		super.layout(size - 27 * 2/*padding*/);
	}

	setLeft(view: IView & ICanRender): void {
		this.addView(view, 300);
		this.leftView = view;
	}

	async render() {
		await this.leftView.renderEntries();
		if (this.rightView) {
			await this.rightView.renderEntries();
		}
	}

	switch(view: IView & ICanRender) {
		if (this.rightView === view) {
			return;
		}
		let lastSize: number;
		if (this.length > 1) {
			lastSize = this.getViewSize(1);
			this.removeView(1);
		} else {
			lastSize = 800;
		}
		if (view) {
			this.addView(view, lastSize);
		}
		this.rightView = view;
	}
}