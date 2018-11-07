"use strict";
/* No use any node_modules deps */
Object.defineProperty(exports, "__esModule", { value: true });
const stillalive_1 = require("@gongt/stillalive");
const fs_1 = require("fs");
const path_1 = require("path");
const globalOutput_1 = require("./globalOutput");
const disposeList = [];
function mainDispose(dispose) {
    disposeList.push(dispose);
}
exports.mainDispose = mainDispose;
let finalPromise = new Promise((resolve, reject) => {
    setImmediate(resolve);
});
function wit() {
    return process.argv.includes('--what-is-this');
}
function helpTip(cmd, msg) {
    console.log('\x1B[48;5;0;1m * \x1B[38;5;14m%s\x1B[0;48;5;0m - %s.', cmd, msg);
}
exports.helpTip = helpTip;
function whatIsThis(self, title) {
    if (wit()) {
        helpTip(path_1.basename(self, '.js'), title);
    }
}
exports.whatIsThis = whatIsThis;
function runMain(main) {
    if (wit()) {
        return;
    }
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
            console.error('\n\n\x1B[38;5;9mCommand Failed:\n\t%s\x1B[0m\n  Working Directory: %s\n  Program is:\n%s', e.message, e.__cwd, e.__program.replace(/^/mg, '    '));
        }
        else {
            console.error('\n\n\x1B[38;5;9mCommand Failed:\n\t%s\x1B[0m', e.stack);
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
globalOutput_1.useThisStream(process.stderr);
function usePretty(opts) {
    const stream = stillalive_1.startWorking();
    globalOutput_1.useThisStream(stream);
    Object.assign(stream, { noEnd: true });
    mainDispose((error) => {
        globalOutput_1.useThisStream(process.stderr);
        if (error) {
            stream.fail(error.message);
        }
        stream.end();
    });
    return stream;
}
exports.usePretty = usePretty;
function useWriteFileStream(file) {
    const fd = fs_1.openSync(file, 'w');
    fs_1.ftruncateSync(fd);
    const stream = fs_1.createWriteStream(file, { encoding: 'utf8', fd });
    mainDispose((error) => {
        stream.end();
        fs_1.closeSync(fd);
    });
    return stream;
}
exports.useWriteFileStream = useWriteFileStream;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXlCdWlsZFN5c3RlbS5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsiYnVpbGQtZW52L21pc2MvbXlCdWlsZFN5c3RlbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsa0NBQWtDOztBQUVsQyxrREFBaUY7QUFDakYsMkJBQXNIO0FBQ3RILCtCQUFnQztBQUNoQyxpREFBK0M7QUFNL0MsTUFBTSxXQUFXLEdBQXNCLEVBQUUsQ0FBQztBQUUxQyxTQUFnQixXQUFXLENBQUMsT0FBd0I7SUFDbkQsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUMzQixDQUFDO0FBRkQsa0NBRUM7QUFFRCxJQUFJLFlBQVksR0FBa0IsSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7SUFDakUsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3ZCLENBQUMsQ0FBQyxDQUFDO0FBRUgsU0FBUyxHQUFHO0lBQ1gsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBQ2hELENBQUM7QUFFRCxTQUFnQixPQUFPLENBQUMsR0FBVyxFQUFFLEdBQVc7SUFDL0MsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzREFBc0QsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDL0UsQ0FBQztBQUZELDBCQUVDO0FBRUQsU0FBZ0IsVUFBVSxDQUFDLElBQVksRUFBRSxLQUFhO0lBQ3JELElBQUksR0FBRyxFQUFFLEVBQUU7UUFDVixPQUFPLENBQUMsZUFBUSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztLQUN0QztBQUNGLENBQUM7QUFKRCxnQ0FJQztBQUVELFNBQWdCLE9BQU8sQ0FBQyxJQUF5QjtJQUNoRCxJQUFJLEdBQUcsRUFBRSxFQUFFO1FBQ1YsT0FBTztLQUNQO0lBQ0QsTUFBTSxDQUFDLEdBQUcsWUFBWSxHQUFHLFlBQVksQ0FBQyxJ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