"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const rimraf_1 = require("rimraf");
if (fs_1.existsSync('./node_modules') && fs_1.lstatSync('./node_modules').isSymbolicLink()) {
    console.log('unlink node_modules');
    try {
        fs_1.unlinkSync('./node_modules');
    }
    catch (e) {
        console.error('Cannot remove node_modules maybe using?');
        console.error(e.message);
        process.exit(1);
    }
}
if (fs_1.existsSync('./node_modules.asar.unpacked') && fs_1.lstatSync('./node_modules.asar.unpacked').isDirectory()) {
    console.log('unlink node_modules.asar.unpacked');
    try {
        rimraf_1.sync('./node_modules.asar.unpacked');
    }
    catch (e) {
        console.error('Cannot remove node_modules.asar.unpacked maybe using?');
        console.error(e.message);
        process.exit(1);
    }
}
if (fs_1.existsSync('./node_modules.asar') && fs_1.lstatSync('./node_modules.asar').isFile()) {
    console.log('remove node_modules.asar');
    try {
        fs_1.unlinkSync('./node_modules.asar');
    }
    catch (e) {
        console.error('Cannot remove node_modules.asar maybe using?');
        console.error(e.message);
        process.exit(1);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlaW5zdGFsbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInByZWluc3RhbGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwyQkFBdUQ7QUFDdkQsbUNBQTRDO0FBRTVDLElBQUksZUFBVSxDQUFDLGdCQUFnQixDQUFDLElBQUksY0FBUyxDQUFDLGdCQUFnQixDQUFDLENBQUMsY0FBYyxFQUFFLEVBQUU7SUFDakYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0lBQ25DLElBQUk7UUFDSCxlQUFVLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztLQUM3QjtJQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ1gsT0FBTyxDQUFDLEtBQUssQ0FBQyx5Q0FBeUMsQ0FBQyxDQUFDO1FBQ3pELE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3pCLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDaEI7Q0FDRDtBQUNELElBQUksZUFBVSxDQUFDLDhCQUE4QixDQUFDLElBQUksY0FBUyxDQUFDLDhCQUE4QixDQUFDLENBQUMsV0FBVyxFQUFFLEVBQUU7SUFDMUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDO0lBQ2pELElBQUk7UUFDSCxhQUFVLENBQUMsOEJBQThCLENBQUMsQ0FBQztLQUMzQztJQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ1gsT0FBTyxDQUFDLEtBQUssQ0FBQyx1REFBdUQsQ0FBQyxDQUFDO1FBQ3ZFLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3pCLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDaEI7Q0FDRDtBQUVELElBQUksZUFBVSxDQUFDLHFCQUFxQixDQUFDLElBQUksY0FBUyxDQUFDLHFCQUFxQixDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUU7SUFDbkYsT0FBTyxDQUFDLEdBQUcsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0lBQ3hDLElBQUk7UUFDSCxlQUFVLENBQUMscUJBQXFCLENBQUMsQ0FBQztLQUNsQztJQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ1gsT0FBTyxDQUFDLEtBQUssQ0FBQyw4Q0FBOEMsQ0FBQyxDQUFDO1FBQzlELE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3pCLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDaEI7Q0FDRCJ9