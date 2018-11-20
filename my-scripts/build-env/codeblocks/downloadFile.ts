import { OutputStreamControl } from '@gongt/stillalive';
import { createWriteStream } from 'fs';
import { mkdirp } from 'fs-extra';
import { dirname, extname, resolve } from 'path';
import { muteCommandOut, pipeCommandBoth } from '../childprocess/complex';
import { promiseToBool } from '../misc/asyncUtil';
import { isExists, rename } from '../misc/fsUtil';
import { streamPromise } from '../misc/streamUtil';
import { md5 } from './statusHash';

const request = require('request');
const progress = require('request-progress');

export function createTempPath(url: string) {
	return resolve(process.env.TEMP, md5(url) + extname(url));
}

export async function downloadFile(output: OutputStreamControl, url: string, localSave: string) {
	output.writeln(`downloading file: ${url}\n  save to: ${localSave}`);
	if (await isExists(localSave)) {
		output.writeln(`already exists...`);
		return;
	}
	
	await mkdirp(dirname(localSave));
	
	const hasWget = await promiseToBool(muteCommandOut('wget', '--version'));
	const saveTo = createWriteStream(localSave + '.partial', {autoClose: true});
	if (hasWget) {
		output.writeln('Download engine: native wget');
		await pipeCommandBoth(saveTo, output.screen, 'wget', '-O', '-', '--progress=bar:force', '--', url);
		await streamPromise(saveTo);
	} else {
		output.writeln('Download engine: node request');
		await nodeDown(output, url, saveTo);
	}
	
	await rename(localSave + '.partial', localSave);
}

function nodeDown(output: OutputStreamControl, from: string, saveTo: NodeJS.WritableStream) {
	// The options argument is optional so you can omit it
	progress(request(from), {
		// throttle: 2000,                    // Throttle the progress event to 2000ms, defaults to 1000ms
		// delay: 1000,                       // Only start to emit after 1000ms delay, defaults to 0ms
		// lengthHeader: 'x-transfer-length'  // Length header to use, defaults to content-length
	}).on('progress', function (state) {
		// The state is an object that looks like this:
		// {
		//     percent: 0.5,               // Overall percent (between 0 to 1)
		//     speed: 554732,              // The download speed in bytes/sec
		//     size: {
		//         total: 90044871,        // The total payload size in bytes
		//         transferred: 27610959   // The transferred payload size in bytes
		//     },
		//     time: {
		//         elapsed: 36.235,        // The total elapsed seconds since the start (3 decimals)
		//         remaining: 81.403       // The remaining seconds to finish (3 decimals)
		//     }
		// }
		output.screen.log(
			'downloading [%s%]: %s/%s MB - %sKB/s',
			state.percent,
			(state.size.transferred / 1024 / 1024).toFixed(2),
			(state.size.total / 1024 / 1024).toFixed(2),
			(state.speed / 1024).toFixed(2),
		);
	}).pipe(saveTo);
	return streamPromise(saveTo);
}
