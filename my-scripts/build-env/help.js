"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const constants_1 = require("./misc/constants");
const help_1 = require("./misc/help");
process.argv.push('--what-is-this');
const extract = /\bwhatIsThis\(.+\);/;
const base = path_1.resolve(__dirname, '../commands');
fs_1.readdirSync(base).forEach((file) => {
    if (!file.endsWith('.ts')) {
        return;
    }
    const content = fs_1.readFileSync(path_1.resolve(base, file), 'utf8');
    const match = extract.exec(content);
    if (!match) {
        return;
    }
    const fn = new Function('whatIsThis', '__filename', match[0]);
    try {
        fn(help_1.whatIsThis, file.replace(/\.ts$/, '.js'));
    }
    catch (e) {
        help_1.whatIsThis(file.replace(/\.ts$/, '.js'), e.message);
    }
});
if (constants_1.isWin) {
    help_1.helpTip('fork', 'Open new window like this');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVscC5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsiYnVpbGQtZW52L2hlbHAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwyQkFBK0M7QUFDL0MsK0JBQStCO0FBQy9CLGdEQUF5QztBQUN6QyxzQ0FBa0Q7QUFFbEQsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUVwQyxNQUFNLE9BQU8sR0FBRyxxQkFBcUIsQ0FBQztBQUV0QyxNQUFNLElBQUksR0FBRyxjQUFPLENBQUMsU0FBUyxFQUFFLGFBQWEsQ0FBQyxDQUFDO0FBQy9DLGdCQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUU7SUFDbEMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUU7UUFDMUIsT0FBTztLQUNQO0lBRUQsTUFBTSxPQUFPLEdBQUcsaUJBQVksQ0FBQyxjQUFPLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQzFELE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDcEMsSUFBSSxDQUFDLEtBQUssRUFBRTtRQUNYLE9BQU87S0FDUDtJQUVELE1BQU0sRUFBRSxHQUFHLElBQUksUUFBUSxDQUFDLFlBQVksRUFBRSxZQUFZLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDOUQsSUFBSTtRQUNILEVBQUUsQ0FBQyxpQkFBVSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7S0FDN0M7SUFBQyxPQUFPLENBQUMsRUFBRTtRQUNYLGlCQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQ3BEO0FBQ0YsQ0FBQyxDQUFDLENBQUM7QUFDSCxJQUFJLGlCQUFLLEVBQUU7SUFDVixjQUFPLENBQUMsTUFBTSxFQUFFLDJCQUEyQixDQUFDLENBQUM7Q0FDN0MifQ==