"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zip_1 = require("../build-env/codeblocks/zip");
const help_1 = require("../build-env/misc/help");
const myBuildSystem_1 = require("../build-env/misc/myBuildSystem");
help_1.whatIsThis(__filename, 'Re-create zip files from current compiled result.');
myBuildSystem_1.runMain(async () => {
    await zip_1.creatingZip(process.stderr);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGQtbWFrZS10YXJiYWxsLmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJjb21tYW5kcy9idWlsZC1tYWtlLXRhcmJhbGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxREFBMEQ7QUFDMUQsaURBQW9EO0FBQ3BELG1FQUEwRDtBQUUxRCxpQkFBVSxDQUFDLFVBQVUsRUFBRSxtREFBbUQsQ0FBQyxDQUFDO0FBRTVFLHVCQUFPLENBQUMsS0FBSyxJQUFJLEVBQUU7SUFDbEIsTUFBTSxpQkFBVyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNuQyxDQUFDLENBQUMsQ0FBQyJ9