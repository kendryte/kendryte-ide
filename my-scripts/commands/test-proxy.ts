import { IncomingMessage } from 'http';
import { whatIsThis } from '../build-env/misc/help';
import { runMain } from '../build-env/misc/myBuildSystem';

const request = require('request');

whatIsThis(__filename, 'Test your HTTP_PROXY.');
runMain(async () => {
	console.log('HTTP_PROXY=%s', process.env.HTTP_PROXY);
	console.log('HTTPS_PROXY=%s', process.env.HTTPS_PROXY);
	console.log('');
	console.log('Requesting google.com for test. Timeout is 5s.');
	
	const ret = await new Promise<number>((resolve, reject) => {
		let val = 9;
		request({
			url: 'https://www.google.com',
			followRedirect: false,
			timeout: 5000,
			time: true,
			callback(err, res: IncomingMessage&any) {
				console.log('callback: ');
				
				if (err) {
					console.log('Request Error: ', err);
					val = 1;
				}
				
				if (res) {
					console.log('Response: %s %s', res.statusCode, res.statusMessage);
					if (res.statusCode !== 200) {
						val = 2;
					}
					console.log('Timing: ' + JSON.stringify(res.timings, null, 4));
					console.log('Timing Phase: ' + JSON.stringify(res.timingPhases, null, 4));
					val = 0;
				}
				
				resolve(val);
			},
		});
	});
	
	if (ret === 0) {
		console.log('Connection OK.');
	} else {
		console.log('Connection Failed.');
		console.log('  \x1B[38;5;9mYour proxy setting is invalid.\x1B[0m');
	}
	
	return ret;
});