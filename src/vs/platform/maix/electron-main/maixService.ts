'use strict';

import { TPromise } from 'vs/base/common/winjs.base';
import { IDisposable, dispose } from 'vs/base/common/lifecycle';
import { IMaixService } from 'vs/platform/maix/common/maix';

export class MaixService implements IMaixService, IDisposable {

	_serviceBrand: any;

	private disposables: IDisposable[] = [];

	constructor(
	) {
	}

	showSettingsDialog(): TPromise<void> {
		const { BrowserWindow } = require('electron')
    	let win = new BrowserWindow({
     		width: 800,
      		height: 600,
      		center: true,
      		resizable: false,
      		maximizable: false,
      		alwaysOnTop: true,
      		title: "Settings",
      		autoHideMenuBar: true
    	});
    	win.on('closed', () => {
     		win = null
		});

		let url = "./media/index.html"

    	win.loadURL(url);
    	return TPromise.as(null);
	}

	dispose(): void {
		this.disposables = dispose(this.disposables);
	}
}