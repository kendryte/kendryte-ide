import { IWindowsService } from 'vs/platform/windows/common/windows';
import { Action } from 'vs/base/common/actions';
import { ACTION_ID_OPEN_DOCUMENT, ACTION_LABEL_OPEN_DOCUMENT } from 'vs/kendryte/vs/base/common/menu/webLink';

export class OpenDocumentInBrowser extends Action {
	static readonly ID = ACTION_ID_OPEN_DOCUMENT;
	static readonly LABEL = ACTION_LABEL_OPEN_DOCUMENT;

	constructor(
		id = OpenDocumentInBrowser.ID, label = OpenDocumentInBrowser.LABEL,
		@IWindowsService private readonly windowsService: IWindowsService,
	) {
		super(id, label, 'link');

	}

	async run() {
		const url = 'http://kendryte-ide.s3-website.cn-northwest-1.amazonaws.com.cn/documents/';
		await this.windowsService.openExternal(url);
	}
}
