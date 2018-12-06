import { MI2DebugSession } from './backend/mibase';
import { DebugSession } from 'vscode-debugadapter';
import { DebugProtocol } from 'vscode-debugprotocol';
import { MI2 } from './backend/mi2';
import { ValuesFormattingMode } from './backend/backend';
import { executableExtension } from './env';

export interface RequestArguments {
	cwd: string;
	target: string;
	gdbpath: string;
	env: any;
	debugger_args: string[];
	arguments: string;
	terminal: string;
	autorun: string[];
	executable: string;
	remote: boolean;
	valuesFormatting: ValuesFormattingMode;
	printCalls: boolean;
}

export interface LaunchRequestArguments extends RequestArguments, DebugProtocol.LaunchRequestArguments {
}

export interface AttachRequestArguments extends RequestArguments, DebugProtocol.AttachRequestArguments {
}

class GDBDebugSession extends MI2DebugSession {
	protected initializeRequest(response: DebugProtocol.InitializeResponse, args: DebugProtocol.InitializeRequestArguments): void {
		this.logger.info('[DAP] initializeRequest', response, args);
		response.body.supportsHitConditionalBreakpoints = true;
		response.body.supportsConfigurationDoneRequest = true;
		response.body.supportsConditionalBreakpoints = true;
		response.body.supportsFunctionBreakpoints = true;
		response.body.supportsEvaluateForHovers = true;
		response.body.supportsSetVariable = true;
		response.body.supportsStepBack = true;
		response.body.supportsRestartRequest = false;
		this.sendResponse(response);
	}

	protected attachAndLaunch(islaunch: boolean, response: DebugProtocol.Response, args: RequestArguments) {
		this.logger.info('[DAP] attachAndLaunch', islaunch, response, args);
		this.initDebugger(new MI2(
			this,
			args.gdbpath || ('riscv64-unknown-elf-gdb' + executableExtension),
			['--interpreter=mi2'],
			args.debugger_args,
			args.env,
		));
		this.quit = false;
		this.attached = false;
		this.crashed = false;
		this.setValuesFormattingMode(args.valuesFormatting);
		this.miDebugger.printCalls = args.printCalls;
		this.miDebugger.connect(args.cwd, args.executable, args.target).then(async () => {
			this.miDebugger.log('stdout', 'network connected.');
			await this.miDebugger.interrupt();
			await this.miDebugger.sendUserInput('delete breakpoints');
			await this.miDebugger.sendUserInput('delete tracepoints');
			if (islaunch) {
				await this.miDebugger.sendUserInput('load');
				this.miDebugger.log('stdout', 'program loaded.');
			} else {
				this.miDebugger.log('stdout', 'is attach request. load has skipped.');
			}
			if (args.autorun && args.autorun.length) {
				this.miDebugger.log('stdout', 'autorun:');
				for (const command of args.autorun) {
					await this.miDebugger.sendUserInput(command);
				}
				this.miDebugger.log('stdout', 'autorun finish.');
			} else {
				this.miDebugger.log('stdout', 'autorun has skipped.');
			}

			this.miDebugger.emitReady();

			this.miDebugger.log('stdout', 'Ready.');

			this.sendResponse(response);
		}, err => {
			this.sendErrorResponse(response, 102, `Failed to attach: ${err.toString()}`);
		});
	}

	protected attachRequest(response: DebugProtocol.AttachResponse, args: AttachRequestArguments): void {
		this.attachAndLaunch(false, response, args);
	}

	protected launchRequest(response: DebugProtocol.LaunchResponse, args: LaunchRequestArguments): void {
		this.attachAndLaunch(true, response, args);
	}
}

DebugSession.run(GDBDebugSession);
