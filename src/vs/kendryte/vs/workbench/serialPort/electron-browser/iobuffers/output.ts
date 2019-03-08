import { ILocalOptions } from 'vs/kendryte/vs/workbench/serialPort/node/serialPortType';
import { Terminal as XTermTerminal } from 'vscode-xterm';
import { Writable } from 'stream';
import { createEncoder } from 'vs/kendryte/vs/workbench/serialPort/electron-browser/iobuffers/streamEncoder';
import { EscapeStringClearScreen } from 'vs/kendryte/vs/base/node/terminalConst';

/**
 * 用途：处理串口设备的输出
 * handle output serial port
 */
export class XtermScrollbackBuffer extends Writable {
	private scrollback: string = '';
	private target: XTermTerminal;

	private readonly linefeed: RegExp;
	private readonly encoder: (data: Buffer) => string;

	constructor(
		encoding: ILocalOptions['outputCharset'],
		linefeed: string,
		hexNewline: boolean,
	) {
		super();

		if (encoding === 'hex' && hexNewline) {
			this.encoder = createEncoder('hexnewline');
		} else if (encoding === 'hexasc') {
			this.encoder = createEncoder(encoding);
			linefeed = '';
		} else {
			this.encoder = createEncoder(encoding);
		}

		if (linefeed) {
			this.linefeed = new RegExp(linefeed, 'g');
		}
	}

	pipeTo(_xterm: XTermTerminal) {
		_xterm.clear();
		_xterm.write(this.scrollback);
		this.target = _xterm;
	}

	_write(data: Buffer, encoding: string, callback: Function) {
		if (data.indexOf(EscapeStringClearScreen) !== -1) {
			this.scrollback = '';
		}
		let str = this.encoder(data);

		if (this.linefeed) {
			str = str.replace(this.linefeed, '\r\n');
		}

		this.scrollback += str;

		if (this.scrollback.length > 102400) {
			this.scrollback = this.scrollback.substr(this.scrollback.length - 102400);
		}
		if (this.target) {
			this.target.write(str);
		}
		callback();
	}

	destroy() {
		super.destroy();
		delete this.target;
	}

	deletePipe() {
		delete this.target;
	}

	flush() {
		this.scrollback = '';
	}
}
