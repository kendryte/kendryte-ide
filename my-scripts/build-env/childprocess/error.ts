function indentArgs(args: ReadonlyArray<string>) {
	return args.map((arg, index) => {
		return `  Argument[${index}] = ${arg}`;
	}).join('\n');
}

export interface ProgramError extends Error {
	__cwd: string;
	__program: string;
	__programError: boolean;
	signal: string;
	status: number;
}

export type ProcessRunInfo = [string, ReadonlyArray<string>, string]; // cmd args cwd

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
	const __program = `\`${cmd[0]} ${ cmd[1].join(' ')}\`
    Command = ${cmd[0]}
${indentArgs(cmd[1])}
`;
	return Object.assign(new Error(
		signal? `Program exit by signal "${signal}"` : `Program exit with code "${status}"`,
	), {
		status, signal,
		__programError: true,
		__program,
		__cwd: cmd[2],
	});
}
