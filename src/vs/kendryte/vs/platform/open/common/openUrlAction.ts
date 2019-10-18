import { Action } from 'vs/base/common/actions';
import { IElectronService } from 'vs/platform/electron/node/electron';

export type GetUrl = () => string | Thenable<string>;

export class OpenUrlAction extends Action {
	static readonly ID = 'open.url';

	constructor(
		label: string,
		protected readonly url: string | GetUrl,
		@IElectronService private readonly electronService: IElectronService,
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
		await this.electronService.openExternal(url);
	}
}
