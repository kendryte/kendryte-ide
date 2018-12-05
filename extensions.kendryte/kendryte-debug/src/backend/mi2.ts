import { Breakpoint, IBackend, MIError, Stack, Thread, Variable, VariableObject } from './backend';
import * as ChildProcess from 'child_process';
import { EventEmitter } from 'events';
import { MINode, parseMI } from './mi_parse';
import * as nativePath from 'path';
import { posix } from 'path';
import { always, DeferredPromise, timeout } from '../lib';
import { CustomLogger } from './lib/logger';
import { DebugSession } from 'vscode-debugadapter';
import { merge_env } from './lib/merge_env';

const path = posix;

export function escapePath(str: string) {
	if (typeof str !== 'string') {
		str = '';
	}
	str = str.replace(/\\/g, '/');
	return JSON.stringify(str);
}

const nonOutput = /^(?:\d*|undefined)[\*\+\=]|[\~\@\&\^]/;
const gdbMatch = /(?:\d*|undefined)\(gdb\)/;
const numRegex = /\d+/;
const interruptedRegex = /Interrupt./;

function couldBeOutput(line: string) {
	if (nonOutput.exec(line)) {
		return false;
	}
	return true;
}

const trace = false;

export class MI2 extends EventEmitter implements IBackend {
	prettyPrint: boolean = true;
	printCalls: boolean;
	public readonly procEnv: any;
	private waittingInterrupt: DeferredPromise<true>;
	protected currentToken: number = 1;
	protected handlers: { [index: number]: (info: MINode) => any } = {};
	protected handlersCommands: { [index: number]: string } = {};
	protected breakpoints: Map<Breakpoint, Number> = new Map();
	protected buffer: string;
	protected errbuf: string;
	protected process: ChildProcess.ChildProcess;
	protected stream;

	protected readonly logger: CustomLogger;

	constructor(
		session: DebugSession,
		public readonly application: string,
		public readonly preargs: string[],
		public readonly extraargs: string[],
		procEnv: any,
	) {
		super();

		this.logger = new CustomLogger('MI2', session);
		this.procEnv = procEnv ? merge_env(procEnv) : process.env;
	}

	stdout(data) {
		if (trace) {
			this.log('stderr', 'stdout: ' + data);
		}
		if (typeof data == 'string') {
			this.buffer += data;
		} else {
			this.buffer += data.toString('utf8');
		}
		const end = this.buffer.lastIndexOf('\n');
		if (end != -1) {
			this.onOutput(this.buffer.substr(0, end));
			this.buffer = this.buffer.substr(end + 1);
		}
		if (this.buffer.length) {
			if (this.onOutputPartial(this.buffer)) {
				this.buffer = '';
			}
		}
	}

	stderr(data) {
		if (typeof data == 'string') {
			this.errbuf += data;
		} else {
			this.errbuf += data.toString('utf8');
		}
		const end = this.errbuf.lastIndexOf('\n');
		if (end != -1) {
			this.onOutputStderr(this.errbuf.substr(0, end));
			this.errbuf = this.errbuf.substr(end + 1);
		}
		if (this.errbuf.length) {
			this.logNoNewLine('stderr', this.errbuf);
			this.errbuf = '';
		}
	}

	onOutputStderr(lines) {
		lines = <string[]> lines.split('\n');
		lines.forEach(line => {
			this.log('stderr', line);
		});
	}

	onOutputPartial(line) {
		if (couldBeOutput(line)) {
			this.logNoNewLine('stdout', line);
			return true;
		}
		return false;
	}

