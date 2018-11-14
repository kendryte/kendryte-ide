"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_render_1 = require("../build-env/index-render");
const awsUtil_1 = require("../build-env/misc/awsUtil");
const globalOutput_1 = require("../build-env/misc/globalOutput");
const help_1 = require("../build-env/misc/help");
const myBuildSystem_1 = require("../build-env/misc/myBuildSystem");
const usePretty_1 = require("../build-env/misc/usePretty");
help_1.whatIsThis(__filename, 'create download index file on aws.');
myBuildSystem_1.runMain(async () => {
    const output = usePretty_1.usePretty('create-download-index');
    await awsUtil_1.initS3(output);
    output.success('S3 init complete.');
    const indexData = await index_render_1.createIndexFileContent(output);
    globalOutput_1.globalLog('Upload index file: %s', awsUtil_1.OBJKEY_DOWNLOAD_INDEX);
    const upload = {
        stream: Buffer.from(indexData, 'utf8'),
        mime: 'text/html; charset=utf8',
    };
    await awsUtil_1.s3UploadStream(upload, awsUtil_1.OBJKEY_DOWNLOAD_INDEX);
    output.success('Done.');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLWRvd25sb2FkLWluZGV4LmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJjb21tYW5kcy9jcmVhdGUtZG93bmxvYWQtaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw0REFBbUU7QUFDbkUsdURBQTBGO0FBQzFGLGlFQUEyRDtBQUMzRCxpREFBb0Q7QUFDcEQsbUVBQTBEO0FBQzFELDJEQUF3RDtBQUV4RCxpQkFBVSxDQUFDLFVBQVUsRUFBRSxvQ0FBb0MsQ0FBQyxDQUFDO0FBRTdELHVCQUFPLENBQUMsS0FBSyxJQUFJLEVBQUU7SUFDbEIsTUFBTSxNQUFNLEdBQUcscUJBQVMsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0lBRWxELE1BQU0sZ0JBQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUVyQixNQUFNLENBQUMsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUM7SUFDcEMsTUFBTSxTQUFTLEdBQUcsTUFBTSxxQ0FBc0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUV2RCx3QkFBUyxDQUFDLHVCQUF1QixFQUFFLCtCQUFxQixDQUFDLENBQUM7SUFDMUQsTUFBTSxNQUFNLEdBQUc7UUFDZCxNQUFNLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDO1FBQ3RDLElBQUksRUFBRSx5QkFBeUI7S0FDL0IsQ0FBQztJQUNGLE1BQU0sd0JBQWMsQ0FBQyxNQUFNLEVBQUUsK0JBQXFCLENBQUMsQ0FBQztJQUVwRCxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3pCLENBQUMsQ0FBQyxDQUFDIn0=