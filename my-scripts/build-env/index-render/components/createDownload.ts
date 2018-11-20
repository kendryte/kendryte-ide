import { IncomingMessage } from 'http';
import { extname } from 'path';
import { humanSize } from '../../codeblocks/humanSize';
import { s3BucketUrl, s3DownloadStream, s3LoadText, s3UploadBuffer } from '../../misc/awsUtil';
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
${await createDownload(sfx, 'btn-primary')}
${await createDownload(zip, 'btn-outline-primary')}`;
}

export async function createUpdateDownload({sfx, zip}: info) {
	return `<tr>
	<th colspan="3">
		<span class="en">Offline Dependency Packages</span>
		<span class="cn">离线依赖包</span>
	</th>
</tr>
${await createDownload(sfx, 'btn-primary')}
${await createDownload(zip, 'btn-outline-primary')}`;
}

async function createDownload(key: string, btnClass: string) {
	const {md5, size} = await getFileInfo(key);
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
</tr>`;
}

async function getFileInfo(key: string): Promise<{md5: string, size: string}> {
	globalLog('Get hash-file of file: %s', key);
	const md5FileKey = key + '.md5';
	globalLog('Requesting file size: %s', key);
	const size = await getContentSize(s3BucketUrl(key)).catch(() => {
		return '';
	});
	globalLog('    size: %s', size);
	if (!size) {
		globalLog('Temporary unavailable.');
		return {
			md5: 'Temporary unavailable.',
			size: '???',
		};
	}
	
	let md5 = await s3LoadText(md5FileKey).catch(e => '');
	globalLog('    md5: %s', md5);
	if (md5) {
		return {
			md5,
			size,
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
	};
}

function getContentSize(url: string) {
	return new Promise<string>((resolve, reject) => {
		request(url, {method: 'HEAD'}, (res: IncomingMessage) => {
			if (res.statusCode !== 200) {
				reject(new Error(res.statusMessage));
			} else {
				resolve(res.headers['content-length'] as string);
			}
		}).end();
	});
}
