import * as vscode from 'vscode';
import { NodeLoggerCommon } from '../common/logger';

export class ChannelLogger extends NodeLoggerCommon {
	private readonly channel: vscode.OutputChannel;

	constructor() {
		super('kendryte-debug');
		this.channel = vscode.window.createOutputChannel('kendryte/gdb');
	}

	dispose() {
		this.channel.dispose();
	}

	public write(data: string) {
		this.channel.append(data);
	}
}