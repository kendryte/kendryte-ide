import { DebugSession, Handles, InitializedEvent, OutputEvent, Scope, Source, StackFrame, StoppedEvent, TerminatedEvent, Thread, ThreadEvent } from 'vscode-debugadapter';
import { DebugProtocol } from 'vscode-debugprotocol';
import { Breakpoint, MIError, ValuesFormattingMode, Variable, VariableObject } from './backend';
import { MINode } from './mi_parse';
import { expandValue } from './gdb_expansion';
import { MI2 } from './mi2';
import * as systemPath from 'path';
import { posix } from 'path';
import * as net from 'net';
import * as os from 'os';
import * as fs from 'fs';
import { ContinuedEvent } from 'vscode-debugadapter/lib/debugSession';
import { format } from 'util';
import { CustomLogger } from './lib/logger';

const resolve = posix.resolve;
const relative = posix.relative;

class ExtendedVariable {
	constructor(public name, public options) {
	}
}

const STACK_HANDLES_START = 1000;
const VAR_HANDLES_START = 512 * 256 + 1000;

declare function DIE(e: Error): void;

export class MI2DebugSession extends DebugSession {
	protected variableHandles = new Handles<string | VariableObject | ExtendedVariable>(VAR_HANDLES_START);
	protected variableHandlesReverse: { [id: string]: number } = {};
	protected useVarObjects: boolean;
	protected quit: boolean;
	protected attached: boolean;
	protected started: boolean;
	protected crashed: boolean;
	protected debugReady: Promise<void>;
	protected miDebugger: MI2;
	protected commandServer: net.Server;

	protected logger: CustomLogger;

	public constructor(debuggerLinesStartAt1: boolean, isServer: boolean = false) {
		super(debuggerLinesStartAt1, isServer);

		this.logger = new CustomLogger('DAP', this);

		this.handleMsg('stderr', '[kendryte debug] debugger protocol.');

		process.on('unhandledRejection', (reason, p) => {
			this.handleMsg('stderr', format('[kendryte debug] Unhandled Rejection', p, '\n'));
			this.handleMsg('stderr', format('[kendryte debug] Unhandled Rejection', reason, '\n'));
		});

		process.on('uncaughtException', (err) => {
			try {
				this.handleMsg('stderr', format(`[kendryte debug] Uncaught Exception: ${err ? err.stack || err.message || err : 'No information'}\n`));
			} catch (e) {
				DIE(e);
			}
			process.exit(1);
		});
	}

