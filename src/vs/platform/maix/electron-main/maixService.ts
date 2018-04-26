'use strict';

import { TPromise } from 'vs/base/common/winjs.base';
import { IDisposable, dispose } from 'vs/base/common/lifecycle';
import { IMaixService } from 'vs/platform/maix/common/maix';
// import {MaixSettingsEvent} from 'vs/platform/maix/common/everything';
// import { Event, Emitter } from 'vs/base/common/event';
// import { IPartService } from 'vs/workbench/services/part/common/partService';

export class MaixService implements IMaixService, IDisposable {

	_serviceBrand: any;

	private disposables: IDisposable[] = [];

	//private _onMaixSettingsShow = new Emitter<boolean>();

	constructor(
		//@IPartService private partService: IPartService
	) {

	}

	// public get onMaixSettingsShow(): Event<boolean> {
	// 	return this._onMaixSettingsShow.event;
	// }

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

	setMaixSettingsHidden(hidden: boolean): void {
		console.log("FUCK IT CLICKED.");
		//this.partService.setMaixHidden(false);
	}

	dispose(): void {
		this.disposables = dispose(this.disposables);
	}
}