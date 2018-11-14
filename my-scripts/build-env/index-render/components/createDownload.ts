import { IncomingMessage } from 'http';
import { extname } from 'path';
import { bucketUrl, s3DownloadStream, s3LoadText, s3UploadStream } from '../../misc/awsUtil';
import { globalLog } from '../../misc/globalOutput';
import { hashStream } from '../../misc/hashUtil';
import { request } from '../../misc/httpUtil';

type info = {sfx: string, zip: string};

export async function createReleaseDownload({sfx, zip}: info) {
	return `<tr>
	<th colspan="3">
		<span>Kendryte IDE</span>
	</th>
</tr>
${await createDownload(sfx)}
${await createDownload(zip)}`;
}

export async function createUpdateDownload({sfx, zip}: info) {
	return `<tr>
	<th colspan="3">
		<span class="en">Offline Dependency Packages</span>
		<span class="cn">离线依赖包</span>
	</th>
</tr>
${await createDownload(sfx)}
${await createDownload(zip)}`;
}

async function createDownload(url: string) {
	const {md5, size} = await getFileInfo(url);
	return `<tr>
	<td>
		<a class="en" href="${url}">Download</a>
		<a class="cn" href="${url}">下载</a>
	</td>
	<td>${extname(url)}</td>
	<td>${size}</td>
</tr>
<tr>
	<td colspan="3">${md5}</td>
</tr>`;
}

async function getFileInfo(url: string) {
	globalLog('Get hash-file of file: %s', url);
	const md5FileKey = url + '.md5';
	globalLog('Requesting file size: %s', url);
	const size = await getContentSize(bucketUrl(url)).catch(() => {
		return '';
	});
	if (!size) {
		return {
			md5: 'Temporary unavailable.',
			size: '???',
		};
	}
	
	let md5 = await s3LoadText(md5FileKey).catch(e => '');
	if (md5) {
		return {
			md5,
			size,
		};
	}
	
	globalLog('Downloading file: %s', url);
	const stream = s3DownloadStream(url);
	md5 = await hashStream(stream);
	
	globalLog('Upload md5-file: %s -> %s', md5, md5FileKey);
	await s3UploadStream({
		stream: Buffer.from(md5, 'utf8'),
		mime: 'text/plain',
	}, md5FileKey);
	
	return {
		md5,
	};
}

function getContentSize(url: string) {
	return new Promise((resolve, reject) => {
		request(url, {method: 'HEAD'}, (res: IncomingMessage) => {
			if (res.statusCode !== 200) {
				reject(new Error(res.statusMessage));
			} else {
				resolve(res.headers['content-length']);
			}
		}).end();
	});
}
