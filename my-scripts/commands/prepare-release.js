"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const childCommands_1 = require("../build-env/childCommands");
const include_1 = require("../build-env/include");
include_1.thisIsABuildScript();
include_1.runMain(async () => {
    childCommands_1.chdir(process.env.VSCODE_ROOT + '/my-scripts');
    childCommands_1.shellExec('yarn', 'install');
    childCommands_1.shellExec('tsc', '-p', '.');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlcGFyZS1yZWxlYXNlLmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJjb21tYW5kcy9wcmVwYXJlLXJlbGVhc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw4REFBOEQ7QUFDOUQsa0RBQW1FO0FBRW5FLDRCQUFrQixFQUFFLENBQUM7QUFFckIsaUJBQU8sQ0FBQyxLQUFLLElBQUksRUFBRTtJQUNsQixxQkFBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxHQUFHLGFBQWEsQ0FBQyxDQUFDO0lBQy9DLHlCQUFTLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQzdCLHlCQUFTLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztBQUM3QixDQUFDLENBQUMsQ0FBQyJ9