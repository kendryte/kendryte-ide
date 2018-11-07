"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const constants_1 = require("./misc/constants");
const myBuildSystem_1 = require("./misc/myBuildSystem");
process.argv.push('--what-is-this');
const base = path_1.resolve(__dirname, '../commands');
fs_1.readdirSync(base).forEach((file) => {
    if (file.endsWith('.js')) {
        require(path_1.resolve(base, file));
    }
});
if (constants_1.isWin) {
    myBuildSystem_1.helpTip('fork', 'Open new window like this');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVscC5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsiYnVpbGQtZW52L2hlbHAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwyQkFBaUM7QUFDakMsK0JBQStCO0FBQy9CLGdEQUF5QztBQUN6Qyx3REFBK0M7QUFFL0MsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUVwQyxNQUFNLElBQUksR0FBRyxjQUFPLENBQUMsU0FBUyxFQUFFLGFBQWEsQ0FBQyxDQUFDO0FBQy9DLGdCQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUU7SUFDbEMsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFO1FBQ3pCLE9BQU8sQ0FBQyxjQUFPLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7S0FDN0I7QUFDRixDQUFDLENBQUMsQ0FBQztBQUNILElBQUksaUJBQUssRUFBRTtJQUNWLHVCQUFPLENBQUMsTUFBTSxFQUFFLDJCQUEyQixDQUFDLENBQUM7Q0FDN0MifQ==