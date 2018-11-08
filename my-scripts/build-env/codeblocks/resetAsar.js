"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const constants_1 = require("../misc/constants");
const fsUtil_1 = require("../misc/fsUtil");
const pathUtil_1 = require("../misc/pathUtil");
async function reset_asar(output) {
    pathUtil_1.chdir(constants_1.VSCODE_ROOT);
    if (await fsUtil_1.isLinkSync('./node_modules')) {
        fs_1.unlinkSync('./node_modules');
    }
    if (await fsUtil_1.isExistsSync('./node_modules.asar')) {
        fs_1.unlinkSync('./node_modules.asar');
    }
    if (await fsUtil_1.isExistsSync('./node_modules.asar.unpacked')) {
        await fsUtil_1.removeDirectory('./node_modules.asar.unpacked', output);
    }
    if (output.hasOwnProperty('success')) {
        output.success('cleanup ASAR files.').continue();
    }
    else {
        output.write('cleanup ASAR files.\n');
    }
}
exports.reset_asar = reset_asar;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzZXRBc2FyLmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJidWlsZC1lbnYvY29kZWJsb2Nrcy9yZXNldEFzYXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSwyQkFBZ0M7QUFDaEMsaURBQWdEO0FBQ2hELDJDQUEyRTtBQUMzRSwrQ0FBeUM7QUFFbEMsS0FBSyxVQUFVLFVBQVUsQ0FBQyxNQUE2QjtJQUM3RCxnQkFBSyxDQUFDLHVCQUFXLENBQUMsQ0FBQztJQUNuQixJQUFJLE1BQU0sbUJBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFO1FBQ3ZDLGVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0tBQzdCO0lBQ0QsSUFBSSxNQUFNLHFCQUFZLENBQUMscUJBQXFCLENBQUMsRUFBRTtRQUM5QyxlQUFVLENBQUMscUJBQXFCLENBQUMsQ0FBQztLQUNsQztJQUNELElBQUksTUFBTSxxQkFBWSxDQUFDLDhCQUE4QixDQUFDLEVBQUU7UUFDdkQsTUFBTSx3QkFBZSxDQUFDLDhCQUE4QixFQUFFLE1BQU0sQ0FBQyxDQUFDO0tBQzlEO0lBQ0QsSUFBSSxNQUFNLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxFQUFFO1FBQ3BDLE1BQThCLENBQUMsT0FBTyxDQUFDLHFCQUFxQixDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7S0FDMUU7U0FBTTtRQUNOLE1BQU0sQ0FBQyxLQUFLLENBQUMsdUJBQXVCLENBQUMsQ0FBQztLQUN0QztBQUNGLENBQUM7QUFoQkQsZ0NBZ0JDIn0=