	protected initDebugger(newDebugger: MI2) {
		if (this.miDebugger) {
			this.miDebugger.stop();
		}
		this.miDebugger = newDebugger;

		this.debugReady = new Promise<void>((resolve, reject) => {
			this.miDebugger.once('debug-ready', () => {
				this.miDebugger.removeListener('quit', reject);
				resolve();
			});
			this.miDebugger.on('quit', (err) => {
				this.handleMsg('stderr', format(`[kendryte debug] Child process quit: ${err ? err.stack || err.message || err : 'No information'}\n`));
				reject(err);
			});
		});
		this.miDebugger.on('launcherror', this.launchError.bind(this));
		this.miDebugger.on('quit', this.quitEvent.bind(this));
		this.miDebugger.on('exited-normally', this.quitEvent.bind(this));
		this.miDebugger.on('stopped', this.stopEvent.bind(this));
		this.miDebugger.on('msg', this.handleMsg.bind(this));
		this.miDebugger.on('breakpoint', this.handleBreakpoint.bind(this));
		this.miDebugger.on('step-end', this.handleBreak.bind(this));
		this.miDebugger.on('step-out-end', this.handleBreak.bind(this));
		this.miDebugger.on('signal-stop', this.handlePause.bind(this));
		this.miDebugger.on('thread-created', this.threadCreatedEvent.bind(this));
		this.miDebugger.on('thread-exited', this.threadExitedEvent.bind(this));
		this.miDebugger.on('program-status', this.programStatus.bind(this));
		this.sendEvent(new InitializedEvent());
		try {
			this.commandServer = net.createServer(c => {
				c.on('data', data => {
					const rawCmd = data.toString();
					const spaceIndex = rawCmd.indexOf(' ');
					let func = rawCmd;
					let args = [];
					if (spaceIndex != -1) {
						func = rawCmd.substr(0, spaceIndex);
						args = JSON.parse(rawCmd.substr(spaceIndex + 1));
					}
					Promise.resolve(this.miDebugger[func].apply(this.miDebugger, args)).then(data => {
						c.write(data.toString());
					});
				});
			});
			this.commandServer.on('error', err => {
				if (process.platform != 'win32') {
					this.handleMsg('stderr', 'Kendryte-Debug WARNING: Utility Command Server: Error in command socket ' + err.toString() + '\nKendryte-Debug WARNING: The examine memory location command won\'t work');
				}
			});
			if (!fs.existsSync(systemPath.join(os.tmpdir(), 'kendryte-debug-sockets'))) {
				fs.mkdirSync(systemPath.join(os.tmpdir(), 'kendryte-debug-sockets'));
			}
			this.commandServer.listen(systemPath.join(os.tmpdir(), 'kendryte-debug-sockets', 'Debug-Instance-' + Math.floor(Math.random() * 36 * 36 * 36 * 36).toString(36)));
		} catch (e) {
			if (process.platform != 'win32') {
				this.handleMsg('stderr', 'Kendryte-Debug WARNING: Utility Command Server: Failed to start ' + e.toString() + '\nKendryte-Debug WARNING: The examine memory location command won\'t work');
			}
		}
	}

	protected setValuesFormattingMode(mode: ValuesFormattingMode) {
		switch (mode) {
			case 'disabled':
				this.useVarObjects = true;
				this.miDebugger.prettyPrint = false;
				break;
			case 'prettyPrinters':
				this.useVarObjects = true;
				this.miDebugger.prettyPrint = true;
				break;
			case 'parseText':
			default:
				this.useVarObjects = false;
				this.miDebugger.prettyPrint = false;
		}
	}

	protected handleMsg(type: string, msg: string) {
		if (type == 'target') {
			type = 'stdout';
		}
		if (type == 'log') {
			type = 'stderr';
		}
		this.sendEvent(new OutputEvent(msg, type));
	}

	protected handleBreakpoint(info: MINode) {
		const event = new StoppedEvent('breakpoint', parseInt(info.record('thread-id')));
		(event as DebugProtocol.StoppedEvent).body.allThreadsStopped = info.record('stopped-threads') == 'all';
		this.sendEvent(event);
	}

	protected handleBreak(info: MINode) {
		const event = new StoppedEvent('step', parseInt(info.record('thread-id')));
		(event as DebugProtocol.StoppedEvent).body.allThreadsStopped = info.record('stopped-threads') == 'all';
		this.sendEvent(event);
	}

	protected handlePause(info: MINode) {
		const event = new StoppedEvent('user request', parseInt(info.record('thread-id')));
		(event as DebugProtocol.StoppedEvent).body.allThreadsStopped = info.record('stopped-threads') == 'all';
		this.sendEvent(event);
	}

	protected stopEvent(info: MINode) {
		if (!this.started) {
			this.crashed = true;
		}
		if (!this.quit) {
			const event = new StoppedEvent('exception', parseInt(info.record('thread-id')));
			(event as DebugProtocol.StoppedEvent).body.allThreadsStopped = info.record('stopped-threads') == 'all';
			this.sendEvent(event);
		}
	}

	protected threadCreatedEvent(info: MINode) {
		this.sendEvent(new ThreadEvent('started', info.record('id')));
	}

	protected threadExitedEvent(info: MINode) {
		this.sendEvent(new ThreadEvent('exited', info.record('id')));
	}

	protected programStatus(isRun: boolean) {
		if (isRun) {
			this.sendEvent(new ContinuedEvent(0, true));
		} else {
			const e = new StoppedEvent('unknown', 0);
			(e as DebugProtocol.StoppedEvent).body.allThreadsStopped = true;
			this.sendEvent(e);
		}
	}

