import { IncomingMessage } from 'http';
import { extname } from 'path';
import { humanSize } from '../../codeblocks/humanSize';
import { s3BucketUrl, s3DownloadStream, s3LoadText, s3UploadBuffer } from '../../misc/awsUtil';
import { globalLog } from '../../misc/globalOutput';
import { hashStream } from '../../misc/hashUtil';
import { request } from '../../misc/httpUtil';

type info = {
	sevenZip?: string;
};

export async function createReleaseDownload({sevenZip}: info) {
	return `<tr>
	<th colspan="3">
		<span>Kendryte IDE</span>
	</th>
</tr>
${await createDownload(sevenZip, 'btn-primary')}
`;
}

export async function createUpdateDownload({sevenZip}: info) {
	return `<tr>
	<th colspan="3">
		<span class="en">Offline Dependency Packages</span>
		<span class="cn">离线依赖包</span>
	</th>
</tr>
${await createDownload(sevenZip, 'btn-primary')}
`;
}

async function createDownload(key: string, btnClass: string) {
	if (!key) {
		return `
<tr>
	<td colspan="3">
		<span class="en">Coming soon, Please wait...</span>
		<span class="cn">制作中，请稍后再来……</span>
	</td>
</tr>
`;
	}
	const {md5, size, time} = await getFileInfo(key);
	const sizeStr = humanSize(size);
	
	const url = s3BucketUrl(key);
	return `<tr>
	<td>
		<a class="en btn ${btnClass}" href="${url}">Download</a>
		<a class="cn btn ${btnClass}" href="${url}">下载</a>
	</td>
	<td>${extname(key)}</td>
	<td>${sizeStr}</td>
</tr>
<tr>
	<td colspan="3"><span class="badge badge-info">MD5:</span>&nbsp;${md5}</td>
</tr>
<tr>
	<td colspan="3"><span class="badge badge-info">Time:</span>&nbsp;<span class="date">${time}</span></td>
</tr>`;
}

async function getFileInfo(key: string): Promise<{md5: string, size: string, time: string}> {
	globalLog('Get hash-file of file: %s', key);
	const md5FileKey = key + '.md5';
	globalLog('Requesting file size: %s', key);
	let {size, time} = await getHeadInfo(s3BucketUrl(key)).catch(() => {
		return {} as any;
	});
	if (!time) {
		time = 'Unknown';
	}
	
	globalLog('    size: %s', size);
	globalLog('    time: %s', time);
	if (!size) {
		globalLog('Temporary unavailable.');
		return {
			md5: 'Temporary unavailable.',
			size: '???',
			time,
		};
	}
	
	let md5 = await s3LoadText(md5FileKey).catch(e => '');
	globalLog('    md5: %s', md5);
	if (md5) {
		return {
			md5,
			size,
			time,
		};
	}
	
	globalLog('Downloading file: %s', key);
	const stream = s3DownloadStream(key);
	md5 = await hashStream(stream);
	globalLog('    re-calc md5: %s', md5);
	
	globalLog('Upload md5-file: %s', md5);
	await s3UploadBuffer({
		stream: Buffer.from(md5, 'utf8'),
		mime: 'text/plain',
	}, md5FileKey);
	
	return {
		size,
		md5,
		time,
	};
}

function getHeadInfo(url: string) {
	return new Promise<{time: string; size: string}>((resolve, reject) => {
		request(url, {method: 'HEAD'}, (res: IncomingMessage) => {
			if (res.statusCode !== 200) {
				reject(new Error(res.statusMessage));
			} else {
				resolve({
					time: (new Date(Date.parse(res.headers['last-modified']))).toISOString(),
					size: res.headers['content-length'] as string,
				});
			}
		}).end();
	});
}
