"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const constants_1 = require("./constants");
const fsUtil_1 = require("./fsUtil");
const help_1 = require("./help");
const streamUtil_1 = require("./streamUtil");
const timeUtil_1 = require("./timeUtil");
const disposeList = [];
function mainDispose(dispose) {
    disposeList.push(dispose);
}
exports.mainDispose = mainDispose;
let finalPromise = new Promise((resolve, reject) => {
    setImmediate(resolve);
});
function runMain(main) {
    if (help_1.WIT()) {
        return;
    }
    const p = finalPromise = finalPromise.then(main);
    p.then(() => {
        return 0;
    }, async (e) => {
        if (e.__programError) {
            console.error('\n\n\x1B[38;5;9mCommand Failed:\n\t%s\x1B[0m\n  Working Directory: %s\n  Program is:\n%s', e.message, e.__cwd, e.__program.replace(/^/mg, '    '));
        }
        else {
            console.error('\n\n\x1B[38;5;9mCommand Failed:\n\t%s\x1B[0m', e.stack);
        }
        return 1;
    }).then(async (quit) => {
        if (finalPromise !== p) {
            return;
        }
        while (disposeList.length) {
            await disposeList.shift()();
            await timeUtil_1.timeout(50); // give time to finish
        }
        process.exit(quit);
    }).catch((e) => {
        console.error(e);
        process.exit(1);
    });
}
exports.runMain = runMain;
function useWriteFileStream(file) {
    file = path_1.resolve(constants_1.RELEASE_ROOT, file);
    fsUtil_1.mkdirpSync(path_1.resolve(file, '..'));
    const fd = fs_1.openSync(file, 'w');
    fs_1.ftruncateSync(fd);
    const stream = fs_1.createWriteStream(file, { encoding: 'utf8', fd });
    mainDispose((error) => {
        stream.end();
        return streamUtil_1.streamPromise(stream);
    });
    return stream;
}
exports.useWriteFileStream = useWriteFileStream;
function readFileStream(file) {
    const fd = fs_1.openSync(file, 'r+');
    const stream = fs_1.createReadStream(file, { encoding: 'utf8', fd });
    mainDispose((error) => {
        stream.close();
        return streamUtil_1.streamPromise(stream);
    });
    return stream;
}
exports.readFileStream = readFileStream;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXlCdWlsZFN5c3RlbS5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsiYnVpbGQtZW52L21pc2MvbXlCdWlsZFN5c3RlbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDJCQUEyRztBQUMzRywrQkFBK0I7QUFDL0IsMkNBQTJDO0FBQzNDLHFDQUFzQztBQUN0QyxpQ0FBNkI7QUFDN0IsNkNBQTZDO0FBQzdDLHlDQUFxQztBQU1yQyxNQUFNLFdBQVcsR0FBc0IsRUFBRSxDQUFDO0FBRTFDLFNBQWdCLFdBQVcsQ0FBQyxPQUF3QjtJQUNuRCxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzNCLENBQUM7QUFGRCxrQ0FFQztBQUVELElBQUksWUFBWSxHQUFrQixJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtJQUNqRSxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDdkIsQ0FBQyxDQUFDLENBQUM7QUFFSCxTQUFnQixPQUFPLENBQUMsSUFBeUI7SUFDaEQsSUFBSSxVQUFHLEVBQUUsRUFBRTtRQUNWLE9BQU87S0FDUDtJQUNELE1BQU0sQ0FBQyxHQUFHLFlBQVksR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2pELENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFO1FBQ1gsT0FBTyxDQUFDLENBQUM7SUFDVixDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQ2QsSUFBSSxDQUFDLENBQUMsY0FBYyxFQUFFO1lBQ3JCLE9BQU8sQ0FBQyxLQUFLLENBQ1osMEZBQTBGLEVBQzFGLENBQUMsQ0FBQyxPQUFPLEVBQ1QsQ0FBQyxDQUFDLEtBQUssRUFDUCxDQUFDLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQ2xDLENBQUM7U0FDRjthQUFNO1lBQ04sT0FBTyxDQUFDLEtBQUssQ0FBQyw4Q0FBOEMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDdkU7UUFDRCxPQUFPLENBQUMsQ0FBQztJQUNWLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLEVBQUU7UUFDdEIsSUFBSSxZQUFZLEtBQUssQ0FBQyxFQUFFO1lBQ3ZCLE9BQU87U0FDUDtRQUNELE9BQU8sV0FBVyxDQUFDLE1BQU0sRUFBRTtZQUMxQixNQUFNLFdBQVcsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDO1lBQzVCLE1BQU0sa0JBQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLHNCQUFzQjtTQUN6QztRQUNELE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDcEIsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7UUFDZCxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2pCLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDakIsQ0FBQyxDQUFDLENBQUM7QUFDSixDQUFDO0FBaENELDBCQWdDQztBQUVELFNBQWdCLGtCQUFrQixDQUFDLElBQVk7SUFDOUMsSUFBSSxHQUFHLGNBQU8sQ0FBQyx3QkFBWSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ25DLG1CQUFVLENBQUMsY0FBTyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ2hDLE1BQU0sRUFBRSxHQUFHLGFBQVEsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDL0Isa0JBQWEsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNsQixNQUFNLE1BQU0sR0FBRyxzQkFBaUIsQ0FBQyxJQUFJLEVBQUUsRUFBQyxRQUFRLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBQyxDQUFDLENBQUM7SUFDL0QsV0FBVyxDQUFDLENBQUMsS0FBWSxFQUFFLEVBQUU7UUFDNUIsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ2IsT0FBTywwQkFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzlCLENBQUMsQ0FBQyxDQUFDO0lBQ0gsT0FBTyxNQUFNLENBQUM7QUFDZixDQUFDO0FBWEQsZ0RBV0M7QUFFRCxTQUFnQixjQUFjLENBQUMsSUFBSTtJQUNsQyxNQUFNLEVBQUUsR0FBRyxhQUFRLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ2hDLE1BQU0sTUFBTSxHQUFHLHFCQUFnQixDQUFDLElBQUksRUFBRSxFQUFDLFFBQVEsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFDLENBQUMsQ0FBQztJQUM5RCxXQUFXLENBQUMsQ0FBQyxLQUFZLEVBQUUsRUFBRTtRQUM1QixNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDZixPQUFPLDBCQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDOUIsQ0FBQyxDQUFDLENBQUM7SUFDSCxPQUFPLE1BQU0sQ0FBQztBQUNmLENBQUM7QUFSRCx3Q0FRQyJ9