	protected quitEvent() {
		this.quit = true;
		this.sendEvent(new TerminatedEvent());
	}

	protected launchError(err: any) {
		this.handleMsg('stderr', 'Could not start debugger process, does the program exist in filesystem?\n');
		this.handleMsg('stderr', err.toString() + '\n');
		this.quitEvent();
	}

	protected disconnectRequest(response: DebugProtocol.DisconnectResponse, args: DebugProtocol.DisconnectArguments): void {
		if (this.attached) {
			this.miDebugger.detach();
		} else {
			this.miDebugger.stop();
		}
		this.commandServer.close();
		this.commandServer = undefined;
		this.sendResponse(response);
	}

	protected async setVariableRequest(response: DebugProtocol.SetVariableResponse, args: DebugProtocol.SetVariableArguments): Promise<void> {
		try {
			if (this.useVarObjects) {
				let name = args.name;
				if (args.variablesReference >= VAR_HANDLES_START) {
					const parent = this.variableHandles.get(args.variablesReference) as VariableObject;
					name = `${parent.name}.${name}`;
				}

				const res = await this.miDebugger.varAssign(name, args.value);
				response.body = {
					value: res.result('value'),
				};
			} else {
				await this.miDebugger.changeVariable(args.name, args.value);
				response.body = {
					value: args.value,
				};
			}
			this.sendResponse(response);
		} catch (err) {
			this.sendErrorResponse(response, 11, `Could not continue: ${err}`);
		}
	}

	protected async setFunctionBreakPointsRequest(response: DebugProtocol.SetFunctionBreakpointsResponse, args: DebugProtocol.SetFunctionBreakpointsArguments) {
		try {
			await this.debugReady;

			const all = args.breakpoints.map(brk => {
				return this.miDebugger.addBreakPoint({ raw: brk.name, condition: brk.condition, countCondition: brk.hitCondition });
			});

			await this.afterAddBreakpoints(response, all);
		} catch (e) {
			this.sendErrorResponse(response, 10, e.toString());
		}
	}

	protected async setBreakPointsRequest(response: DebugProtocol.SetBreakpointsResponse, args: DebugProtocol.SetBreakpointsArguments) {
		try {
			await this.debugReady;

			await this.miDebugger.clearBreakPoints();

			const path = args.source.path;
			const all = args.breakpoints.map(brk => {
				return this.miDebugger.addBreakPoint({ file: path, line: brk.line, condition: brk.condition, countCondition: brk.hitCondition });
			});

			await this.afterAddBreakpoints(response, all);
		} catch (e) {
			this.sendErrorResponse(response, 9, e.toString());
		}
	}

	private async afterAddBreakpoints(response: DebugProtocol.SetBreakpointsResponse, breaks: Promise<Breakpoint>[]) {
		const brkpoints = await Promise.all(breaks);
		const finalBrks = brkpoints.filter(brkp => !!brkp).map((brk) => {
			return Object.assign(brk, { verified: true });
		});
		response.body = {
			breakpoints: finalBrks,
		};
		this.sendResponse(response);
	}

	protected threadsRequest(response: DebugProtocol.ThreadsResponse): void {
		if (!this.miDebugger) {
			this.sendResponse(response);
			return;
		}
		this.miDebugger.getThreads().then(
			threads => {
				response.body = {
					threads: [],
				};
				for (const thread of threads) {
					let threadName = thread.name;
					// TODO: Thread names are undefined on LLDB
					if (threadName === undefined) {
						threadName = thread.targetId;
					}
					if (threadName === undefined) {
						threadName = '<unnamed>';
					}
					response.body.threads.push(new Thread(thread.id, thread.id + ':' + threadName));
				}
				this.sendResponse(response);
			});
	}

	// Supports 256 threads.
	protected threadAndLevelToFrameId(threadId: number, level: number) {
		return level << 8 | threadId;
	}

