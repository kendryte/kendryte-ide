const timeoutedName = 'Timeout';

export { timeout as msleep } from 'vs/base/common/async';

/**
 * Returns an error that signals timeout.
 */
export function timeouted(): Error {
	const error = new Error(timeoutedName);
	error.name = error.message;
	return error;
}

export function timeout(millis: number): Promise<never> {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			reject(timeouted());
		}, millis);
	});
}
