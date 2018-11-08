"use strict";
/* No use any node_modules deps */
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
    p.then(async () => {
        if (finalPromise !== p) {
            return;
        }
        while (disposeList.length) {
            await disposeList.shift()();
            await timeUtil_1.timeout(50); // give time to finish
        }
    }, async (e) => {
        if (e.__programError) {
            console.error('\n\n\x1B[38;5;9mCommand Failed:\n\t%s\x1B[0m\n  Working Directory: %s\n  Program is:\n%s', e.message, e.__cwd, e.__program.replace(/^/mg, '    '));
        }
        else {
            console.error('\n\n\x1B[38;5;9mCommand Failed:\n\t%s\x1B[0m', e.stack);
        }
        while (disposeList.length) {
            await disposeList.shift()();
            await timeUtil_1.timeout(50); // give time to finish
        }
    }).then((quit) => {
        if (finalPromise !== p) {
            return;
        }
        process.exit(0);
    }, (e) => {
        console.log(e);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXlCdWlsZFN5c3RlbS5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsiYnVpbGQtZW52L21pc2MvbXlCdWlsZFN5c3RlbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsa0NBQWtDOztBQUVsQywyQkFBMkc7QUFDM0csK0JBQStCO0FBQy9CLDJDQUEyQztBQUMzQyxxQ0FBc0M7QUFDdEMsaUNBQTZCO0FBQzdCLDZDQUE2QztBQUM3Qyx5Q0FBcUM7QUFNckMsTUFBTSxXQUFXLEdBQXNCLEVBQUUsQ0FBQztBQUUxQyxTQUFnQixXQUFXLENBQUMsT0FBd0I7SUFDbkQsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUMzQixDQUFDO0FBRkQsa0NBRUM7QUFFRCxJQUFJLFlBQVksR0FBa0IsSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7SUFDakUsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3ZCLENBQUMsQ0FBQyxDQUFDO0FBRUgsU0FBZ0IsT0FBTyxDQUFDLElBQXlCO0lBQ2hELElBQUksVUFBRyxFQUFFLEVBQUU7UUFDVixPQUFPO0tBQ1A7SUFDRCxNQUFNLENBQUMsR0FBRyxZQUFZLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNqRCxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssSUFBSSxFQUFFO1FBQ2pCLElBQUksWUFBWSxLQUFLLENBQUMsRUFBRTtZQUN2QixPQUFPO1NBQ1A7UUFDRCxPQUFPLFdBQVcsQ0FBQyxNQUFNLEVBQUU7WUFDMUIsTUFBTSxXQUFXLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQztZQUM1QixNQUFNLGtCQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxzQkFBc0I7U0FDekM7SUFDRixDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQ2QsSUFBSSxDQUFDLENBQUMsY0FBYyxFQUFFO1lBQ3JCLE9BQU8sQ0FBQyxLQUFLLENBQ1osMEZBQTBGLEVBQzFGLENBQUMsQ0FBQyxPQUFPLEVBQ1QsQ0FBQyxDQUFDLEtBQUssRUFDUCxDQUFDLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQ2xDLENBQUM7U0FDRjthQUFNO1lBQ04sT0FBTyxDQUFDLEtBQUssQ0FBQyw4Q0FBOEMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDdkU7UUFDRCxPQUFPLFdBQVcsQ0FBQyxNQUFNLEVBQUU7WUFDMUIsTUFBTSxXQUFXLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQztZQUM1QixNQUFNLGtCQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxzQkFBc0I7U0FDekM7SUFDRixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRTtRQUNoQixJQUFJLFlBQVksS0FBSyxDQUFDLEVBQUU7WUFDdkIsT0FBTztTQUNQO1FBQ0QsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNqQixDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRTtRQUNSLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDZixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2pCLENBQUMsQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQXJDRCwwQkFxQ0M7QUFFRCxTQUFnQixrQkFBa0IsQ0FBQyxJQUFZO0lBQzlDLElBQUksR0FBRyxjQUFPLENBQUMsd0JBQVksRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNuQyxtQkFBVSxDQUFDLGNBQU8sQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNoQyxNQUFNLEVBQUUsR0FBRyxhQUFRLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQy9CLGtCQUFhLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDbEIsTUFBTSxNQUFNLEdBQUcsc0JBQWlCLENBQUMsSUFBSSxFQUFFLEVBQUMsUUFBUSxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUMsQ0FBQyxDQUFDO0lBQy9ELFdBQVcsQ0FBQyxDQUFDLEtBQVksRUFBRSxFQUFFO1FBQzVCLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNiLE9BQU8sMEJBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUM5QixDQUFDLENBQUMsQ0FBQztJQUNILE9BQU8sTUFBTSxDQUFDO0FBQ2YsQ0FBQztBQVhELGdEQVdDO0FBRUQsU0FBZ0IsY0FBYyxDQUFDLElBQUk7SUFDbEMsTUFBTSxFQUFFLEdBQUcsYUFBUSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNoQyxNQUFNLE1BQU0sR0FBRyxxQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsRUFBQyxRQUFRLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBQyxDQUFDLENBQUM7SUFDOUQsV0FBVyxDQUFDLENBQUMsS0FBWSxFQUFFLEVBQUU7UUFDNUIsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ2YsT0FBTywwQkFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzlCLENBQUMsQ0FBQyxDQUFDO0lBQ0gsT0FBTyxNQUFNLENBQUM7QUFDZixDQUFDO0FBUkQsd0NBUUMifQ==