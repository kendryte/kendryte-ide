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
		let val = 0;
		request({
			url: 'https://www.google.com',
			followRedirect: false,
			timeout: 5000,
			time: true,
			callback(err, res: IncomingMessage&any) {
				console.log('callback: ');
				
				if (err) {
					console.log('Request Error: ', err);
					if (res.statusCode !== 200) {
						val = 1;
					}
				}
				
				if (res) {
					console.log('Response: %s %s', res.statusCode, res.statusMessage);
					if (res.statusCode !== 200) {
						val = 2;
					}
					console.log('Timing: ' + JSON.stringify(res.timings, null, 4));
					console.log('Timing Phase: ' + JSON.stringify(res.timingPhases, null, 4));
				}
				
				resolve(val);
			},
		});
	});
	
	if (ret === 0) {
		console.log('connection OK.');
	} else {
		console.log('connection Failed.');
	}
	
	return ret;
});