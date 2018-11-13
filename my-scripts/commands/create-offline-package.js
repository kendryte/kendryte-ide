"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const os_1 = require("os");
const path_1 = require("path");
const zip_1 = require("../build-env/codeblocks/zip");
const constants_1 = require("../build-env/misc/constants");
const help_1 = require("../build-env/misc/help");
const myBuildSystem_1 = require("../build-env/misc/myBuildSystem");
const pathUtil_1 = require("../build-env/misc/pathUtil");
const usePretty_1 = require("../build-env/misc/usePretty");
help_1.whatIsThis(__filename, 'zip files from ./data/packages to release dir.');
myBuildSystem_1.runMain(async () => {
    const output = usePretty_1.usePretty('create-offline-package');
    pathUtil_1.chdir(constants_1.VSCODE_ROOT);
    await zip_1.creatingUniversalZip(output, path_1.join('data', 'packages'), (type) => {
        return Promise.resolve(`${os_1.platform()}.offlinepackages.${type}`);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLW9mZmxpbmUtcGFja2FnZS5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsiY29tbWFuZHMvY3JlYXRlLW9mZmxpbmUtcGFja2FnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDJCQUE4QjtBQUM5QiwrQkFBNEI7QUFDNUIscURBQW1FO0FBQ25FLDJEQUEwRDtBQUMxRCxpREFBb0Q7QUFDcEQsbUVBQTBEO0FBQzFELHlEQUFtRDtBQUNuRCwyREFBd0Q7QUFFeEQsaUJBQVUsQ0FBQyxVQUFVLEVBQUUsZ0RBQWdELENBQUMsQ0FBQztBQUV6RSx1QkFBTyxDQUFDLEtBQUssSUFBSSxFQUFFO0lBQ2xCLE1BQU0sTUFBTSxHQUFHLHFCQUFTLENBQUMsd0JBQXdCLENBQUMsQ0FBQztJQUNuRCxnQkFBSyxDQUFDLHVCQUFXLENBQUMsQ0FBQztJQUNuQixNQUFNLDBCQUFvQixDQUFDLE1BQU0sRUFBRSxXQUFJLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxFQUFFLENBQUMsSUFBWSxFQUFFLEVBQUU7UUFDN0UsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsYUFBUSxFQUFFLG9CQUFvQixJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQ2pFLENBQUMsQ0FBQyxDQUFDO0FBQ0osQ0FBQyxDQUFDLENBQUMifQ==