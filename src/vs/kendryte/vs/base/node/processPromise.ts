import { ChildProcess } from 'child_process';

export class ProgramError extends Error {
	public readonly signal: string;
	public readonly status: number;

	constructor(
		signal: string,
		status: number,
	) {
		const msg = signal ? 'signal ' + signal : 'code ' + status;
		super('program exit with ' + msg);

		this.signal = signal;
		this.status = status;
	}
}

export function processPromise(cp: ChildProcess) {
	return new Promise<void>((resolve, reject) => {
		cp.once('error', reject);
		cp.once('exit', (code: number, signal: string) => {
			const e = StatusCodeError(code, signal);
			if (e) {
				reject(e);
			} else {
				resolve();
			}
		});
	});
}

function StatusCodeError(status: number, signal: string): ProgramError {
	if (status === 0 && !signal) {
		return null;
	}
	return new ProgramError(signal, status);
}
