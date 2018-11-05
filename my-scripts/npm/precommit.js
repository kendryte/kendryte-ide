"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const util_1 = require("util");
const childCommands_1 = require("../build-env/childCommands");
const include_1 = require("../build-env/include");
const readFile = util_1.promisify(fs_1.readFile);
const writeFile = util_1.promisify(fs_1.writeFile);
include_1.runMain(async () => {
    childCommands_1.chdir(include_1.VSCODE_ROOT);
    const packageFile = path_1.resolve(include_1.VSCODE_ROOT, 'package.json');
    const pkg = JSON.parse(await readFile(packageFile, 'utf8'));
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
    await writeFile(packageFile, content, 'utf8');
});
function pad(num) {
    if (num > 9) {
        return num.toFixed(0);
    }
    else {
        return '0' + num.toFixed(0);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlY29tbWl0LmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJucG0vcHJlY29tbWl0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMkJBQTRFO0FBQzVFLCtCQUErQjtBQUMvQiwrQkFBaUM7QUFDakMsOERBQW1EO0FBQ25ELGtEQUE0RDtBQUU1RCxNQUFNLFFBQVEsR0FBRyxnQkFBUyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQzFDLE1BQU0sU0FBUyxHQUFHLGdCQUFTLENBQUMsY0FBYyxDQUFDLENBQUM7QUFFNUMsaUJBQU8sQ0FBQyxLQUFLLElBQUksRUFBRTtJQUNsQixxQkFBSyxDQUFDLHFCQUFXLENBQUMsQ0FBQztJQUNuQixNQUFNLFdBQVcsR0FBRyxjQUFPLENBQUMscUJBQVcsRUFBRSxjQUFjLENBQUMsQ0FBQztJQUN6RCxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sUUFBUSxDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBRTVELE1BQU0sQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDO0lBQ25CLEdBQUcsQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7VUFDeEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUM7VUFDckIsR0FBRyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztVQUNoQixHQUFHO1VBQ0gsR0FBRyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztVQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDO1VBQ25CLEdBQUcsQ0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztJQUV6QyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO0lBQ2xELE9BQU8sR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsWUFBWSxHQUFHLEdBQUcsRUFBRSxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7SUFFMUUsT0FBTyxDQUFDLEdBQUcsQ0FBQywwQ0FBMEMsRUFBRSxHQUFHLENBQUMsWUFBWSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBQ3ZGLE1BQU0sU0FBUyxDQUFDLFdBQVcsRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDL0MsQ0FBQyxDQUFDLENBQUM7QUFFSCxTQUFTLEdBQUcsQ0FBQyxHQUFXO0lBQ3ZCLElBQUksR0FBRyxHQUFHLENBQUMsRUFBRTtRQUNaLE9BQU8sR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUN0QjtTQUFNO1FBQ04sT0FBTyxHQUFHLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUM1QjtBQUNGLENBQUMifQ==