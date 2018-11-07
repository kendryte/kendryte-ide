"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const complex_1 = require("../../childprocess/complex");
const constants_1 = require("../../misc/constants");
const gulp_1 = require("../gulp");
async function macBuild(output) {
    await complex_1.pipeCommandOut(output, 'node', ...gulp_1.gulpCommands(), 'vscode-darwin-x64-min');
    const compiledResult = path_1.resolve(constants_1.RELEASE_ROOT, 'VSCode-darwin-x64');
    await fs_extra_1.copy('my-scripts/staff/skel/.', compiledResult);
    return compiledResult;
}
exports.macBuild = macBuild;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGQtbWFjLmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJidWlsZC1lbnYvY29kZWJsb2Nrcy9idWlsZC9idWlsZC1tYWMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSx1Q0FBZ0M7QUFDaEMsK0JBQStCO0FBQy9CLHdEQUE0RDtBQUM1RCxvREFBb0Q7QUFDcEQsa0NBQXVDO0FBRWhDLEtBQUssVUFBVSxRQUFRLENBQUMsTUFBMkI7SUFDekQsTUFBTSx3QkFBYyxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxtQkFBWSxFQUFFLEVBQUUsdUJBQXVCLENBQUMsQ0FBQztJQUVqRixNQUFNLGNBQWMsR0FBRyxjQUFPLENBQUMsd0JBQVksRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO0lBQ2xFLE1BQU0sZUFBSSxDQUFDLHlCQUF5QixFQUFFLGNBQWMsQ0FBQyxDQUFDO0lBRXRELE9BQU8sY0FBYyxDQUFDO0FBQ3ZCLENBQUM7QUFQRCw0QkFPQyJ9