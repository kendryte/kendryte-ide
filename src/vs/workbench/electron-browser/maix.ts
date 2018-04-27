'use strict';

import 'vs/css!./media/maix';
import * as nls from 'vs/nls';
import { Builder, $ } from 'vs/base/browser/builder';
import { ipcRenderer } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import uri from 'vs/base/common/uri';

const rootPath = path.dirname(uri.parse(require.toUrl('')).fsPath);

const Identifiers = {
	MAIX_SETTINGS_WINDOWS: 'maix.workbench.settings.windows',
	MAIX_SETTINGS_TITLEBAR: 'maix.workbench.settings.titlebar',
	MASK_LAYER: 'maix.workbench.mask-layer'
};

export class MaixSettingsWindows {
	public _serviceBrand: any;

	private maskContainer: Builder;
	private maixContainer: Builder;
	private parentContainer: Builder;
	private maixConfig: any;

	constructor(
	) {
		const configFilePath = path.join(rootPath, 'src', 'vs', 'test.json');
		this.maixConfig = JSON.parse(fs.readFileSync(configFilePath, { encoding: 'utf8' }));
	}

	public init(parent: Builder): void {
		this.parentContainer = parent;
		this.createSettingsWindows();
	}

	public setHidden(hidden: boolean) {
		if (hidden) {
			$(this.maskContainer).style('z-index', '0');
			$(this.maixContainer).style('z-index', '0');
		} else {
			$(this.maskContainer).style('z-index', '1');
			$(this.maixContainer).style('z-index', '2');
		}
	}

	public registerListeners(): void {
		ipcRenderer.on('maix-open-settings', (event, { payload }) => {
			const { message } = payload;
			console.log(message);
			this.setHidden(false);
		});
	}

	private createSettingsWindows(): void {
		// mask layer windows
		this.maskContainer = $().div({
			'class': 'mask-layer',
			id: Identifiers.MASK_LAYER,
			style: {'-webkit-filter': 'blur(5px)', 'z-index': '0'}
		}).appendTo(this.parentContainer);

		// settings windows
		this.maixContainer = $().div({
			'class': 'maix-container',
			id: Identifiers.MAIX_SETTINGS_WINDOWS
		}).appendTo(this.parentContainer);

		// title bar
		let titlebarName = this.maixConfig.maixSettingsWindows.titlebarName;
		$(this.maixContainer).div({
			'class': 'maix-titlebar',
			id: Identifiers.MAIX_SETTINGS_TITLEBAR,
			role: 'contentinfo'
		}).text(nls.localize("maixTitlebar", titlebarName));

		this.setHidden(true);
	}
}