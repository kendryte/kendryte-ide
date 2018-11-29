import { Action } from 'vs/base/common/actions';
import { IWindowsService } from 'vs/platform/windows/common/windows';

export type GetUrl = () => string | Thenable<string>;

export class OpenUrlAction extends Action {
	static readonly ID = 'open.url';

	constructor(
		label,
		protected readonly url: string | GetUrl,
		@IWindowsService private readonly windowsService: IWindowsService,
	) {
		super(OpenUrlAction.ID, label, 'link');
	}

	async run() {
		let url: string;
		if (typeof this.url === 'string') {
			url = this.url;
		} else {
			url = await this.url();
		}
		await this.windowsService.openExternal(url);
	}
}