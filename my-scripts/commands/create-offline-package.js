"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const os_1 = require("os");
const path_1 = require("path");
const zip_1 = require("../build-env/codeblocks/zip");
const zip_name_1 = require("../build-env/codeblocks/zip.name");
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
        return zip_name_1.packageFileName(os_1.platform(), type);
    });
    output.success('Done. you may run upload-offline-package now.');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLW9mZmxpbmUtcGFja2FnZS5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsiY29tbWFuZHMvY3JlYXRlLW9mZmxpbmUtcGFja2FnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDJCQUE4QjtBQUM5QiwrQkFBNEI7QUFDNUIscURBQW1FO0FBQ25FLCtEQUFtRTtBQUNuRSwyREFBMEQ7QUFDMUQsaURBQW9EO0FBQ3BELG1FQUEwRDtBQUMxRCx5REFBbUQ7QUFDbkQsMkRBQXdEO0FBRXhELGlCQUFVLENBQUMsVUFBVSxFQUFFLGdEQUFnRCxDQUFDLENBQUM7QUFFekUsdUJBQU8sQ0FBQyxLQUFLLElBQUksRUFBRTtJQUNsQixNQUFNLE1BQU0sR0FBRyxxQkFBUyxDQUFDLHdCQUF3QixDQUFDLENBQUM7SUFDbkQsZ0JBQUssQ0FBQyx1QkFBVyxDQUFDLENBQUM7SUFDbkIsTUFBTSwwQkFBb0IsQ0FBQyxNQUFNLEVBQUUsV0FBSSxDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFO1FBQ3JFLE9BQU8sMEJBQWUsQ0FBQyxhQUFRLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUMxQyxDQUFDLENBQUMsQ0FBQztJQUVILE1BQU0sQ0FBQyxPQUFPLENBQUMsK0NBQStDLENBQUMsQ0FBQztBQUNqRSxDQUFDLENBQUMsQ0FBQyJ9