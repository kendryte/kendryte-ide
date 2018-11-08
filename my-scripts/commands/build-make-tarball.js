"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zip_1 = require("../build-env/codeblocks/zip");
const help_1 = require("../build-env/misc/help");
const myBuildSystem_1 = require("../build-env/misc/myBuildSystem");
const usePretty_1 = require("../build-env/misc/usePretty");
help_1.whatIsThis(__filename, 'Re-create zip files from current compiled result.');
myBuildSystem_1.runMain(async () => {
    const output = usePretty_1.usePretty('zip');
    await zip_1.creatingZip(output);
    output.success('Done.');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGQtbWFrZS10YXJiYWxsLmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJjb21tYW5kcy9idWlsZC1tYWtlLXRhcmJhbGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxREFBMEQ7QUFDMUQsaURBQW9EO0FBQ3BELG1FQUEwRDtBQUMxRCwyREFBd0Q7QUFFeEQsaUJBQVUsQ0FBQyxVQUFVLEVBQUUsbURBQW1ELENBQUMsQ0FBQztBQUU1RSx1QkFBTyxDQUFDLEtBQUssSUFBSSxFQUFFO0lBQ2xCLE1BQU0sTUFBTSxHQUFHLHFCQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDaEMsTUFBTSxpQkFBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzFCLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDekIsQ0FBQyxDQUFDLENBQUMifQ==