"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
const simple_1 = require("../childprocess/simple");
const constants_1 = require("./constants");
function cleanScreen() {
    if (constants_1.isWin) {
        simple_1.shellExec('[System.Console]::Clear()');
        process.stdout.write('\x1Bc\r');
    }
    else {
        process.stdout.write('\x1Bc\r');
    }
}
exports.cleanScreen = cleanScreen;
const clearSequence = Buffer.from('\x1Bc');
class ClearScreenStream extends stream_1.Writable {
    _write(data, encoding, callback) {
        const hasClear = data.indexOf(clearSequence);
        if (hasClear === -1) {
            process.stdout.write(data, encoding, callback);
        }
        else {
            simple_1.shellExecAsync('[System.Console]::Clear()').catch().then(() => {
                process.stderr.write(data.slice(hasClear), encoding, callback);
            });
        }
    }
}
function getCleanableStdout() {
    if (constants_1.isWin && process.stdout.isTTY) {
        return new ClearScreenStream();
    }
    else {
        return process.stdout;
    }
}
exports.getCleanableStdout = getCleanableStdout;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xzVXRpbC5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsiYnVpbGQtZW52L21pc2MvY2xzVXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG1DQUFrQztBQUNsQyxtREFBbUU7QUFDbkUsMkNBQW9DO0FBRXBDLFNBQWdCLFdBQVc7SUFDMUIsSUFBSSxpQkFBSyxFQUFFO1FBQ1Ysa0JBQVMsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO1FBQ3ZDLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0tBQ2hDO1NBQU07UUFDTixPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztLQUNoQztBQUNGLENBQUM7QUFQRCxrQ0FPQztBQUVELE1BQU0sYUFBYSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7QUFFM0MsTUFBTSxpQkFBa0IsU0FBUSxpQkFBUTtJQUN2QyxNQUFNLENBQUMsSUFBWSxFQUFFLFFBQWdCLEVBQUUsUUFBNkI7UUFDbkUsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUM3QyxJQUFJLFFBQVEsS0FBSyxDQUFDLENBQUMsRUFBRTtZQUNwQixPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFXLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1NBQ3REO2FBQU07WUFDTix1QkFBYyxDQUFDLDJCQUEyQixDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRTtnQkFDN0QsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQVEsRUFBRSxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDdkUsQ0FBQyxDQUFDLENBQUM7U0FDSDtJQUNGLENBQUM7Q0FDRDtBQUVELFNBQWdCLGtCQUFrQjtJQUNqQyxJQUFJLGlCQUFLLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUU7UUFDbEMsT0FBTyxJQUFJLGlCQUFpQixFQUFFLENBQUM7S0FDL0I7U0FBTTtRQUNOLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQztLQUN0QjtBQUNGLENBQUM7QUFORCxnREFNQyJ9