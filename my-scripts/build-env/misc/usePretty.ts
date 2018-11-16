import { MyOptions, OutputStreamControl, startWorking } from '@gongt/stillalive';
import { useThisStream } from './globalOutput';
import { mainDispose, useWriteFileStream } from './myBuildSystem';
import { streamPromise } from './streamUtil';

export function usePretty(save?: string, opts?: MyOptions): OutputStreamControl {
	const stream = startWorking();
	useThisStream(stream);
	Object.assign(stream, {noEnd: true});
	mainDispose((error: Error) => {
		useThisStream(process.stderr);
		if (error) {
			stream.fail(error.message);
		}
		stream.end();
		return streamPromise(stream);
	});
	
	if (save) {
		stream.pipe(useWriteFileStream(`logs/${save}.log`), {end: true});
	}
	
	return stream;
}