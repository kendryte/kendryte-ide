"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const noDependency_1 = require("../build-env/childprocess/noDependency");
const constants_1 = require("../build-env/misc/constants");
const help_1 = require("../build-env/misc/help");
const myBuildSystem_1 = require("../build-env/misc/myBuildSystem");
const pathUtil_1 = require("../build-env/misc/pathUtil");
help_1.whatIsThis(__filename, 'install required thing for create release.');
myBuildSystem_1.runMain(async () => {
    pathUtil_1.chdir(constants_1.VSCODE_ROOT + '/my-scripts');
    noDependency_1.shellExec('yarn', 'install');
    noDependency_1.shellExec('tsc', '-p', '.');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlcGFyZS1yZWxlYXNlLmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJjb21tYW5kcy9wcmVwYXJlLXJlbGVhc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSx5RUFBbUU7QUFDbkUsMkRBQTBEO0FBQzFELGlEQUFvRDtBQUNwRCxtRUFBMEQ7QUFDMUQseURBQW1EO0FBRW5ELGlCQUFVLENBQUMsVUFBVSxFQUFFLDRDQUE0QyxDQUFDLENBQUM7QUFFckUsdUJBQU8sQ0FBQyxLQUFLLElBQUksRUFBRTtJQUNsQixnQkFBSyxDQUFDLHVCQUFXLEdBQUcsYUFBYSxDQUFDLENBQUM7SUFDbkMsd0JBQVMsQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDN0Isd0JBQVMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQzdCLENBQUMsQ0FBQyxDQUFDIn0=