/* No use any node_modules deps */

export interface ProgramError extends Error {
	status: number;
	signal: string;
	__programError: boolean;
}

export function ThrowStatusCodeError(status: number, signal: string): never|void {
	const e = StatusCodeError(status, signal);
	if (e) {
		throw e;
	}
	return;
}

export function StatusCodeError(status: number, signal: string): ProgramError {
	if (status === 0 && !signal) {
		return null;
	}
	return Object.assign(new Error(
		signal? `Program exit by signal "${signal}"` : `Program exit with code "${status}"`,
	), {
		status, signal,
		__programError: true,
	});
}
