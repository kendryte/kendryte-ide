"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const platform_1 = require("../codeblocks/platform");
const zip_name_1 = require("../codeblocks/zip.name");
const awsUtil_1 = require("../misc/awsUtil");
const fsUtil_1 = require("../misc/fsUtil");
const card_1 = require("./components/card");
const createDownload_1 = require("./components/createDownload");
const head_1 = require("./components/head");
const not_supported_1 = require("./components/not-supported");
const wrapTable_1 = require("./components/wrapTable");
async function createIndexFileContent(output) {
    const pkg = fsUtil_1.getPackageData();
    const config = {
        versionString: `v${pkg.version} (${pkg.patchVersion})`,
        windows: {
            sfx: awsUtil_1.calcReleaseFileAwsKey(platform_1.PLATFORM_STR_WINDOWS, zip_name_1.TYPE_WINDOWS_SFX),
            zip: awsUtil_1.calcReleaseFileAwsKey(platform_1.PLATFORM_STR_WINDOWS, zip_name_1.TYPE_WINDOWS_ZIP),
        },
        windowsPackage: {
            sfx: awsUtil_1.calcPackageAwsKey(platform_1.PLATFORM_STR_WINDOWS, zip_name_1.TYPE_WINDOWS_SFX),
            zip: awsUtil_1.calcPackageAwsKey(platform_1.PLATFORM_STR_WINDOWS, zip_name_1.TYPE_WINDOWS_ZIP),
        },
        linux: {
            sfx: awsUtil_1.calcReleaseFileAwsKey(platform_1.PLATFORM_STR_LINUX, zip_name_1.TYPE_LINUX_SFX),
            zip: awsUtil_1.calcReleaseFileAwsKey(platform_1.PLATFORM_STR_LINUX, zip_name_1.TYPE_LINUX_ZIP),
        },
        linuxPackage: {
            sfx: awsUtil_1.calcPackageAwsKey(platform_1.PLATFORM_STR_LINUX, zip_name_1.TYPE_LINUX_SFX),
            zip: awsUtil_1.calcPackageAwsKey(platform_1.PLATFORM_STR_LINUX, zip_name_1.TYPE_LINUX_ZIP),
        },
        mac: {
            sfx: awsUtil_1.calcReleaseFileAwsKey(platform_1.PLATFORM_STR_MAC, zip_name_1.TYPE_MAC_SFX),
            zip: awsUtil_1.calcReleaseFileAwsKey(platform_1.PLATFORM_STR_MAC, zip_name_1.TYPE_MAC_ZIP),
        },
        macPackage: {
            sfx: awsUtil_1.calcPackageAwsKey(platform_1.PLATFORM_STR_MAC, zip_name_1.TYPE_MAC_SFX),
            zip: awsUtil_1.calcPackageAwsKey(platform_1.PLATFORM_STR_MAC, zip_name_1.TYPE_MAC_ZIP),
        },
    };
    output.log('generating index content...\n\nconfig = %j', config);
    const pieces = [
        '<!DOCTYPE html>',
        '<html>',
    ];
    output.log('download styles...');
    await head_1.buildHead(pieces);
    pieces.push(`<body class="en container">`);
    pieces.push(fs_1.readFileSync(path_1.resolve(__dirname, 'components/intro.html'), 'utf8'));
    pieces.push(not_supported_1.notSupportHtml());
    pieces.push('<div class="row">');
    output.log('calculating files...');
    pieces.push(card_1.createCard('Windows', config.versionString, wrapTable_1.wrapTable('application', await createDownload_1.createReleaseDownload(config.windows)), wrapTable_1.wrapTable('packages', await createDownload_1.createUpdateDownload(config.windowsPackage))), card_1.createCard('Linux', config.versionString, wrapTable_1.wrapTable('application', await createDownload_1.createReleaseDownload(config.linux)), wrapTable_1.wrapTable('packages', await createDownload_1.createUpdateDownload(config.linuxPackage))), card_1.createCard('Mac', config.versionString, wrapTable_1.wrapTable('application', await createDownload_1.createReleaseDownload(config.mac)), wrapTable_1.wrapTable('packages', await createDownload_1.createUpdateDownload(config.macPackage))));
    pieces.push('</div>');
    const scriptFile = path_1.resolve(__dirname, 'components/script.ts');
    const scriptData = require('typescript').transpile(fs_1.readFileSync(scriptFile, 'utf8'), {
        lib: ['esnext', 'dom'],
    });
    pieces.push(`<script type="text/javascript">${scriptData}</script>`);
    pieces.push('</body>');
    pieces.push('</html>');
    output.log('generated index content.');
    return pieces.join('\n');
}
exports.createIndexFileContent = createIndexFileContent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbImJ1aWxkLWVudi9pbmRleC1yZW5kZXIvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSwyQkFBa0M7QUFDbEMsK0JBQStCO0FBQy9CLHFEQUFvRztBQUNwRyxxREFBd0k7QUFDeEksNkNBQTJFO0FBQzNFLDJDQUFnRDtBQUNoRCw0Q0FBK0M7QUFDL0MsZ0VBQTBGO0FBQzFGLDRDQUE4QztBQUM5Qyw4REFBNEQ7QUFDNUQsc0RBQW1EO0FBRTVDLEtBQUssVUFBVSxzQkFBc0IsQ0FBQyxNQUEyQjtJQUN2RSxNQUFNLEdBQUcsR0FBRyx1QkFBYyxFQUFFLENBQUM7SUFDN0IsTUFBTSxNQUFNLEdBQUc7UUFDZCxhQUFhLEVBQUUsSUFBSSxHQUFHLENBQUMsT0FBTyxLQUFLLEdBQUcsQ0FBQyxZQUFZLEdBQUc7UUFDdEQsT0FBTyxFQUFFO1lBQ1IsR0FBRyxFQUFFLCtCQUFxQixDQUFDLCtCQUFvQixFQUFFLDJCQUFnQixDQUFDO1lBQ2xFLEdBQUcsRUFBRSwrQkFBcUIsQ0FBQywrQkFBb0IsRUFBRSwyQkFBZ0IsQ0FBQztTQUNsRTtRQUNELGNBQWMsRUFBRTtZQUNmLEdBQUcsRUFBRSwyQkFBaUIsQ0FBQywrQkFBb0IsRUFBRSwyQkFBZ0IsQ0FBQztZQUM5RCxHQUFHLEVBQUUsMkJBQWlCLENBQUMsK0JBQW9CLEVBQUUsMkJBQWdCLENBQUM7U0FDOUQ7UUFDRCxLQUFLLEVBQUU7WUFDTixHQUFHLEVBQUUsK0JBQXFCLENBQUMsNkJBQWtCLEVBQUUseUJBQWMsQ0FBQztZQUM5RCxHQUFHLEVBQUUsK0JBQXFCLENBQUMsNkJBQWtCLEVBQUUseUJBQWMsQ0FBQztTQUM5RDtRQUNELFlBQVksRUFBRTtZQUNiLEdBQUcsRUFBRSwyQkFBaUIsQ0FBQyw2QkFBa0IsRUFBRSx5QkFBYyxDQUFDO1lBQzFELEdBQUcsRUFBRSwyQkFBaUIsQ0FBQyw2QkFBa0IsRUFBRSx5QkFBYyxDQUFDO1NBQzFEO1FBQ0QsR0FBRyxFQUFFO1lBQ0osR0FBRyxFQUFFLCtCQUFxQixDQUFDLDJCQUFnQixFQUFFLHVCQUFZLENBQUM7WUFDMUQsR0FBRyxFQUFFLCtCQUFxQixDQUFDLDJCQUFnQixFQUFFLHVCQUFZLENBQUM7U0FDMUQ7UUFDRCxVQUFVLEVBQUU7WUFDWCxHQUFHLEVBQUUsMkJBQWlCLENBQUMsMkJBQWdCLEVBQUUsdUJBQVksQ0FBQztZQUN0RCxHQUFHLEVBQUUsMkJBQWlCLENBQUMsMkJBQWdCLEVBQUUsdUJBQVksQ0FBQztTQUN0RDtLQUNELENBQUM7SUFDRixNQUFNLENBQUMsR0FBRyxDQUFDLDRDQUE0QyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ2pFLE1BQU0sTUFBTSxHQUFhO1FBQ3hCLGlCQUFpQjtRQUNqQixRQUFRO0tBQ1IsQ0FBQztJQUVGLE1BQU0sQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsQ0FBQztJQUNqQyxNQUFNLGdCQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7SUFFeEIsTUFBTSxDQUFDLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO0lBQzNDLE1BQU0sQ0FBQyxJQUFJLENBQUMsaUJBQVksQ0FBQyxjQUFPLENBQUMsU0FBUyxFQUFFLHVCQUF1QixDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUMvRSxNQUFNLENBQUMsSUFBSSxDQUFDLDhCQUFjLEVBQUUsQ0FBQyxDQUFDO0lBQzlCLE1BQU0sQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztJQUVqQyxNQUFNLENBQUMsR0FBRyxDQUFDLHNCQUFzQixDQUFDLENBQUM7SUFDbkMsTUFBTSxDQUFDLElBQUksQ0FDVixpQkFBVSxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsYUFBYSxFQUN6QyxxQkFBUyxDQUFDLGFBQWEsRUFBRSxNQUFNLHNDQUFxQixDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUNyRSxxQkFBUyxDQUFDLFVBQVUsRUFBRSxNQUFNLHFDQUFvQixDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUN4RSxFQUNELGlCQUFVLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxhQUFhLEVBQ3ZDLHFCQUFTLENBQUMsYUFBYSxFQUFFLE1BQU0sc0NBQXFCLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQ25FLHFCQUFTLENBQUMsVUFBVSxFQUFFLE1BQU0scUNBQW9CLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQ3RFLEVBQ0QsaUJBQVUsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLGFBQWEsRUFDckMscUJBQVMsQ0FBQyxhQUFhLEVBQUUsTUFBTSxzQ0FBcUIsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsRUFDakUscUJBQVMsQ0FBQyxVQUFVLEVBQUUsTUFBTSxxQ0FBb0IsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FDcEUsQ0FDRCxDQUFDO0lBRUYsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUV0QixNQUFNLFVBQVUsR0FBRyxjQUFPLENBQUMsU0FBUyxFQUFFLHNCQUFzQixDQUFDLENBQUM7SUFDOUQsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDLFNBQVMsQ0FDakQsaUJBQVksQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDLEVBQ2hDO1FBQ0MsR0FBRyxFQUFFLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQztLQUN0QixDQUNELENBQUM7SUFDRixNQUFNLENBQUMsSUFBSSxDQUFDLGtDQUFrQyxVQUFVLFdBQVcsQ0FBQyxDQUFDO0lBRXJFLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDdkIsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUV2QixNQUFNLENBQUMsR0FBRyxDQUFDLDBCQUEwQixDQUFDLENBQUM7SUFDdkMsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzFCLENBQUM7QUEzRUQsd0RBMkVDIn0=