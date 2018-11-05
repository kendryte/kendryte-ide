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
    const tee = new stream_1.PassThrough();
    tee.pipe(output, { end: false });
    tee.pipe(fs_1.createWriteStream('yarn-install.log'));
    if (fs_1.existsSync('yarn-error.log')) {
        fs_1.unlinkSync('yarn-error.log');
    }
    tee.write(`Pwd: ${process.cwd()}\nCommand: yarn install --verbose\n`);
    await childCommands_1.pipeCommandOut(tee, 'yarn', 'install', '--verbose');
}
exports.installDependency = installDependency;
function timing() {
    const date = new Date;
    return function () {
        const t = (Date.now() - date.getTime()) / 1000;
        return ` (in ${t.toFixed(2)} sec)`;
    };
}
exports.timing = timing;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3V0cHV0LmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJidWlsZC1lbnYvb3V0cHV0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsa0RBQWdFO0FBQ2hFLDJCQUE4RTtBQUM5RSxpQ0FBaUM7QUFDakMsbUNBQStDO0FBQy9DLG1EQUF3RDtBQUN4RCx1Q0FBd0M7QUFFeEMsU0FBZ0IsU0FBUztJQUN4QixNQUFNLE1BQU0sR0FBRyx5QkFBWSxFQUFFLENBQUM7SUFDOUIscUJBQVcsQ0FBQyxDQUFDLEtBQVksRUFBRSxFQUFFO1FBQzVCLElBQUksS0FBSyxFQUFFO1lBQ1YsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDM0I7UUFDRCxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDZCxDQUFDLENBQUMsQ0FBQztJQUNILE9BQU8sTUFBTSxDQUFDO0FBQ2YsQ0FBQztBQVRELDhCQVNDO0FBRU0sS0FBSyxVQUFVLGlCQUFpQixDQUFDLE1BQWdCLEVBQUUsR0FBWTtJQUNyRSxJQUFJLEdBQUcsRUFBRTtRQUNSLHFCQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDWDtJQUVELE1BQU0sR0FBRyxHQUFHLElBQUksb0JBQVcsRUFBRSxDQUFDO0lBQzlCLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUMsR0FBRyxFQUFFLEtBQUssRUFBQyxDQUFDLENBQUM7SUFDL0IsR0FBRyxDQUFDLElBQUksQ0FBQyxzQkFBaUIsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7SUFFaEQsSUFBSSxlQUFVLENBQUMsZ0JBQWdCLENBQUMsRUFBRTtRQUNqQyxlQUFVLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztLQUM3QjtJQUNELEdBQUcsQ0FBQyxLQUFLLENBQUMsUUFBUSxPQUFPLENBQUMsR0FBRyxFQUFFLHFDQUFxQyxDQUFDLENBQUM7SUFDdEUsTUFBTSw4QkFBYyxDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLFdBQVcsQ0FBQyxDQUFDO0FBQzNELENBQUM7QUFkRCw4Q0FjQztBQUVELFNBQWdCLE1BQU07SUFDckIsTUFBTSxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUM7SUFFdEIsT0FBTztRQUNOLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQztRQUMvQyxPQUFPLFFBQVEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDO0lBQ3BDLENBQUMsQ0FBQztBQUNILENBQUM7QUFQRCx3QkFPQztBQUVELFNBQVMsTUFBTSxDQUFxQixFQUFLLEVBQUUsTUFBZ0I7SUFDMUQsT0FBTyxDQUFDLENBQUMsR0FBRyxJQUFJLEVBQUUsRUFBRTtRQUNuQixNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3pDLE9BQU8sRUFBRSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDbEMsQ0FBQyxDQUFRLENBQUM7QUFDWCxDQUFDO0FBRUQsU0FBZ0IsZUFBZSxDQUFDLElBQVksRUFBRSxNQUFnQjtJQUM3RCxPQUFPLElBQUksT0FBTyxDQUFPLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1FBQzVDLE1BQU0sZUFBZSxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUEsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7UUFFOUQsTUFBTSxDQUFDLElBQUksRUFBRTtZQUNaLFlBQVksRUFBRSxDQUFDO1lBQ2YsVUFBVSxFQUFFLElBQUk7WUFDaEIsV0FBVyxFQUFFLElBQUk7WUFDakIsTUFBTSxFQUFFLE1BQU0sQ0FBTSxXQUFNLEVBQUUsTUFBTSxDQUFDO1lBQ25DLEtBQUssRUFBRSxNQUFNLENBQU0sVUFBSyxFQUFFLE1BQU0sQ0FBQztTQUNqQyxFQUFFLGVBQWUsQ0FBQyxDQUFDO0lBQ3JCLENBQUMsQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQVpELDBDQVlDIn0=