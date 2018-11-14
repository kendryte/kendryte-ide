"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
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
${await createDownload(sfx)}
${await createDownload(zip)}`;
}
exports.createReleaseDownload = createReleaseDownload;
async function createUpdateDownload({ sfx, zip }) {
    return `<tr>
	<th colspan="3">
		<span class="en">Offline Dependency Packages</span>
		<span class="cn">离线依赖包</span>
	</th>
</tr>
${await createDownload(sfx)}
${await createDownload(zip)}`;
}
exports.createUpdateDownload = createUpdateDownload;
async function createDownload(url) {
    const { md5, size } = await getFileInfo(url);
    return `<tr>
	<td>
		<a class="en" href="${url}">Download</a>
		<a class="cn" href="${url}">下载</a>
	</td>
	<td>${path_1.extname(url)}</td>
	<td>${size}</td>
</tr>
<tr>
	<td colspan="3">${md5}</td>
</tr>`;
}
async function getFileInfo(url) {
    globalOutput_1.globalLog('Get hash-file of file: %s', url);
    const md5FileKey = url + '.md5';
    globalOutput_1.globalLog('Requesting file size: %s', url);
    const size = await getContentSize(awsUtil_1.bucketUrl(url)).catch(() => {
        return '';
    });
    if (!size) {
        return {
            md5: 'Temporary unavailable.',
            size: '???',
        };
    }
    let md5 = await awsUtil_1.s3LoadText(md5FileKey).catch(e => '');
    if (md5) {
        return {
            md5,
            size,
        };
    }
    globalOutput_1.globalLog('Downloading file: %s', url);
    const stream = awsUtil_1.s3DownloadStream(url);
    md5 = await hashUtil_1.hashStream(stream);
    globalOutput_1.globalLog('Upload md5-file: %s -> %s', md5, md5FileKey);
    await awsUtil_1.s3UploadStream({
        stream: Buffer.from(md5, 'utf8'),
        mime: 'text/plain',
    }, md5FileKey);
    return {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlRG93bmxvYWQuanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbImJ1aWxkLWVudi9pbmRleC1yZW5kZXIvY29tcG9uZW50cy9jcmVhdGVEb3dubG9hZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLCtCQUErQjtBQUMvQixnREFBNkY7QUFDN0YsMERBQW9EO0FBQ3BELGtEQUFpRDtBQUNqRCxrREFBOEM7QUFJdkMsS0FBSyxVQUFVLHFCQUFxQixDQUFDLEVBQUMsR0FBRyxFQUFFLEdBQUcsRUFBTztJQUMzRCxPQUFPOzs7OztFQUtOLE1BQU0sY0FBYyxDQUFDLEdBQUcsQ0FBQztFQUN6QixNQUFNLGNBQWMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO0FBQzlCLENBQUM7QUFSRCxzREFRQztBQUVNLEtBQUssVUFBVSxvQkFBb0IsQ0FBQyxFQUFDLEdBQUcsRUFBRSxHQUFHLEVBQU87SUFDMUQsT0FBTzs7Ozs7O0VBTU4sTUFBTSxjQUFjLENBQUMsR0FBRyxDQUFDO0VBQ3pCLE1BQU0sY0FBYyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7QUFDOUIsQ0FBQztBQVRELG9EQVNDO0FBRUQsS0FBSyxVQUFVLGNBQWMsQ0FBQyxHQUFXO0lBQ3hDLE1BQU0sRUFBQyxHQUFHLEVBQUUsSUFBSSxFQUFDLEdBQUcsTUFBTSxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDM0MsT0FBTzs7d0JBRWdCLEdBQUc7d0JBQ0gsR0FBRzs7T0FFcEIsY0FBTyxDQUFDLEdBQUcsQ0FBQztPQUNaLElBQUk7OzttQkFHUSxHQUFHO01BQ2hCLENBQUM7QUFDUCxDQUFDO0FBRUQsS0FBSyxVQUFVLFdBQVcsQ0FBQyxHQUFXO0lBQ3JDLHdCQUFTLENBQUMsMkJBQTJCLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDNUMsTUFBTSxVQUFVLEdBQUcsR0FBRyxHQUFHLE1BQU0sQ0FBQztJQUNoQyx3QkFBUyxDQUFDLDBCQUEwQixFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQzNDLE1BQU0sSUFBSSxHQUFHLE1BQU0sY0FBYyxDQUFDLG1CQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFO1FBQzVELE9BQU8sRUFBRSxDQUFDO0lBQ1gsQ0FBQyxDQUFDLENBQUM7SUFDSCxJQUFJLENBQUMsSUFBSSxFQUFFO1FBQ1YsT0FBTztZQUNOLEdBQUcsRUFBRSx3QkFBd0I7WUFDN0IsSUFBSSxFQUFFLEtBQUs7U0FDWCxDQUFDO0tBQ0Y7SUFFRCxJQUFJLEdBQUcsR0FBRyxNQUFNLG9CQUFVLENBQUMsVUFBVSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDdEQsSUFBSSxHQUFHLEVBQUU7UUFDUixPQUFPO1lBQ04sR0FBRztZQUNILElBQUk7U0FDSixDQUFDO0tBQ0Y7SUFFRCx3QkFBUyxDQUFDLHNCQUFzQixFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ3ZDLE1BQU0sTUFBTSxHQUFHLDBCQUFnQixDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3JDLEdBQUcsR0FBRyxNQUFNLHFCQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7SUFFL0Isd0JBQVMsQ0FBQywyQkFBMkIsRUFBRSxHQUFHLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDeEQsTUFBTSx3QkFBYyxDQUFDO1FBQ3BCLE1BQU0sRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUM7UUFDaEMsSUFBSSxFQUFFLFlBQVk7S0FDbEIsRUFBRSxVQUFVLENBQUMsQ0FBQztJQUVmLE9BQU87UUFDTixHQUFHO0tBQ0gsQ0FBQztBQUNILENBQUM7QUFFRCxTQUFTLGNBQWMsQ0FBQyxHQUFXO0lBQ2xDLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7UUFDdEMsa0JBQU8sQ0FBQyxHQUFHLEVBQUUsRUFBQyxNQUFNLEVBQUUsTUFBTSxFQUFDLEVBQUUsQ0FBQyxHQUFvQixFQUFFLEVBQUU7WUFDdkQsSUFBSSxHQUFHLENBQUMsVUFBVSxLQUFLLEdBQUcsRUFBRTtnQkFDM0IsTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO2FBQ3JDO2lCQUFNO2dCQUNOLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQzthQUN2QztRQUNGLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ1YsQ0FBQyxDQUFDLENBQUM7QUFDSixDQUFDIn0=