	onOutput(lines) {
		lines = <string[]> lines.split('\n');
		lines.forEach(line => {
			if (couldBeOutput(line)) {
				if (!gdbMatch.exec(line)) {
					this.log('stdout', line);
				}
			} else {
				const parsed = parseMI(line);
				this.logger.writeln(`\x1B[38;5;0m${parsed.token}-${this.handlersCommands[parsed.token]}\x1B[0m:
  GDB -> App: ${JSON.stringify(parsed).trim()}
`);
				if (parsed.resultRecords && parsed.resultRecords.resultClass == 'error') {
					this.log('stderr', parsed.result('msg') || line);
				}
				let handled = false;
				if (parsed.token !== undefined) {
					if (this.handlers[parsed.token]) {
						this.handlers[parsed.token](parsed);
						handled = true;
					}
				}
				if (parsed.outOfBandRecord) {
					parsed.outOfBandRecord.forEach(record => {
						if (record.isStream) {
							if (this.waittingInterrupt && interruptedRegex.test(record.content)) {
								this.waittingInterrupt.complete(true);
							}
							this.log(record.type, record.content);
						} else {
							if (record.type == 'exec') {
								this.emit('exec-async-output', parsed);
								if (record.asyncClass == 'running') {
									this.emit('running', parsed);
								} else if (record.asyncClass == 'stopped') {
									const reason = parsed.record('reason');
									if (trace) {
										this.log('stderr', 'stop: ' + reason);
									}
									if (reason == 'breakpoint-hit') {
										this.emit('breakpoint', parsed);
									} else if (reason == 'end-stepping-range') {
										this.emit('step-end', parsed);
									} else if (reason == 'function-finished') {
										this.emit('step-out-end', parsed);
									} else if (reason == 'signal-received') {
										this.emit('signal-stop', parsed);
									} else if (reason == 'exited-normally') {
										this.emit('exited-normally', parsed);
									} else if (reason == 'exited') { // exit with error code != 0
										this.log('stderr', 'Program exited with code ' + parsed.record('exit-code'));
										this.emit('exited-normally', parsed);
									} else {
										this.log('console', 'Not implemented stop reason (assuming exception): ' + reason);
										this.emit('stopped', parsed);
									}
								} else {
									this.log('log', JSON.stringify(parsed));
								}
							} else if (record.type == 'notify') {
								if (record.asyncClass == 'thread-created') {
									this.emit('thread-created', parsed);
								} else if (record.asyncClass == 'thread-exited') {
									this.emit('thread-exited', parsed);
								}
							}
						}
					});
					handled = true;
				}
				if (parsed.token == undefined && parsed.resultRecords == undefined && parsed.outOfBandRecord.length == 0) {
					handled = true;
				}
				if (!handled) {
					this.log('log', 'Unhandled: ' + JSON.stringify(parsed));
				}
			}
		});
	}

	setBreakPointCondition(bkptNum, condition): Thenable<any> {
		if (trace) {
			this.log('stderr', 'setBreakPointCondition');
		}
		return this.sendCommand('break-condition ' + bkptNum + ' ' + condition);
	}

	async varCreate(expression: string, name: string = '-'): Promise<VariableObject> {
		if (trace) {
			this.log('stderr', 'varCreate');
		}
		const res = await this.sendCommand(`var-create ${name} @ "${expression}"`);
		return new VariableObject(res.result(''));
	}

	async varEvalExpression(name: string): Promise<MINode> {
		if (trace) {
			this.log('stderr', 'varEvalExpression');
		}
		return this.sendCommand(`var-evaluate-expression ${name}`);
	}

	async varListChildren(name: string): Promise<VariableObject[]> {
		if (trace) {
			this.log('stderr', 'varListChildren');
		}
		//TODO: add `from` and `to` arguments
		const res = await this.sendCommand(`var-list-children --all-values ${name}`);
		const children = res.result('children') || [];
		const omg: VariableObject[] = children.map(child => new VariableObject(child[1]));
		return omg;
	}

	async varUpdate(name: string = '*'): Promise<MINode> {
		if (trace) {
			this.log('stderr', 'varUpdate');
		}
		return this.sendCommand(`var-update --all-values ${name}`);
	}

	async varAssign(name: string, rawValue: string): Promise<MINode> {
		if (trace) {
			this.log('stderr', 'varAssign');
		}
		return this.sendCommand(`var-assign ${name} ${rawValue}`);
	}

	logNoNewLine(type: string, msg: string) {
		this.emit('msg', type, msg);
	}

	log(type: string, msg: string) {
		this.emit('msg', type, msg[msg.length - 1] == '\n' ? msg : (msg + '\n'));
	}

	sendUserInput(command: string, threadId: number = 0, frameLevel: number = 0): Thenable<any> {
		if (command.startsWith('-')) {
			return this.sendCommand(command.substr(1));
		} else {
			return this.sendCliCommand(command, threadId, frameLevel);
		}
	}

