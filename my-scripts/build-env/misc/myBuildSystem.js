"use strict";
/* No use any node_modules deps */
Object.defineProperty(exports, "__esModule", { value: true });
const stillalive_1 = require("@gongt/stillalive");
const fs_1 = require("fs");
const disposeList = [];
function mainDispose(dispose) {
    disposeList.push(dispose);
}
exports.mainDispose = mainDispose;
let finalPromise = new Promise((resolve, reject) => {
    setImmediate(resolve);
});
function runMain(main) {
    const p = finalPromise = finalPromise.then(main);
    p.then(() => {
        if (finalPromise !== p) {
            return;
        }
        disposeList.forEach((cb) => {
            cb();
        });
    }, (e) => {
        if (e.__programError) {
            console.error('\x1B[38;5;9mCommand Failed:\n\t%s\x1B[0m', e.message);
        }
        else {
            console.error('\x1B[38;5;9mCommand Failed:\n\t%s\x1B[0m', e.stack);
        }
        disposeList.forEach((cb) => {
            cb(e);
        });
    }).then(() => {
        if (finalPromise !== p) {
            return;
        }
        process.exit(0);
    }, () => {
        process.exit(1);
    });
}
exports.runMain = runMain;
function usePretty() {
    const stream = stillalive_1.startWorking();
    mainDispose((error) => {
        if (error) {
            stream.fail(error.message);
        }
        stream.end();
    });
    return stream;
}
exports.usePretty = usePretty;
function writeFileStream(file) {
    const fd = fs_1.openSync(file, 'w');
    fs_1.ftruncateSync(fd);
    const stream = fs_1.createWriteStream(file, { encoding: 'utf8', fd });
    mainDispose((error) => {
        stream.end();
        fs_1.closeSync(fd);
    });
    return stream;
}
exports.writeFileStream = writeFileStream;
function readFileStream(file) {
    const fd = fs_1.openSync(file, 'r+');
    const stream = fs_1.createReadStream(file, { encoding: 'utf8', fd });
    mainDispose((error) => {
        stream.close();
        fs_1.closeSync(fd);
    });
    return stream;
}
exports.readFileStream = readFileStream;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXlCdWlsZFN5c3RlbS5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsiYnVpbGQtZW52L21pc2MvbXlCdWlsZFN5c3RlbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsa0NBQWtDOztBQUVsQyxrREFBZ0U7QUFDaEUsMkJBQXNIO0FBTXRILE1BQU0sV0FBVyxHQUFzQixFQUFFLENBQUM7QUFFMUMsU0FBZ0IsV0FBVyxDQUFDLE9BQXdCO0lBQ25ELFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDM0IsQ0FBQztBQUZELGtDQUVDO0FBRUQsSUFBSSxZQUFZLEdBQWtCLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO0lBQ2pFLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUN2QixDQUFDLENBQUMsQ0FBQztBQUVILFNBQWdCLE9BQU8sQ0FBQyxJQUF5QjtJQUNoRCxNQUFNLENBQUMsR0FBRyxZQUFZLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNqRCxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRTtRQUNYLElBQUksWUFBWSxLQUFLLENBQUMsRUFBRTtZQUN2QixPQUFPO1NBQ1A7UUFDRCxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUU7WUFDMUIsRUFBRSxFQUFFLENBQUM7UUFDTixDQUFDLENBQUMsQ0FBQztJQUNKLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFO1FBQ1IsSUFBSSxDQUFDLENBQUMsY0FBYyxFQUFFO1lBQ3JCLE9BQU8sQ0FBQyxLQUFLLENBQUMsMENBQTBDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQ3JFO2FBQU07WUFDTixPQUFPLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUNuRTtRQUNELFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRTtZQUMxQixFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztJQUNKLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7UUFDWixJQUFJLFlBQVksS0FBSyxDQUFDLEVBQUU7WUFDdkIsT0FBTztTQUNQO1FBQ0QsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNqQixDQUFDLEVBQUUsR0FBRyxFQUFFO1FBQ1AsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNqQixDQUFDLENBQUMsQ0FBQztBQUNKLENBQUM7QUExQkQsMEJBMEJDO0FBRUQsU0FBZ0IsU0FBUztJQUN4QixNQUFNLE1BQU0sR0FBRyx5QkFBWSxFQUFFLENBQUM7SUFDOUIsV0FBVyxDQUFDLENBQUMsS0FBWSxFQUFFLEVBQUU7UUFDNUIsSUFBSSxLQUFLLEVBQUU7WUFDVixNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUMzQjtRQUNELE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUNkLENBQUMsQ0FBQyxDQUFDO0lBQ0gsT0FBTyxNQUFNLENBQUM7QUFDZixDQUFDO0FBVEQsOEJBU0M7QUFFRCxTQUFnQixlQUFlLENBQUMsSUFBSTtJQUNuQyxNQUFNLEVBQUUsR0FBRyxhQUFRLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQy9CLGtCQUFhLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDbEIsTUFBTSxNQUFNLEdBQUcsc0JBQWlCLENBQUMsSUFBSSxFQUFFLEVBQUMsUUFBUSxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUMsQ0FBQyxDQUFDO0lBQy9ELFdBQVcsQ0FBQyxDQUFDLEtBQVksRUFBRSxFQUFFO1FBQzVCLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNiLGNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNmLENBQUMsQ0FBQyxDQUFDO0lBQ0gsT0FBTyxNQUFNLENBQUM7QUFDZixDQUFDO0FBVEQsMENBU0M7QUFFRCxTQUFnQixjQUFjLENBQUMsSUFBSTtJQUNsQyxNQUFNLEVBQUUsR0FBRyxhQUFRLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ2hDLE1BQU0sTUFBTSxHQUFHLHFCQUFnQixDQUFDLElBQUksRUFBRSxFQUFDLFFBQVEsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFDLENBQUMsQ0FBQztJQUM5RCxXQUFXLENBQUMsQ0FBQyxLQUFZLEVBQUUsRUFBRTtRQUM1QixNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDZixjQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDZixDQUFDLENBQUMsQ0FBQztJQUNILE9BQU8sTUFBTSxDQUFDO0FBQ2YsQ0FBQztBQVJELHdDQVFDIn0=