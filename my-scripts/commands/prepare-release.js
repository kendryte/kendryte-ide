"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const childCommands_1 = require("../build-env/childCommands");
const include_1 = require("../build-env/include");
include_1.runMain(async () => {
    process.chdir(process.env.VSCODE_ROOT + '/my-scripts');
    console.log(process.cwd());
    await childCommands_1.execCommand('yarn', 'install');
    await childCommands_1.execCommand('tsc', '-p', '.');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlcGFyZS1yZWxlYXNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsicHJlcGFyZS1yZWxlYXNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsOERBQXlEO0FBQ3pELGtEQUErQztBQUUvQyxpQkFBTyxDQUFDLEtBQUssSUFBSSxFQUFFO0lBQ2xCLE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEdBQUcsYUFBYSxDQUFDLENBQUM7SUFDdkQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztJQUMzQixNQUFNLDJCQUFXLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQ3JDLE1BQU0sMkJBQVcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ3JDLENBQUMsQ0FBQyxDQUFDIn0=