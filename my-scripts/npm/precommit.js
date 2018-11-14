"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const simple_1 = require("../build-env/childprocess/simple");
const constants_1 = require("../build-env/misc/constants");
const fsUtil_1 = require("../build-env/misc/fsUtil");
const myBuildSystem_1 = require("../build-env/misc/myBuildSystem");
const pathUtil_1 = require("../build-env/misc/pathUtil");
myBuildSystem_1.runMain(async () => {
    pathUtil_1.chdir(constants_1.VSCODE_ROOT);
    const packageFile = path_1.resolve(constants_1.VSCODE_ROOT, 'package.json');
    const pkg = JSON.parse(await fsUtil_1.readFile(packageFile));
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
    await fsUtil_1.writeFile(packageFile, content);
    simple_1.shellExec('git', 'add', 'package.json');
});
function pad(num) {
    if (num > 9) {
        return num.toFixed(0);
    }
    else {
        return '0' + num.toFixed(0);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlY29tbWl0LmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJucG0vcHJlY29tbWl0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsK0JBQStCO0FBQy9CLDZEQUE2RDtBQUM3RCwyREFBMEQ7QUFDMUQscURBQStEO0FBQy9ELG1FQUEwRDtBQUMxRCx5REFBbUQ7QUFFbkQsdUJBQU8sQ0FBQyxLQUFLLElBQUksRUFBRTtJQUNsQixnQkFBSyxDQUFDLHVCQUFXLENBQUMsQ0FBQztJQUNuQixNQUFNLFdBQVcsR0FBRyxjQUFPLENBQUMsdUJBQVcsRUFBRSxjQUFjLENBQUMsQ0FBQztJQUN6RCxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0saUJBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO0lBRXBELE1BQU0sQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDO0lBQ25CLEdBQUcsQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7VUFDeEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUM7VUFDckIsR0FBRyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztVQUNoQixHQUFHO1VBQ0gsR0FBRyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztVQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDO1VBQ25CLEdBQUcsQ0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztJQUV6QyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO0lBQ2xELE9BQU8sR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsWUFBWSxHQUFHLEdBQUcsRUFBRSxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7SUFFMUUsT0FBTyxDQUFDLEdBQUcsQ0FBQywwQ0FBMEMsRUFBRSxHQUFHLENBQUMsWUFBWSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBQ3ZGLE1BQU0sa0JBQVMsQ0FBQyxXQUFXLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFFdEMsa0JBQVMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLGNBQWMsQ0FBQyxDQUFDO0FBQ3pDLENBQUMsQ0FBQyxDQUFDO0FBRUgsU0FBUyxHQUFHLENBQUMsR0FBVztJQUN2QixJQUFJLEdBQUcsR0FBRyxDQUFDLEVBQUU7UUFDWixPQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDdEI7U0FBTTtRQUNOLE9BQU8sR0FBRyxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDNUI7QUFDRixDQUFDIn0=