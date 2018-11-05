"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const noDependency_1 = require("../build-env/childprocess/noDependency");
const constants_1 = require("../build-env/misc/constants");
const fsUtil_1 = require("../build-env/misc/fsUtil");
const myBuildSystem_1 = require("../build-env/misc/myBuildSystem");
const pathUtil_1 = require("../build-env/misc/pathUtil");
myBuildSystem_1.runMain(async () => {
    pathUtil_1.chdir(constants_1.VSCODE_ROOT);
    const packageFile = path_1.resolve(constants_1.VSCODE_ROOT, 'package.json');
    const pkg = JSON.parse(await fsUtil_1.readFile(packageFile, 'utf8'));
    const d = new Date;
    pkg.patchVersion = d.getFullYear().toFixed(0)
        + pad(d.getMonth() + 1)
        + pad(d.getDate())
        + '.'
        + pad(d.getHours())
        + pad(d.getMinutes())
        + pad(d.getSeconds());
    let content = JSON.stringify(pkg, null, 2) + '\n';
    content = content.replace('"' + pkg.patchVersion + '"', pkg.patchVersion);
    console.log('writing version [%s] to package.json: %s', pkg.patchVersion, packageFile);
    await fsUtil_1.writeFile(packageFile, content, 'utf8');
    noDependency_1.shellExec('git', 'add', 'package.json');
});
function pad(num) {
    if (num > 9) {
        return num.toFixed(0);
    }
    else {
        return '0' + num.toFixed(0);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlY29tbWl0LmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJucG0vcHJlY29tbWl0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsK0JBQStCO0FBQy9CLHlFQUFtRTtBQUNuRSwyREFBMEQ7QUFDMUQscURBQStEO0FBQy9ELG1FQUEwRDtBQUMxRCx5REFBbUQ7QUFFbkQsdUJBQU8sQ0FBQyxLQUFLLElBQUksRUFBRTtJQUNsQixnQkFBSyxDQUFDLHVCQUFXLENBQUMsQ0FBQztJQUNuQixNQUFNLFdBQVcsR0FBRyxjQUFPLENBQUMsdUJBQVcsRUFBRSxjQUFjLENBQUMsQ0FBQztJQUN6RCxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0saUJBQVEsQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUU1RCxNQUFNLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQztJQUNuQixHQUFHLENBQUMsWUFBWSxHQUFHLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1VBQ3hCLEdBQUcsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1VBQ3JCLEdBQUcsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7VUFDaEIsR0FBRztVQUNILEdBQUcsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7VUFDakIsR0FBRyxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQztVQUNuQixHQUFHLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7SUFFekMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztJQUNsRCxPQUFPLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLFlBQVksR0FBRyxHQUFHLEVBQUUsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBRTFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsMENBQTBDLEVBQUUsR0FBRyxDQUFDLFlBQVksRUFBRSxXQUFXLENBQUMsQ0FBQztJQUN2RixNQUFNLGtCQUFTLENBQUMsV0FBVyxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztJQUU5Qyx3QkFBUyxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsY0FBYyxDQUFDLENBQUM7QUFDekMsQ0FBQyxDQUFDLENBQUM7QUFFSCxTQUFTLEdBQUcsQ0FBQyxHQUFXO0lBQ3ZCLElBQUksR0FBRyxHQUFHLENBQUMsRUFBRTtRQUNaLE9BQU8sR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUN0QjtTQUFNO1FBQ04sT0FBTyxHQUFHLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUM1QjtBQUNGLENBQUMifQ==