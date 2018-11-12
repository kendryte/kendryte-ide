"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const rimraf = require("rimraf");
const constants_1 = require("../misc/constants");
const globalOutput_1 = require("../misc/globalOutput");
const timeUtil_1 = require("../misc/timeUtil");
function wrapFs(of, output) {
    if (output.hasOwnProperty('screen')) {
        output = output.screen;
    }
    return ((...args) => {
        output.write(`${of.name}: ${args[0]}\n`);
        return of.apply(undefined, args);
    });
}
function removeDirectory(path, output, verbose = true) {
    output.write(`removing directory: ${path}...\n`);
    let p = new Promise((resolve, reject) => {
        const wrappedCallback = (err) => err ? reject(err) : resolve();
        rimraf(path, {
            maxBusyTries: 5,
            emfileWait: true,
            disableGlob: true,
            unlink: wrapFs(fs_1.unlink, output),
            rmdir: wrapFs(fs_1.rmdir, output),
        }, wrappedCallback);
    });
    p = p.then(() => {
        output.write(`remove complete. delay for OS.\n`);
    });
    if (constants_1.isWin) {
        p = p.then(() => timeUtil_1.timeout(5000));
    }
    else {
        p = p.then(() => timeUtil_1.timeout(500));
    }
    p = p.then(() => {
        globalOutput_1.globalSuccessMessage(`remove directory finish.`);
    });
    return p;
}
exports.removeDirectory = removeDirectory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3ZlRGlyLmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJidWlsZC1lbnYvY29kZWJsb2Nrcy9yZW1vdmVEaXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwyQkFBeUc7QUFDekcsaUNBQWlDO0FBQ2pDLGlEQUEwQztBQUMxQyx1REFBNEQ7QUFDNUQsK0NBQTJDO0FBRTNDLFNBQVMsTUFBTSxDQUFDLEVBQVksRUFBRSxNQUE2QjtJQUMxRCxJQUFJLE1BQU0sQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLEVBQUU7UUFDcEMsTUFBTSxHQUFJLE1BQWMsQ0FBQyxNQUFNLENBQUM7S0FDaEM7SUFDRCxPQUFPLENBQUMsQ0FBQyxHQUFHLElBQUksRUFBRSxFQUFFO1FBQ25CLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDekMsT0FBTyxFQUFFLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNsQyxDQUFDLENBQVEsQ0FBQztBQUNYLENBQUM7QUFFRCxTQUFnQixlQUFlLENBQUMsSUFBWSxFQUFFLE1BQTZCLEVBQUUsT0FBTyxHQUFHLElBQUk7SUFDMUYsTUFBTSxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsSUFBSSxPQUFPLENBQUMsQ0FBQztJQUNqRCxJQUFJLENBQUMsR0FBRyxJQUFJLE9BQU8sQ0FBTyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtRQUM3QyxNQUFNLGVBQWUsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFBLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBRTlELE1BQU0sQ0FBQyxJQUFJLEVBQUU7WUFDWixZQUFZLEVBQUUsQ0FBQztZQUNmLFVBQVUsRUFBRSxJQUFJO1lBQ2hCLFdBQVcsRUFBRSxJQUFJO1lBQ2pCLE1BQU0sRUFBRSxNQUFNLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBdUI7WUFDekQsS0FBSyxFQUFFLE1BQU0sQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFzQjtTQUN0RCxFQUFFLGVBQWUsQ0FBQyxDQUFDO0lBQ3JCLENBQUMsQ0FBQyxDQUFDO0lBRUgsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFO1FBQ2YsTUFBTSxDQUFDLEtBQUssQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDO0lBQ2xELENBQUMsQ0FBQyxDQUFDO0lBRUgsSUFBSSxpQkFBSyxFQUFFO1FBQ1YsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsa0JBQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0tBQ2hDO1NBQU07UUFDTixDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxrQkFBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7S0FDL0I7SUFFRCxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7UUFDZixtQ0FBb0IsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0lBQ2xELENBQUMsQ0FBQyxDQUFDO0lBRUgsT0FBTyxDQUFDLENBQUM7QUFDVixDQUFDO0FBN0JELDBDQTZCQyJ9