import { $, append } from 'vs/base/browser/dom';
import { Emitter, Event } from 'vs/base/common/event';
import { ActionBar } from 'vs/base/browser/ui/actionbar/actionbar';
import { Action } from 'vs/base/common/actions';
import { dispose } from 'vs/base/common/lifecycle';
import { TPromise } from 'vs/base/common/winjs.base';
import 'vs/css!./simpleNavBar';

export class SimpleNavBar {

	private _onChange = new Emitter<{ id: string, focus: boolean }>();
	get onChange(): Event<{ id: string, focus: boolean }> { return this._onChange.event; }

	private currentId: string = null;
	private actions: Action[];
	private actionbar: ActionBar;

	constructor(container: HTMLElement) {
		const element = append(container, $('div.simple-nav-bar.navbar'));
		this.actions = [];
		this.actionbar = new ActionBar(element, { animated: false });
	}

	push(id: string, label: string, icon: string, tooltip: string): void {
		const action = new Action(id, label, icon, true, () => this._update(id, true));

		action.tooltip = tooltip;

		this.actions.push(action);
		this.actionbar.push(action, { icon: true, label: true });

		if (this.actions.length === 1) {
			this._update(id);
		}
	}

	clear(): void {
		this.actions = dispose(this.actions);
		this.actionbar.clear();
	}

	update(): void {
		this._update(this.currentId);
	}

	private _update(id: string = this.currentId, focus?: boolean): TPromise<void> {
		this.currentId = id;
		this._onChange.fire({ id, focus });
		this.actions.forEach(a => a.enabled = a.id !== id);
		return TPromise.as(null);
	}

	dispose(): void {
		this.actionbar = dispose(this.actionbar);
	}
}