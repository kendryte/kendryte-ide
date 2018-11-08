import { MyOptions, OutputStreamControl, startWorking } from '@gongt/stillalive';
import { useThisStream } from './globalOutput';
import { mainDispose } from './myBuildSystem';

export function usePretty(opts?: MyOptions): OutputStreamControl {
	const stream = startWorking();
	useThisStream(stream);
	Object.assign(stream, {noEnd: true});
	mainDispose((error: Error) => {
		useThisStream(process.stderr);
		if (error) {
			stream.fail(error.message);
		}
		stream.end();
	});
	return stream;
}