"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const humanSize_1 = require("../../codeblocks/humanSize");
const awsUtil_1 = require("../../misc/awsUtil");
const globalOutput_1 = require("../../misc/globalOutput");
const hashUtil_1 = require("../../misc/hashUtil");
const httpUtil_1 = require("../../misc/httpUtil");
async function createReleaseDownload({ sfx, zip }) {
    return `<tr>
	<th colspan="3">
		<span>Kendryte IDE</span>
	</th>
</tr>
${await createDownload(sfx, 'btn-outline-primary')}
${await createDownload(zip, 'btn-light')}`;
}
exports.createReleaseDownload = createReleaseDownload;
async function createUpdateDownload({ sfx, zip }) {
    return `<tr>
	<th colspan="3">
		<span class="en">Offline Dependency Packages</span>
		<span class="cn">离线依赖包</span>
	</th>
</tr>
${await createDownload(sfx, 'btn-outline-primary')}
${await createDownload(zip, 'btn-light')}`;
}
exports.createUpdateDownload = createUpdateDownload;
async function createDownload(key, btnClass) {
    const { md5, size } = await getFileInfo(key);
    const sizeStr = humanSize_1.humanSize(size);
    const url = awsUtil_1.bucketUrl(key);
    return `<tr>
	<td>
		<a class="en btn ${btnClass}" href="${url}">Download</a>
		<a class="cn btn ${btnClass}" href="${url}">下载</a>
	</td>
	<td>${path_1.extname(key)}</td>
	<td>${sizeStr}</td>
</tr>
<tr>
	<td colspan="3"><span class="badge badge-info">MD5:</span>&nbsp;${md5}</td>
</tr>`;
}
async function getFileInfo(key) {
    globalOutput_1.globalLog('Get hash-file of file: %s', key);
    const md5FileKey = key + '.md5';
    globalOutput_1.globalLog('Requesting file size: %s', key);
    const size = await getContentSize(awsUtil_1.bucketUrl(key)).catch(() => {
        return '';
    });
    globalOutput_1.globalLog('    size: %s', size);
    if (!size) {
        globalOutput_1.globalLog('Temporary unavailable.');
        return {
            md5: 'Temporary unavailable.',
            size: '???',
        };
    }
    let md5 = await awsUtil_1.s3LoadText(md5FileKey).catch(e => '');
    globalOutput_1.globalLog('    md5: %s', md5);
    if (md5) {
        return {
            md5,
            size,
        };
    }
    globalOutput_1.globalLog('Downloading file: %s', key);
    const stream = awsUtil_1.s3DownloadStream(key);
    md5 = await hashUtil_1.hashStream(stream);
    globalOutput_1.globalLog('    re-calc md5: %s', md5);
    globalOutput_1.globalLog('Upload md5-file: %s', md5);
    await awsUtil_1.s3UploadBuffer({
        stream: Buffer.from(md5, 'utf8'),
        mime: 'text/plain',
    }, md5FileKey);
    return {
        size,
        md5,
    };
}
function getContentSize(url) {
    return new Promise((resolve, reject) => {
        httpUtil_1.request(url, { method: 'HEAD' }, (res) => {
            if (res.statusCode !== 200) {
                reject(new Error(res.statusMessage));
            }
            else {
                resolve(res.headers['content-length']);
            }
        }).end();
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlRG93bmxvYWQuanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbImJ1aWxkLWVudi9pbmRleC1yZW5kZXIvY29tcG9uZW50cy9jcmVhdGVEb3dubG9hZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLCtCQUErQjtBQUMvQiwwREFBdUQ7QUFDdkQsZ0RBQTZGO0FBQzdGLDBEQUFvRDtBQUNwRCxrREFBaUQ7QUFDakQsa0RBQThDO0FBSXZDLEtBQUssVUFBVSxxQkFBcUIsQ0FBQyxFQUFDLEdBQUcsRUFBRSxHQUFHLEVBQU87SUFDM0QsT0FBTzs7Ozs7RUFLTixNQUFNLGNBQWMsQ0FBQyxHQUFHLEVBQUUscUJBQXFCLENBQUM7RUFDaEQsTUFBTSxjQUFjLENBQUMsR0FBRyxFQUFFLFdBQVcsQ0FBQyxFQUFFLENBQUM7QUFDM0MsQ0FBQztBQVJELHNEQVFDO0FBRU0sS0FBSyxVQUFVLG9CQUFvQixDQUFDLEVBQUMsR0FBRyxFQUFFLEdBQUcsRUFBTztJQUMxRCxPQUFPOzs7Ozs7RUFNTixNQUFNLGNBQWMsQ0FBQyxHQUFHLEVBQUUscUJBQXFCLENBQUM7RUFDaEQsTUFBTSxjQUFjLENBQUMsR0FBRyxFQUFFLFdBQVcsQ0FBQyxFQUFFLENBQUM7QUFDM0MsQ0FBQztBQVRELG9EQVNDO0FBRUQsS0FBSyxVQUFVLGNBQWMsQ0FBQyxHQUFXLEVBQUUsUUFBZ0I7SUFDMUQsTUFBTSxFQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUMsR0FBRyxNQUFNLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUMzQyxNQUFNLE9BQU8sR0FBRyxxQkFBUyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBRWhDLE1BQU0sR0FBRyxHQUFHLG1CQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDM0IsT0FBTzs7cUJBRWEsUUFBUSxXQUFXLEdBQUc7cUJBQ3RCLFFBQVEsV0FBVyxHQUFHOztPQUVwQyxjQUFPLENBQUMsR0FBRyxDQUFDO09BQ1osT0FBTzs7O21FQUdxRCxHQUFHO01BQ2hFLENBQUM7QUFDUCxDQUFDO0FBRUQsS0FBSyxVQUFVLFdBQVcsQ0FBQyxHQUFXO0lBQ3JDLHdCQUFTLENBQUMsMkJBQTJCLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDNUMsTUFBTSxVQUFVLEdBQUcsR0FBRyxHQUFHLE1BQU0sQ0FBQztJQUNoQyx3QkFBUyxDQUFDLDBCQUEwQixFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQzNDLE1BQU0sSUFBSSxHQUFHLE1BQU0sY0FBYyxDQUFDLG1CQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFO1FBQzVELE9BQU8sRUFBRSxDQUFDO0lBQ1gsQ0FBQyxDQUFDLENBQUM7SUFDSCx3QkFBUyxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNoQyxJQUFJLENBQUMsSUFBSSxFQUFFO1FBQ1Ysd0JBQVMsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO1FBQ3BDLE9BQU87WUFDTixHQUFHLEVBQUUsd0JBQXdCO1lBQzdCLElBQUksRUFBRSxLQUFLO1NBQ1gsQ0FBQztLQUNGO0lBRUQsSUFBSSxHQUFHLEdBQUcsTUFBTSxvQkFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3RELHdCQUFTLENBQUMsYUFBYSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQzlCLElBQUksR0FBRyxFQUFFO1FBQ1IsT0FBTztZQUNOLEdBQUc7WUFDSCxJQUFJO1NBQ0osQ0FBQztLQUNGO0lBRUQsd0JBQVMsQ0FBQyxzQkFBc0IsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUN2QyxNQUFNLE1BQU0sR0FBRywwQkFBZ0IsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNyQyxHQUFHLEdBQUcsTUFBTSxxQkFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQy9CLHdCQUFTLENBQUMscUJBQXFCLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFFdEMsd0JBQVMsQ0FBQyxxQkFBcUIsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUN0QyxNQUFNLHdCQUFjLENBQUM7UUFDcEIsTUFBTSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQztRQUNoQyxJQUFJLEVBQUUsWUFBWTtLQUNsQixFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBRWYsT0FBTztRQUNOLElBQUk7UUFDSixHQUFHO0tBQ0gsQ0FBQztBQUNILENBQUM7QUFFRCxTQUFTLGNBQWMsQ0FBQyxHQUFXO0lBQ2xDLE9BQU8sSUFBSSxPQUFPLENBQVMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7UUFDOUMsa0JBQU8sQ0FBQyxHQUFHLEVBQUUsRUFBQyxNQUFNLEVBQUUsTUFBTSxFQUFDLEVBQUUsQ0FBQyxHQUFvQixFQUFFLEVBQUU7WUFDdkQsSUFBSSxHQUFHLENBQUMsVUFBVSxLQUFLLEdBQUcsRUFBRTtnQkFDM0IsTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO2FBQ3JDO2lCQUFNO2dCQUNOLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFXLENBQUMsQ0FBQzthQUNqRDtRQUNGLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ1YsQ0FBQyxDQUFDLENBQUM7QUFDSixDQUFDIn0=