	sendRaw(raw: string) {
		if (this.printCalls) {
			this.log('log', raw);
		}
		this.process.stdin.write(raw + '\n');
	}

	async sendCliCommand(command: string, threadId: number = 0, frameLevel: number = 0) {
		let miCommand = 'interpreter-exec ';
		if (threadId != 0) {
			miCommand += `--thread ${threadId} --frame ${frameLevel} `;
		}
		miCommand += `console "${command.replace(/[\\"']/g, '\\$&')}"`;
		const response = await this.sendCommand(miCommand);
		this.log('stderr', JSON.stringify(response, null, 2));
		if (response.resultRecords) {
			if (response.resultRecords.resultClass === 'running') {
				this.emit('program-status', true);
			}
		}
	}

	sendCommand(command: string, suppressFailure: boolean = false): Promise<MINode> {
		return this.rawSendCommand(command).then((node: MINode) => {
			if (node && node.resultRecords && node.resultRecords.resultClass === 'error') {
				if (suppressFailure) {
					this.log('stderr', `WARNING: Error executing command '${command}'`);
				} else {
					throw new MIError(node.result('msg') || 'Internal error', command);
				}
			}
			return node;
		});
	}

	private waitInterrupt(): Promise<true> {
		if (!this.waittingInterrupt) {
			this.waittingInterrupt = new DeferredPromise<true>();
			const [to, cancel] = timeout(5000);

			always(this.waittingInterrupt.p, () => {
				cancel();
				delete this.waittingInterrupt;
			});

			this.waittingInterrupt.p.then(() => {
				this.log('stderr', ' -- interrupted');
			}, () => {
				this.log('stderr', ' -- interrupt failed');
			});

			to.then(() => {
				this.waittingInterrupt.error(new MIError('Cannot pause program in 5s', 'interrupt'));
			}).catch(() => undefined);
		}

		return this.waittingInterrupt.p;
	}

	private async tryAddBreakpoint(brk: string) {
		const result = await this.sendCommand('break-insert -f ' + brk).catch(async (e: MIError) => {
			if (e.message.includes('Cannot execute this command while the target is running')) {
				await this.interrupt(true);
				console.log('-----------------');
				this.log('stdout', '~~~~~~~~~~~~~~~~~');
				const result = await this.sendCommand('break-insert -f ' + brk);
				await this.continue();
				return result;
			} else {
				throw e;
			}
		});
		this.log('stderr', JSON.stringify(result));
		return result;
	}

	private rawSendCommand(command: string): Promise<MINode> {
		const sel = this.currentToken++;
		return new Promise((resolve, reject) => {
			this.handlersCommands[sel] = command;
			this.handlers[sel] = (node) => {
				delete this.handlersCommands[sel];
				delete this.handlers[sel];
				resolve(node);
			};
			this.sendRaw(sel + '-' + command);
		});
	}

	/** @internal */
	emitReady() {
		this.emit('debug-ready');
	}

	async connect(cwd: string, executable: string, target: string): Promise<any> {
		let args = [];
		if (executable && !nativePath.isAbsolute(executable)) {
			executable = nativePath.join(cwd, executable);
		}
		if (executable) {
			args = args.concat([executable], this.preargs);
		} else {
			args = this.preargs;
		}

		this.log('stdout', this.application + ' ' + args.join(' '));
		this.process = ChildProcess.spawn(this.application, args, { cwd: cwd, env: this.procEnv });
		this.process.stdout.on('data', this.stdout.bind(this));
		this.process.stderr.on('data', this.stderr.bind(this));
		this.process.on('exit', (code, signal) => {
			console.error(code, signal);
			if (signal) {
				this.emit('quit', new Error(`${this.application} killed by signal ${signal}`));
			}
			if (code !== 0) {
				this.emit('quit', new Error(`${this.application} exited with code ${signal}`));
			}
			this.emit('quit');
		});
		this.process.on('error', (err) => { this.emit('launcherror', err); });
		await this.sendCommand('gdb-set target-async on');
		await this.sendCommand('environment-directory ' + escapePath(cwd));
		await this.sendCommand('target-select remote ' + target);
	}

	stop() {
		const proc = this.process;
		const to = setTimeout(() => {
			process.kill(-proc.pid);
		}, 1000);
		this.process.on('exit', function (code) {
			clearTimeout(to);
		});
		this.sendRaw('-gdb-exit');
	}

