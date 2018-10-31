"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const childCommands_1 = require("../build-env/childCommands");
const include_1 = require("../build-env/include");
include_1.thisIsABuildScript();
include_1.runMain(async () => {
    childCommands_1.chdir(process.env.VSCODE_ROOT + '/my-scripts');
    childCommands_1.shellMute('yarn', 'install');
    childCommands_1.shellExec('tsc', '-p', '.');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlcGFyZS1yZWxlYXNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsicHJlcGFyZS1yZWxlYXNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsOERBQXlFO0FBQ3pFLGtEQUFtRTtBQUVuRSw0QkFBa0IsRUFBRSxDQUFDO0FBRXJCLGlCQUFPLENBQUMsS0FBSyxJQUFJLEVBQUU7SUFDbEIscUJBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsR0FBRyxhQUFhLENBQUMsQ0FBQztJQUMvQyx5QkFBUyxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQztJQUM3Qix5QkFBUyxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDN0IsQ0FBQyxDQUFDLENBQUMifQ==