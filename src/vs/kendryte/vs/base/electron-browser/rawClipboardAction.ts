import { Action } from 'vs/base/common/actions';
import { localize } from 'vs/nls';
import { clipboard } from 'electron';

export type GetText = () => string | Thenable<string>;

export class RawCopyAction extends Action {
	static readonly ID = 'copy.raw';
	static readonly LABEL = localize('copy', 'Copy');

	constructor(
		protected readonly text: string | GetText,
		id = RawCopyAction.ID, label = RawCopyAction.LABEL,
		className = 'copy', enabled = true,
	) {
		super(id, label, className, enabled);
	}

	async run() {
		let text: string;
		if (typeof this.text === 'string') {
			text = this.text;
		} else {
			text = await this.text();
		}
		clipboard.writeText(text);
	}
}