	detach() {
		const proc = this.process;
		const to = setTimeout(() => {
			process.kill(-proc.pid);
		}, 1000);
		this.process.on('exit', function (code) {
			clearTimeout(to);
		});
		this.sendRaw('-target-detach');
	}

	async interrupt(wait: boolean = false): Promise<boolean> {
		if (trace) {
			this.log('stderr', 'interrupt');
		}

		if (wait) {
			const p = this.waitInterrupt();
			await this.sendCommand('exec-interrupt');
			return (await p) === true;
		} else {
			const info = await this.sendCommand('exec-interrupt');
			return info.resultRecords.resultClass === 'done';
		}
	}

	continue(reverse: boolean = false): Thenable<boolean> {
		if (trace) {
			this.log('stderr', 'continue');
		}
		return new Promise((resolve, reject) => {
			this.sendCommand('exec-continue' + (reverse ? ' --reverse' : '')).then((info) => {
				resolve(info.resultRecords.resultClass == 'running');
			}, reject);
		});
	}

	next(reverse: boolean = false): Thenable<boolean> {
		if (trace) {
			this.log('stderr', 'next');
		}
		return new Promise((resolve, reject) => {
			this.sendCommand('exec-next' + (reverse ? ' --reverse' : '')).then((info) => {
				resolve(info.resultRecords.resultClass == 'running');
			}, reject);
		});
	}

	step(reverse: boolean = false): Thenable<boolean> {
		if (trace) {
			this.log('stderr', 'step');
		}
		return new Promise((resolve, reject) => {
			this.sendCommand('exec-step' + (reverse ? ' --reverse' : '')).then((info) => {
				resolve(info.resultRecords.resultClass == 'running');
			}, reject);
		});
	}

	stepOut(reverse: boolean = false): Thenable<boolean> {
		if (trace) {
			this.log('stderr', 'stepOut');
		}
		return new Promise((resolve, reject) => {
			this.sendCommand('exec-finish' + (reverse ? ' --reverse' : '')).then((info) => {
				resolve(info.resultRecords.resultClass == 'running');
			}, reject);
		});
	}

	async addBreakPoint(breakpoint: Breakpoint): Promise<Breakpoint> {
		if (trace) {
			this.log('stderr', 'addBreakPoint');
		}
		if (this.breakpoints.has(breakpoint)) {
			return undefined;
		}
		let location = '';
		if (breakpoint.countCondition) {
			if (breakpoint.countCondition[0] == '>') {
				location += '-i ' + numRegex.exec(breakpoint.countCondition.substr(1))[0] + ' ';
			} else {
				const match = numRegex.exec(breakpoint.countCondition)[0];
				if (match.length != breakpoint.countCondition.length) {
					this.log('stderr', 'Unsupported break count expression: \'' + breakpoint.countCondition + '\'. Only supports \'X\' for breaking once after X times or \'>X\' for ignoring the first X breaks');
					location += '-t ';
				} else if (parseInt(match) != 0) {
					location += '-t -i ' + parseInt(match) + ' ';
				}
			}
		}
		if (breakpoint.raw) {
			location += escapePath(breakpoint.raw);
		} else {
			location += escapePath(breakpoint.file + ':' + breakpoint.line);
		}
		const result = await this.tryAddBreakpoint(location);
		if (result.resultRecords.resultClass == 'done') {
			const bkptNum = parseInt(result.result('bkpt.number'));
			const newBrk = {
				file: result.result('bkpt.file'),
				line: parseInt(result.result('bkpt.line')),
				condition: breakpoint.condition,
			};
			if (breakpoint.condition) {
				const result = await this.setBreakPointCondition(bkptNum, breakpoint.condition);
				if (result.resultRecords.resultClass == 'done') {
					this.breakpoints.set(newBrk, bkptNum);
					return newBrk;
				} else {
					return undefined;
				}
			} else {
				this.breakpoints.set(newBrk, bkptNum);
				return newBrk;
			}
		} else {
			return Promise.reject(result);
		}
	}

