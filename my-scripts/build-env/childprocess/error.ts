/* No use any node_modules deps */

export interface ProgramError extends Error {
	status: number;
	signal: string;
	__programError: boolean;
	__program: string;
	__cwd: string;
}

export type ProcessRunInfo = [string, string[], string]; // cmd args cwd

export function ThrowStatusCodeError(status: number, signal: string, cmd: ProcessRunInfo): never|void {
	const e = StatusCodeError(status, signal, cmd);
	if (e) {
		throw e;
	}
	return;
}

export function StatusCodeError(status: number, signal: string, cmd: ProcessRunInfo): ProgramError {
	if (status === 0 && !signal) {
		return null;
	}
	const __program = `Command = ${cmd[0]}` + cmd[1].map((arg, index) => {
		return `\nArgument[${index}] = ${arg}`;
	}).join('');
	return Object.assign(new Error(
		signal? `Program exit by signal "${signal}"` : `Program exit with code "${status}"`,
	), {
		status, signal,
		__programError: true,
		__program,
		__cwd: cmd[2],
	});
}
