"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const packWindows_1 = require("../build-env/codeblocks/packWindows");
const myBuildSystem_1 = require("../build-env/misc/myBuildSystem");
myBuildSystem_1.runMain(async () => {
    const output = myBuildSystem_1.usePretty();
    await packWindows_1.reset_asar(output);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlaW5zdGFsbC5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsibnBtL3ByZWluc3RhbGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxRUFBaUU7QUFDakUsbUVBQXFFO0FBRXJFLHVCQUFPLENBQUMsS0FBSyxJQUFJLEVBQUU7SUFDbEIsTUFBTSxNQUFNLEdBQUcseUJBQVMsRUFBRSxDQUFDO0lBQzNCLE1BQU0sd0JBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUMxQixDQUFDLENBQUMsQ0FBQyJ9