	protected frameIdToThreadAndLevel(frameId: number) {
		return [frameId & 0xff, frameId >> 8];
	}

	protected stackTraceRequest(response: DebugProtocol.StackTraceResponse, args: DebugProtocol.StackTraceArguments): void {
		this.miDebugger.getStack(args.levels, args.threadId).then(stack => {
			const ret: StackFrame[] = [];
			stack.forEach(element => {
				let source = undefined;
				let file = element.file;
				if (file) {
					if (process.platform === 'win32') {
						if (file.startsWith('\\cygdrive\\') || file.startsWith('/cygdrive/')) {
							file = file[10] + ':' + file.substr(11); // replaces /cygdrive/c/foo/bar.txt with c:/foo/bar.txt
						}
					}
					source = new Source(element.fileName, file);
				}

				ret.push(new StackFrame(
					this.threadAndLevelToFrameId(args.threadId, element.level),
					element.function + '@' + element.address,
					source,
					element.line,
					0,
				));
			});
			response.body = {
				stackFrames: ret,
			};
			this.sendResponse(response);
		}, err => {
			this.sendErrorResponse(response, 12, `Failed to get Stack Trace: ${err.toString()}`);
		});
	}

	protected configurationDoneRequest(response: DebugProtocol.ConfigurationDoneResponse, args: DebugProtocol.ConfigurationDoneArguments): void {
		this.miDebugger.log('stdout', 'Configuration done!');
		this.miDebugger.continue().then(done => {
			this.sendResponse(response);
		}, msg => {
			this.sendErrorResponse(response, 2, `Could not continue: ${msg}`);
		});
	}

	protected scopesRequest(response: DebugProtocol.ScopesResponse, args: DebugProtocol.ScopesArguments): void {
		const scopes: Scope[] = [];
		scopes.push(new Scope('Local', STACK_HANDLES_START + (parseInt(args.frameId as any) || 0), false));

		response.body = {
			scopes: scopes,
		};
		this.sendResponse(response);
	}

