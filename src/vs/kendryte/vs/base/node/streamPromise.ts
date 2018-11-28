export function streamPromise(stream: NodeJS.ReadableStream | NodeJS.WritableStream): Promise<void> {
	if (streamHasEnd(stream)) {
		return Promise.resolve();
	} else {
		return new Promise((resolve, reject) => {
			stream.once('end', () => resolve());
			stream.once('finish', () => resolve());
			stream.once('close', () => resolve());
			stream.once('error', reject);
		});
	}
}

export function streamHasEnd(S: NodeJS.ReadableStream | NodeJS.WritableStream) {
	const stream = S as any;
	return (stream._writableState && stream._writableState.ended) || (stream._readableState && stream._readableState.ended);
}
