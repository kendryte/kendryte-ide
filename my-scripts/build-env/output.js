"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stillalive_1 = require("@gongt/stillalive");
const fs_1 = require("fs");
const rimraf = require("rimraf");
const stream_1 = require("stream");
const childCommands_1 = require("./childCommands");
const include_1 = require("./include");
function usePretty() {
    const stream = stillalive_1.startWorking();
    include_1.mainDispose((error) => {
        if (error) {
            stream.fail(error.message);
        }
        stream.end();
    });
    return stream;
}
exports.usePretty = usePretty;
async function installDependency(output, dir) {
    if (dir) {
        childCommands_1.chdir(dir);
    }
    const date = new Date;
    const tee = new stream_1.PassThrough();
    tee.pipe(output, { end: false });
    tee.pipe(fs_1.createWriteStream('yarn-install.log'));
    // shellExec('yarn', 'install');
    await childCommands_1.pipeCommandOut(tee, 'yarn', 'install', '--verbose');
    console.log(date.toISOString(), ' -> ', (new Date).toISOString());
    console.log((Date.now() - date.getTime()) / 1000);
    process.exit(123);
}
exports.installDependency = installDependency;
function wrapFs(of, output) {
    return ((...args) => {
        output.write(`${of.name}: ${args[0]}\n`);
        return of.apply(undefined, args);
    });
}
function removeDirecotry(path, output) {
    return new Promise((resolve, reject) => {
        const wrappedCallback = (err) => err ? reject(err) : resolve();
        rimraf(path, {
            maxBusyTries: 5,
            emfileWait: true,
            disableGlob: true,
            unlink: wrapFs(fs_1.unlink, output),
            rmdir: wrapFs(fs_1.rmdir, output),
        }, wrappedCallback);
    });
}
exports.removeDirecotry = removeDirecotry;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3V0cHV0LmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJidWlsZC1lbnYvb3V0cHV0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsa0RBQWdFO0FBQ2hFLDJCQUFzRDtBQUN0RCxpQ0FBaUM7QUFDakMsbUNBQStDO0FBQy9DLG1EQUF3RDtBQUN4RCx1Q0FBd0M7QUFFeEMsU0FBZ0IsU0FBUztJQUN4QixNQUFNLE1BQU0sR0FBRyx5QkFBWSxFQUFFLENBQUM7SUFDOUIscUJBQVcsQ0FBQyxDQUFDLEtBQVksRUFBRSxFQUFFO1FBQzVCLElBQUksS0FBSyxFQUFFO1lBQ1YsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDM0I7UUFDRCxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDZCxDQUFDLENBQUMsQ0FBQztJQUNILE9BQU8sTUFBTSxDQUFDO0FBQ2YsQ0FBQztBQVRELDhCQVNDO0FBRU0sS0FBSyxVQUFVLGlCQUFpQixDQUFDLE1BQWdCLEVBQUUsR0FBWTtJQUNyRSxJQUFJLEdBQUcsRUFBRTtRQUNSLHFCQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDWDtJQUVELE1BQU0sSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDO0lBQ3RCLE1BQU0sR0FBRyxHQUFHLElBQUksb0JBQVcsRUFBRSxDQUFDO0lBQzlCLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUMsR0FBRyxFQUFFLEtBQUssRUFBQyxDQUFDLENBQUM7SUFDL0IsR0FBRyxDQUFDLElBQUksQ0FBQyxzQkFBaUIsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7SUFFaEQsZ0NBQWdDO0lBQ2hDLE1BQU0sOEJBQWMsQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxXQUFXLENBQUMsQ0FBQztJQUUxRCxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRSxNQUFNLEVBQUUsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7SUFDbEUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUNsRCxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ25CLENBQUM7QUFoQkQsOENBZ0JDO0FBRUQsU0FBUyxNQUFNLENBQXFCLEVBQUssRUFBRSxNQUFnQjtJQUMxRCxPQUFPLENBQUMsQ0FBQyxHQUFHLElBQUksRUFBRSxFQUFFO1FBQ25CLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDekMsT0FBTyxFQUFFLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNsQyxDQUFDLENBQVEsQ0FBQztBQUNYLENBQUM7QUFFRCxTQUFnQixlQUFlLENBQUMsSUFBWSxFQUFFLE1BQWdCO0lBQzdELE9BQU8sSUFBSSxPQUFPLENBQU8sQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7UUFDNUMsTUFBTSxlQUFlLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQSxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUU5RCxNQUFNLENBQUMsSUFBSSxFQUFFO1lBQ1osWUFBWSxFQUFFLENBQUM7WUFDZixVQUFVLEVBQUUsSUFBSTtZQUNoQixXQUFXLEVBQUUsSUFBSTtZQUNqQixNQUFNLEVBQUUsTUFBTSxDQUFNLFdBQU0sRUFBRSxNQUFNLENBQUM7WUFDbkMsS0FBSyxFQUFFLE1BQU0sQ0FBTSxVQUFLLEVBQUUsTUFBTSxDQUFDO1NBQ2pDLEVBQUUsZUFBZSxDQUFDLENBQUM7SUFDckIsQ0FBQyxDQUFDLENBQUM7QUFDSixDQUFDO0FBWkQsMENBWUMifQ==