	protected async variablesRequest(response: DebugProtocol.VariablesResponse, args: DebugProtocol.VariablesArguments): Promise<void> {
		const variables: DebugProtocol.Variable[] = [];
		let id: number | string | VariableObject | ExtendedVariable;
		if (args.variablesReference < VAR_HANDLES_START) {
			id = args.variablesReference - STACK_HANDLES_START;
		} else {
			id = this.variableHandles.get(args.variablesReference);
		}

		const createVariable = (arg, options?) => {
			if (options) {
				return this.variableHandles.create(new ExtendedVariable(arg, options));
			} else {
				return this.variableHandles.create(arg);
			}
		};

		const findOrCreateVariable = (varObj: VariableObject): number => {
			let id: number;
			if (this.variableHandlesReverse.hasOwnProperty(varObj.name)) {
				id = this.variableHandlesReverse[varObj.name];
			} else {
				id = createVariable(varObj);
				this.variableHandlesReverse[varObj.name] = id;
			}
			return varObj.isCompound() ? id : 0;
		};

		if (typeof id == 'number') {
			let stack: Variable[];
			try {
				const [threadId, level] = this.frameIdToThreadAndLevel(id);
				stack = await this.miDebugger.getStackVariables(threadId, level);
				for (const variable of stack) {
					if (this.useVarObjects) {
						try {
							const varObjName = `var_${id}_${variable.name}`;
							let varObj: VariableObject;
							try {
								const changes = await this.miDebugger.varUpdate(varObjName);
								const changelist = changes.result('changelist');
								changelist.forEach((change) => {
									const name = MINode.valueOf(change, 'name');
									const vId = this.variableHandlesReverse[name];
									const v = this.variableHandles.get(vId) as any;
									v.applyChanges(change);
								});
								const varId = this.variableHandlesReverse[varObjName];
								varObj = this.variableHandles.get(varId) as any;
							} catch (err) {
								if (err instanceof MIError && err.message == 'Variable object not found') {
									varObj = await this.miDebugger.varCreate(variable.name, varObjName);
									const varId = findOrCreateVariable(varObj);
									varObj.exp = variable.name;
									varObj.id = varId;
								} else {
									throw err;
								}
							}
							variables.push(varObj.toProtocolVariable());
						} catch (err) {
							variables.push({
								name: variable.name,
								value: `<${err}>`,
								variablesReference: 0,
							});
						}
					} else {
						if (variable.valueStr !== undefined) {
							let expanded = expandValue(createVariable, `{${variable.name}=${variable.valueStr})`, '', variable.raw);
							if (expanded) {
								if (typeof expanded[0] == 'string') {
									expanded = [
										{
											name: '<value>',
											value: prettyStringArray(expanded),
											variablesReference: 0,
										},
									];
								}
								variables.push(expanded[0]);
							}
						} else {
							variables.push({
								name: variable.name,
								type: variable.type,
								value: '<unknown>',
								variablesReference: createVariable(variable.name),
							});
						}
					}
				}
				response.body = {
					variables: variables,
				};
				this.sendResponse(response);
			} catch (err) {
				this.sendErrorResponse(response, 1, `Could not expand variable: ${err}`);
			}
		} else if (typeof id == 'string') {
			// Variable members
			let variable;
			try {
				// TODO: this evals on an (effectively) unknown thread for multithreaded programs.
				variable = await this.miDebugger.evalExpression(JSON.stringify(id), 0, 0);
				try {
					let expanded = expandValue(createVariable, variable.result('value'), id, variable);
					if (!expanded) {
						this.sendErrorResponse(response, 2, `Could not expand variable`);
					} else {
						if (typeof expanded[0] == 'string') {
							expanded = [
								{
									name: '<value>',
									value: prettyStringArray(expanded),
									variablesReference: 0,
								},
							];
						}
						response.body = {
							variables: expanded,
						};
						this.sendResponse(response);
					}
				} catch (e) {
					this.sendErrorResponse(response, 2, `Could not expand variable: ${e}`);
				}
			} catch (err) {
				this.sendErrorResponse(response, 1, `Could not expand variable: ${err}`);
			}
		} else if (typeof id == 'object') {
			if (id instanceof VariableObject) {
				// Variable members
				let children: VariableObject[];
				try {
					children = await this.miDebugger.varListChildren(id.name);
					const vars = children.map(child => {
						child.id = findOrCreateVariable(child);
						return child.toProtocolVariable();
					});

					response.body = {
						variables: vars,
					};
					this.sendResponse(response);
				} catch (err) {
					this.sendErrorResponse(response, 1, `Could not expand variable: ${err}`);
				}
			} else if (id instanceof ExtendedVariable) {
				const varReq = id;
				if (varReq.options.arg) {
					const strArr = [];
					let argsPart = true;
					let arrIndex = 0;
					const submit = () => {
						response.body = {
							variables: strArr,
						};
						this.sendResponse(response);
					};
					const addOne = async () => {
						// TODO: this evals on an (effectively) unknown thread for multithreaded programs.
						const variable = await this.miDebugger.evalExpression(JSON.stringify(`${varReq.name}+${arrIndex})`), 0, 0);
						try {
							const expanded = expandValue(createVariable, variable.result('value'), varReq.name, variable);
							if (!expanded) {
								this.sendErrorResponse(response, 15, `Could not expand variable`);
							} else {
								if (typeof expanded == 'string') {
									if (expanded == '<nullptr>') {
										if (argsPart) {
											argsPart = false;
										} else {
											return submit();
										}
									} else if (expanded[0] != '"') {
										strArr.push({
											name: '[err]',
											value: expanded,
											variablesReference: 0,
										});
										return submit();
									}
									strArr.push({
										name: `[${(arrIndex++)}]`,
										value: expanded,
										variablesReference: 0,
									});
									addOne();
								} else {
									strArr.push({
										name: '[err]',
										value: expanded,
										variablesReference: 0,
									});
									submit();
								}
							}
						} catch (e) {
							this.sendErrorResponse(response, 14, `Could not expand variable: ${e}`);
						}
					};
					addOne();
				} else {
					this.sendErrorResponse(response, 13, `Unimplemented variable request options: ${JSON.stringify(varReq.options)}`);
				}
			} else {
				response.body = {
					variables: id,
				};
				this.sendResponse(response);
			}
		} else {
			response.body = {
				variables: variables,
			};
			this.sendResponse(response);
		}
	}