	removeBreakPoint(breakpoint: Breakpoint): Thenable<boolean> {
		if (trace) {
			this.log('stderr', 'removeBreakPoint');
		}
		return new Promise((resolve, reject) => {
			if (!this.breakpoints.has(breakpoint)) {
				return resolve(false);
			}
			this.sendCommand('break-delete ' + this.breakpoints.get(breakpoint)).then((result) => {
				if (result.resultRecords.resultClass == 'done') {
					this.breakpoints.delete(breakpoint);
					resolve(true);
				} else {
					resolve(false);
				}
			});
		});
	}

	clearBreakPoints(): Thenable<any> {
		if (trace) {
			this.log('stderr', 'clearBreakPoints');
		}
		return new Promise((resolve, reject) => {
			this.sendCommand('break-delete').then((result) => {
				if (result.resultRecords.resultClass == 'done') {
					this.breakpoints.clear();
					resolve(true);
				} else {
					resolve(false);
				}
			}, () => {
				resolve(false);
			});
		});
	}

	async getThreads(): Promise<Thread[]> {
		if (trace) {
			this.log('stderr', 'getThreads');
		}

		const command = 'thread-info';
		const result = await this.sendCommand(command);
		const threads = result.result('threads');
		const ret: Thread[] = [];
		return threads.map(element => {
			const ret: Thread = {
				id: parseInt(MINode.valueOf(element, 'id')),
				targetId: MINode.valueOf(element, 'target-id'),
			};

			const name = MINode.valueOf(element, 'name');
			if (name) {
				ret.name = name;
			}

			return ret;
		});
	}

	async getStack(maxLevels: number, thread: number): Promise<Stack[]> {
		if (trace) {
			this.log('stderr', 'getStack');
		}

		let command = 'stack-list-frames';
		if (thread != 0) {
			command += ` --thread ${thread}`;
		}
		if (maxLevels) {
			command += ' 0 ' + maxLevels;
		}
		const result = await this.sendCommand(command);
		const stack = result.result('stack');
		const ret: Stack[] = [];
		return stack.map(element => {
			const level = MINode.valueOf(element, '@frame.level');
			const addr = MINode.valueOf(element, '@frame.addr');
			const func = MINode.valueOf(element, '@frame.func');
			const filename = MINode.valueOf(element, '@frame.file');
			const file = MINode.valueOf(element, '@frame.fullname');
			let line = 0;
			const lnstr = MINode.valueOf(element, '@frame.line');
			if (lnstr) {
				line = parseInt(lnstr);
			}
			const from = parseInt(MINode.valueOf(element, '@frame.from'));
			return {
				address: addr,
				fileName: filename,
				file: file,
				function: func || from,
				level: level,
				line: line,
			};
		});
	}

	async getStackVariables(thread: number, frame: number): Promise<Variable[]> {
		if (trace) {
			this.log('stderr', 'getStackVariables');
		}

		const result = await this.sendCommand(`stack-list-variables --thread ${thread} --frame ${frame} --simple-values`);
		const variables = result.result('variables');
		const ret: Variable[] = [];
		for (const element of variables) {
			const key = MINode.valueOf(element, 'name');
			const value = MINode.valueOf(element, 'value');
			const type = MINode.valueOf(element, 'type');
			ret.push({
				name: key,
				valueStr: value,
				type: type,
				raw: element,
			});
		}
		return ret;
	}

	async evalExpression(name: string, thread: number, frame: number): Promise<MINode> {
		if (trace) {
			this.log('stderr', 'evalExpression');
		}

		let command = 'data-evaluate-expression ';
		if (thread != 0) {
			command += `--thread ${thread} --frame ${frame} `;
		}
		command += name;

		return await this.sendCommand(command);
	}

	isReady(): boolean {
		return !!this.process;
	}

	changeVariable(name: string, rawValue: string): Thenable<any> {
		if (trace) {
			this.log('stderr', 'changeVariable');
		}
		return this.sendCommand('gdb-set var ' + name + '=' + rawValue);
	}

	examineMemory(from: number, length: number): Thenable<any> {
		if (trace) {
			this.log('stderr', 'examineMemory');
		}
		return new Promise((resolve, reject) => {
			this.sendCommand('data-read-memory-bytes 0x' + from.toString(16) + ' ' + length).then((result) => {
				resolve(result.result('memory[0].contents'));
			}, reject);
		});
	}
}
