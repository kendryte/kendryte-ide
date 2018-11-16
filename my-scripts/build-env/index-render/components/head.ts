import { IncomingMessage } from 'http';
import { resolve } from 'path';
import { getWithCache, request } from '../../misc/httpUtil';
import { CollectingStream } from '../../misc/streamUtil';

export async function buildHead(pieces: string[]) {
	const bs = await getWithCache('https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css');
	
	pieces.push(
		'<head>',
		'\t<meta charset="utf-8"/>',
		'\t<title>Kendryte IDE Downloads</title>',
		`\t<style type="text/css">${bs}</style>`,
		'\t<style type="text/css">',
	);
	
	const {renderSync} = require('sass');
	
	const result = renderSync({
		file: resolve(__dirname, 'style.scss'),
		sourceMap: false,
		indentType: 'tab',
	});
	
	pieces.push(result.css.toString('utf8'), '</style>');
	pieces.push('</head>');
}

function download(url: string): Promise<string> {
	return new Promise((resolve, reject) => {
		request(url, {method: 'HEAD'}, (res: IncomingMessage) => {
			const body = res.pipe(new CollectingStream());
			body.promise().then(resolve, reject);
		}).end();
	});
}
