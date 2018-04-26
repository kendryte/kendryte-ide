'use strict';

export function mainBroadcastListener () {
	const { ipcMain } = require('electron');

	ipcMain.on('ipc:broadcast:send', (event, { windowId, channel, payload }) => {
	  sendToAllWindowsFromMain(windowId, channel, payload)
	});

	global.__ipcBroacastInstalled = true;
}

export function broadcast (channel, payload) {
	if (process.type === 'renderer') broadcastFromRenderer(channel, payload);
	else broadcastFromMain(channel, payload);
}

function sendToAllWindowsFromMain (windowId, channel, payload) {
	const { BrowserWindow } = require('electron');
	BrowserWindow.getAllWindows().forEach(win => {
		if (win.webContents.isLoading()) {
			win.webContents.once('did-finish-load', () => win.webContents.send(channel, { windowId, channel, payload }));
		} else {
			win.webContents.send(channel, { windowId, channel, payload });
		}
	});
}

function broadcastFromMain (channel, payload) {
	sendToAllWindowsFromMain(null, channel, payload);
}

// this hack is temporary, but it buys us a 100x performance increase (~2ms -> ~0.02ms)
let _windowId;
let _globalInstalled = false;

function broadcastFromRenderer (channel, payload) {
	const { remote, ipcRenderer } = require('electron');

	if (!_windowId) _windowId = remote.getCurrentWindow().id;
	const windowId = _windowId;

	if (!_globalInstalled) _globalInstalled = remote.getGlobal('__ipcBroacastInstalled');
	if (!_globalInstalled) return console.error('Must call mainBroadcastListener() from main process before you can call broadcast().');

	// send to all other windows
	ipcRenderer.send('ipc:broadcast:send', { windowId, channel, payload });

	// in case main process is actually listening on this channel
	ipcRenderer.send(channel, { windowId, channel, payload });
}