	protected pauseRequest(response: DebugProtocol.PauseResponse, args: DebugProtocol.PauseArguments): void {
		this.miDebugger.interrupt(true).then(done => {
			this.sendResponse(response);
		}, msg => {
			this.sendErrorResponse(response, 3, `Could not pause: ${msg}`);
		});
	}

	protected reverseContinueRequest(response: DebugProtocol.ReverseContinueResponse, args: DebugProtocol.ReverseContinueArguments): void {
		this.miDebugger.continue(true).then(done => {
			this.sendResponse(response);
		}, msg => {
			this.sendErrorResponse(response, 2, `Could not continue: ${msg}`);
		});
	}

	protected continueRequest(response: DebugProtocol.ContinueResponse, args: DebugProtocol.ContinueArguments): void {
		this.miDebugger.continue().then(done => {
			this.sendResponse(response);
		}, msg => {
			this.sendErrorResponse(response, 2, `Could not continue: ${msg}`);
		});
	}

	protected stepBackRequest(response: DebugProtocol.StepBackResponse, args: DebugProtocol.StepBackArguments): void {
		this.miDebugger.step(true).then(done => {
			this.sendResponse(response);
		}, msg => {
			this.sendErrorResponse(response, 4, `Could not step back: ${msg} - Try running 'target record-full' before stepping back`);
		});
	}

	protected stepInRequest(response: DebugProtocol.NextResponse, args: DebugProtocol.NextArguments): void {
		this.miDebugger.step().then(done => {
			this.sendResponse(response);
		}, msg => {
			this.sendErrorResponse(response, 4, `Could not step in: ${msg}`);
		});
	}

	protected stepOutRequest(response: DebugProtocol.NextResponse, args: DebugProtocol.NextArguments): void {
		this.miDebugger.stepOut().then(done => {
			this.sendResponse(response);
		}, msg => {
			this.sendErrorResponse(response, 5, `Could not step out: ${msg}`);
		});
	}

	protected nextRequest(response: DebugProtocol.NextResponse, args: DebugProtocol.NextArguments): void {
		this.miDebugger.next().then(done => {
			this.sendResponse(response);
		}, msg => {
			this.sendErrorResponse(response, 6, `Could not step over: ${msg}`);
		});
	}

	protected evaluateRequest(response: DebugProtocol.EvaluateResponse, args: DebugProtocol.EvaluateArguments): void {
		const [threadId, level] = this.frameIdToThreadAndLevel(args.frameId);
		if (args.context == 'watch' || args.context == 'hover') {
			this.miDebugger.evalExpression(args.expression, threadId, level).then((res) => {
				response.body = {
					variablesReference: 0,
					result: res.result('value'),
				};
				this.sendResponse(response);
			}, msg => {
				this.sendErrorResponse(response, 7, msg.toString());
			});
		} else {
			this.miDebugger.sendUserInput(args.expression, threadId, level).then(output => {
				if (typeof output == 'undefined') {
					response.body = {
						result: '',
						variablesReference: 0,
					};
				} else {
					response.body = {
						result: JSON.stringify(output),
						variablesReference: 0,
					};
				}
				this.sendResponse(response);
			}, msg => {
				this.sendErrorResponse(response, 8, msg.toString());
			});
		}
	}
}

function prettyStringArray(strings) {
	if (typeof strings == 'object') {
		if (strings.length !== undefined) {
			return strings.join(', ');
		} else {
			return JSON.stringify(strings);
		}
	} else {
		return strings;
	}
}
