"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const constants_1 = require("../misc/constants");
const fsUtil_1 = require("../misc/fsUtil");
const pathUtil_1 = require("../misc/pathUtil");
const removeDir_1 = require("./removeDir");
async function reset_asar(output) {
    pathUtil_1.chdir(constants_1.VSCODE_ROOT);
    if (await fsUtil_1.isLinkSync('./node_modules')) {
        fs_1.unlinkSync('./node_modules');
    }
    if (await fsUtil_1.isExistsSync('./node_modules.asar')) {
        fs_1.unlinkSync('./node_modules.asar');
    }
    if (await fsUtil_1.isExistsSync('./node_modules.asar.unpacked')) {
        await removeDir_1.removeDirectory('./node_modules.asar.unpacked', output);
    }
    if (output.hasOwnProperty('success')) {
        output.success('cleanup ASAR files.').continue();
    }
    else {
        output.write('cleanup ASAR files.\n');
    }
}
exports.reset_asar = reset_asar;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzZXRBc2FyLmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJidWlsZC1lbnYvY29kZWJsb2Nrcy9yZXNldEFzYXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSwyQkFBZ0M7QUFDaEMsaURBQWdEO0FBQ2hELDJDQUEwRDtBQUMxRCwrQ0FBeUM7QUFDekMsMkNBQThDO0FBRXZDLEtBQUssVUFBVSxVQUFVLENBQUMsTUFBNkI7SUFDN0QsZ0JBQUssQ0FBQyx1QkFBVyxDQUFDLENBQUM7SUFDbkIsSUFBSSxNQUFNLG1CQUFVLENBQUMsZ0JBQWdCLENBQUMsRUFBRTtRQUN2QyxlQUFVLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztLQUM3QjtJQUNELElBQUksTUFBTSxxQkFBWSxDQUFDLHFCQUFxQixDQUFDLEVBQUU7UUFDOUMsZUFBVSxDQUFDLHFCQUFxQixDQUFDLENBQUM7S0FDbEM7SUFDRCxJQUFJLE1BQU0scUJBQVksQ0FBQyw4QkFBOEIsQ0FBQyxFQUFFO1FBQ3ZELE1BQU0sMkJBQWUsQ0FBQyw4QkFBOEIsRUFBRSxNQUFNLENBQUMsQ0FBQztLQUM5RDtJQUNELElBQUksTUFBTSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsRUFBRTtRQUNwQyxNQUE4QixDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO0tBQzFFO1NBQU07UUFDTixNQUFNLENBQUMsS0FBSyxDQUFDLHVCQUF1QixDQUFDLENBQUM7S0FDdEM7QUFDRixDQUFDO0FBaEJELGdDQWdCQyJ9