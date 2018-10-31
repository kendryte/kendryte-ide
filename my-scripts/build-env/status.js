"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const include_1 = require("./include");
const stringWidth_1 = require("../build-env/stringWidth");
let currentLine = '';
let currentLineWidth = 0;
let CurrentColumn;
const outputStream = process.stderr;
function resizeHandler() {
    CurrentColumn = include_1.winSize() || 42;
    schedulePrint();
}
function clearLine() {
    outputStream.write('\r\x1BK');
}
let timePrint;
function schedulePrint() {
    if (!timePrint) {
        timePrint = setTimeout(() => {
            timePrint = null;
            print();
        }, 50);
    }
}
async function cutStringWidth(original, to) {
    console.log('original = %s (%s)', original, stringWidth_1.stringWidth(original));
    let str = original;
    while (true) {
        const delta = stringWidth_1.stringWidth(str) - to;
        console.log('# delta = ', delta);
        if (delta === 0) {
            return str;
        }
        if (delta > 0) {
            console.log('# slice < %s => %s', delta, str.length - delta);
            str = original.slice(0, str.length - delta);
        }
        else if (delta < 0) {
            if (delta === -1) {
                const tmp = original.slice(0, str.length + 1);
                if (stringWidth_1.stringWidth(tmp) === to) {
                    return tmp;
                }
                else {
                    return str;
                }
            }
            console.log('# push  > %s => %s', Math.round(delta / 2), str.length - Math.round(delta / 2));
            str = original.slice(0, str.length - Math.round(delta / 2));
        }
        await new Promise((resolve, reject) => {
            setTimeout(resolve, 500);
        });
    }
}
exports.cutStringWidth = cutStringWidth;
function print() {
    // print some data to let displayCursor equals MIN( dataWidth, CurrentColumn )
    outputStream.write('\r\x1BK');
    if (currentLineWidth > CurrentColumn) {
        outputStream.write(cutStringWidth(currentLine, CurrentColumn - 3));
        outputStream.write('...');
    }
    else {
        outputStream.write(currentLine);
    }
    outputStream.write('\r');
}
let listening = false;
function stopListeners() {
    clearLine();
    process.removeListener('exit', clearLine);
    process.removeListener('SIGWINCH', resizeHandler);
    process.stderr.removeListener('resize', resizeHandler);
    process.stdout.removeListener('resize', resizeHandler);
}
function startListeners() {
    if (listening) {
        throw new Error('not support multiple progress');
    }
    listening = true;
    resizeHandler();
    process.on('SIGWINCH', resizeHandler);
    process.stderr.on('resize', resizeHandler);
    process.stdout.on('resize', resizeHandler);
    process.on('exit', clearLine);
}
const nl = Buffer.from('\n');
function handleStream(stream) {
    startListeners();
    stream.on('end', () => {
        stopListeners();
    });
    stream.on('data', (data) => {
        const lastLine = data.lastIndexOf(nl);
        if (lastLine === -1) {
            currentLine += data.toString('utf8');
        }
        else {
            currentLine = data.slice(lastLine).toString('utf8');
        }
        currentLineWidth = stringWidth_1.stringWidth(currentLine);
        schedulePrint();
    });
}
exports.handleStream = handleStream;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdHVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsic3RhdHVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsdUNBQW9DO0FBRXBDLDBEQUF1RDtBQUV2RCxJQUFJLFdBQVcsR0FBRyxFQUFFLENBQUM7QUFDckIsSUFBSSxnQkFBZ0IsR0FBRyxDQUFDLENBQUM7QUFDekIsSUFBSSxhQUFxQixDQUFDO0FBRTFCLE1BQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7QUFFcEMsU0FBUyxhQUFhO0lBQ3JCLGFBQWEsR0FBRyxpQkFBTyxFQUFFLElBQUksRUFBRSxDQUFDO0lBQ2hDLGFBQWEsRUFBRSxDQUFDO0FBQ2pCLENBQUM7QUFFRCxTQUFTLFNBQVM7SUFDakIsWUFBWSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUMvQixDQUFDO0FBRUQsSUFBSSxTQUF1QixDQUFDO0FBRTVCLFNBQVMsYUFBYTtJQUNyQixJQUFJLENBQUMsU0FBUyxFQUFFO1FBQ2YsU0FBUyxHQUFHLFVBQVUsQ0FBQyxHQUFHLEVBQUU7WUFDM0IsU0FBUyxHQUFHLElBQUksQ0FBQztZQUNqQixLQUFLLEVBQUUsQ0FBQztRQUNULENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztLQUNQO0FBQ0YsQ0FBQztBQUVNLEtBQUssVUFBVSxjQUFjLENBQUMsUUFBZ0IsRUFBRSxFQUFVO0lBQ2hFLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQW9CLEVBQUUsUUFBUSxFQUFFLHlCQUFXLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztJQUNuRSxJQUFJLEdBQUcsR0FBRyxRQUFRLENBQUM7SUFDbkIsT0FBTyxJQUFJLEVBQUU7UUFDWixNQUFNLEtBQUssR0FBRyx5QkFBVyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNwQyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNqQyxJQUFJLEtBQUssS0FBSyxDQUFD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