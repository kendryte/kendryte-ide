import * as vscode from 'vscode';
import { CancellationToken, DebugConfiguration, ProviderResult, WorkspaceFolder } from 'vscode';
import * as net from 'net';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { ChannelLogger } from './logger';

export function activate(context: vscode.ExtensionContext) {
	const logger = new ChannelLogger();
	logger.info('Activating');

	context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider('debugmemory', new MemoryContentProvider()));
	context.subscriptions.push(vscode.commands.registerCommand('kendryte-debug.examineMemoryLocation', examineMemory));
	context.subscriptions.push(vscode.commands.registerCommand('kendryte-debug.getFileNameNoExt', () => {
		if (!vscode.window.activeTextEditor || !vscode.window.activeTextEditor.document || !vscode.window.activeTextEditor.document.fileName) {
			vscode.window.showErrorMessage('No editor with valid file name active');
			return;
		}
		const fileName = vscode.window.activeTextEditor.document.fileName;
		const ext = path.extname(fileName);
		return fileName.substr(0, fileName.length - ext.length);
	}));
	context.subscriptions.push(vscode.commands.registerCommand('kendryte-debug.getFileBasenameNoExt', () => {
		if (!vscode.window.activeTextEditor || !vscode.window.activeTextEditor.document || !vscode.window.activeTextEditor.document.fileName) {
			vscode.window.showErrorMessage('No editor with valid file name active');
			return;
		}
		const fileName = path.basename(vscode.window.activeTextEditor.document.fileName);
		const ext = path.extname(fileName);
		return fileName.substr(0, fileName.length - ext.length);
	}));
	context.subscriptions.push(logger);
	context.subscriptions.push(vscode.debug.onDidReceiveDebugSessionCustomEvent((e: any) => {
		logger.info('WOW!!!', e);
	}));

	vscode.debug.registerDebugConfigurationProvider('kendryte', new Provider(logger));
	
	logger.info('Activated');
}

class Provider implements vscode.DebugConfigurationProvider {
	constructor(private readonly logger: ChannelLogger) {
	}

	provideDebugConfigurations?(folder: WorkspaceFolder | undefined, token?: CancellationToken): ProviderResult<DebugConfiguration[]>;

	debugAdapterExecutable() {
		this.logger.info('debugAdapterExecutable', arguments);
		debugger;
	}
}

const memoryLocationRegex = /^0x[0-9a-f]+$/;

function getMemoryRange(range: string) {
	if (!range) {
		return undefined;
	}
	range = range.replace(/\s+/g, '').toLowerCase();
	let index;
	if ((index = range.indexOf('+')) != -1) {
		const from = range.substr(0, index);
		let length = range.substr(index + 1);
		if (!memoryLocationRegex.exec(from)) {
			return undefined;
		}
		if (memoryLocationRegex.exec(length)) {
			length = parseInt(length.substr(2), 16).toString();
		}
		return 'from=' + encodeURIComponent(from) + '&length=' + encodeURIComponent(length);
	} else if ((index = range.indexOf('-')) != -1) {
		const from = range.substr(0, index);
		const to = range.substr(index + 1);
		if (!memoryLocationRegex.exec(from)) {
			return undefined;
		}
		if (!memoryLocationRegex.exec(to)) {
			return undefined;
		}
		return 'from=' + encodeURIComponent(from) + '&to=' + encodeURIComponent(to);
	} else if (memoryLocationRegex.exec(range)) {
		return 'at=' + encodeURIComponent(range);
	} else {
		return undefined;
	}
}

function examineMemory() {
	const socketlists = path.join(os.tmpdir(), 'kendryte-debug-sockets');
	if (!fs.existsSync(socketlists)) {
		if (process.platform == 'win32') {
			return vscode.window.showErrorMessage('This command is not available on windows');
		} else {
			return vscode.window.showErrorMessage('No debugging sessions available');
		}
	}
	fs.readdir(socketlists, (err, files) => {
		if (err) {
			if (process.platform == 'win32') {
				return vscode.window.showErrorMessage('This command is not available on windows');
			} else {
				return vscode.window.showErrorMessage('No debugging sessions available');
			}
		}
		const pickedFile = (file) => {
			vscode.window.showInputBox({
				placeHolder: 'Memory Location or Range',
				validateInput: range => getMemoryRange(range) === undefined ? 'Range must either be in format 0xF00-0xF01, 0xF100+32 or 0xABC154' : '',
			}).then(range => {
				vscode.commands.executeCommand('vscode.previewHtml', vscode.Uri.parse('debugmemory://' + file + '#' + getMemoryRange(range)));
			});
		};
		if (files.length == 1) {
			pickedFile(files[0]);
		} else if (files.length > 0) {
			vscode.window.showQuickPick(files, { placeHolder: 'Running debugging instance' }).then(file => pickedFile(file));
		} else if (process.platform == 'win32') {
			return vscode.window.showErrorMessage('This command is not available on windows');
		} else {
			vscode.window.showErrorMessage('No debugging sessions available');
		}
	});
}

class MemoryContentProvider implements vscode.TextDocumentContentProvider {
	provideTextDocumentContent(uri: vscode.Uri, token: vscode.CancellationToken): Thenable<string> {
		return new Promise((resolve, reject) => {
			const conn = net.connect(path.join(os.tmpdir(), 'kendryte-debug-sockets', uri.authority));
			let from, to;
			let highlightAt = -1;
			const splits = uri.fragment.split('&');
			if (splits[0].split('=')[0] == 'at') {
				const loc = parseInt(splits[0].split('=')[1].substr(2), 16);
				highlightAt = 64;
				from = Math.max(loc - 64, 0);
				to = Math.max(loc + 768, 0);
			} else if (splits[0].split('=')[0] == 'from') {
				from = parseInt(splits[0].split('=')[1].substr(2), 16);
				if (splits[1].split('=')[0] == 'to') {
					to = parseInt(splits[1].split('=')[1].substr(2), 16);
				} else if (splits[1].split('=')[0] == 'length') {
					to = from + parseInt(splits[1].split('=')[1]);
				} else {
					return reject('Invalid Range');
				}
			} else {
				return reject('Invalid Range');
			}
			if (to < from) {
				return reject('Negative Range');
			}
			conn.write('examineMemory ' + JSON.stringify([from, to - from + 1]));
			conn.once('data', data => {
				let formattedCode = '';
				const hexString = data.toString();
				let x = 0;
				let asciiLine = '';
				let byteNo = 0;
				for (let i = 0; i < hexString.length; i += 2) {
					const digit = hexString.substr(i, 2);
					const digitNum = parseInt(digit, 16);
					if (digitNum >= 32 && digitNum <= 126) {
						asciiLine += String.fromCharCode(digitNum);
					} else {
						asciiLine += '.';
					}
					if (highlightAt == byteNo) {
						formattedCode += '<b>' + digit + '</b> ';
					} else {
						formattedCode += digit + ' ';
					}
					if (++x > 16) {
						formattedCode += asciiLine + '\n';
						x = 0;
						asciiLine = '';
					}
					byteNo++;
				}
				if (x > 0) {
					for (let i = 0; i <= 16 - x; i++) {
						formattedCode += '   ';
					}
					formattedCode += asciiLine;
				}
				resolve('<h2>Memory Range from 0x' + from.toString(16) + ' to 0x' + to.toString(16) + '</h2><code><pre>' + formattedCode + '</pre></code>');
				conn.destroy();
			});
		});
	}
}
