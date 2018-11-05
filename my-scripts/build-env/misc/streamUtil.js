"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const stream_1 = require("stream");
const constants_1 = require("./constants");
const pathUtil_1 = require("./pathUtil");
class CollectingStream extends stream_1.Writable {
    constructor() {
        super(...arguments);
        this.buffer = '';
    }
    _write(chunk, encoding, callback) {
        if (!encoding) {
            encoding = 'utf8';
        }
        else if (encoding === 'buffer') {
            encoding = 'utf8';
        }
        this.buffer += chunk.toString(encoding);
        callback();
    }
    getOutput() {
        return this.buffer;
    }
}
exports.CollectingStream = CollectingStream;
class BlackHoleStream extends stream_1.Writable {
    _write(chunk, encoding, callback) {
        callback();
    }
}
exports.BlackHoleStream = BlackHoleStream;
function escapeRegExpCharacters(value) {
    return value.replace(/[\-\\\{\}\*\+\?\|\^\$\.\[\]\(\)\#]/g, '\\$&');
}
const winSep = /\\/g;
const posixSep = '/';
const SOURCE_ROOT = path_1.resolve(constants_1.VSCODE_ROOT, 'src').replace(winSep, posixSep);
const MODULES_ROOT1 = path_1.resolve(constants_1.VSCODE_ROOT, 'node_modules').replace(winSep, posixSep);
const MODULES_ROOT2 = path_1.resolve(pathUtil_1.yarnPackageDir('devDependencies'), 'node_modules').replace(winSep, posixSep);
const toReplaceRoot = new RegExp(escapeRegExpCharacters(SOURCE_ROOT), 'g');
const toReplaceModule1 = new RegExp(escapeRegExpCharacters(MODULES_ROOT1), 'g');
const toReplaceModule2 = new RegExp(escapeRegExpCharacters(MODULES_ROOT2), 'g');
const toReplaceStart = /Starting (?:\x1B\[[\d;]+m)?compilation/mg;
class TypescriptCompileOutputStream extends stream_1.Transform {
    constructor() {
        super(...arguments);
        this.passFirst = false;
    }
    _transform(buff, encoding, callback) {
        if (!encoding) {
            encoding = 'utf8';
        }
        else if (encoding === 'buffer') {
            encoding = 'utf8';
        }
        let str = buff.toString(encoding);
        str = str.replace(toReplaceStart, (m0) => {
            if (this.passFirst) {
                return '\r\x1Bc' + m0;
            }
            this.passFirst = true;
            return m0;
        });
        str = str.replace(toReplaceModule1, '[NM]');
        str = str.replace(toReplaceModule2, '[NM]');
        str = str.replace(toReplaceRoot, '.');
        this.push(str, encoding);
        callback();
    }
}
exports.TypescriptCompileOutputStream = TypescriptCompileOutputStream;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyZWFtVXRpbC5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsiYnVpbGQtZW52L21pc2Mvc3RyZWFtVXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLCtCQUErQjtBQUMvQixtQ0FBNkM7QUFDN0MsMkNBQTBDO0FBQzFDLHlDQUE0QztBQUU1QyxNQUFhLGdCQUFpQixTQUFRLGlCQUFRO0lBQTlDOztRQUNTLFdBQU0sR0FBRyxFQUFFLENBQUM7SUFlckIsQ0FBQztJQWJBLE1BQU0sQ0FBQyxLQUFhLEVBQUUsUUFBZ0IsRUFBRSxRQUFzQztRQUM3RSxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ2QsUUFBUSxHQUFHLE1BQU0sQ0FBQztTQUNsQjthQUFNLElBQUksUUFBUSxLQUFLLFFBQVEsRUFBRTtZQUNqQyxRQUFRLEdBQUcsTUFBTSxDQUFDO1NBQ2xCO1FBQ0QsSUFBSSxDQUFDLE1BQU0sSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3hDLFFBQVEsRUFBRSxDQUFDO0lBQ1osQ0FBQztJQUVELFNBQVM7UUFDUixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7SUFDcEIsQ0FBQztDQUNEO0FBaEJELDRDQWdCQztBQUVELE1BQWEsZUFBZ0IsU0FBUSxpQkFBUTtJQUM1QyxNQUFNLENBQUMsS0FBYSxFQUFFLFFBQWdCLEVBQUUsUUFBc0M7UUFDN0UsUUFBUSxFQUFFLENBQUM7SUFDWixDQUFDO0NBQ0Q7QUFKRCwwQ0FJQztBQUVELFNBQVMsc0JBQXNCLENBQUMsS0FBYTtJQUM1QyxPQUFPLEtBQUssQ0FBQyxPQUFPLENBQUMscUNBQXFDLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDckUsQ0FBQztBQUVELE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQztBQUNyQixNQUFNLFFBQVEsR0FBRyxHQUFHLENBQUM7QUFFckIsTUFBTSxXQUFXLEdBQUcsY0FBTyxDQUFDLHVCQUFXLEVBQUUsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztBQUMxRSxNQUFNLGFBQWEsR0FBRyxjQUFPLENBQUMsdUJBQVcsRUFBRSxjQUFjLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQ3JGLE1BQU0sYUFBYSxHQUFHLGNBQU8sQ0FBQyx5QkFBYyxDQUFDLGlCQUFpQixDQUFDLEVBQUUsY0FBYyxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztBQUUzRyxNQUFNLGFBQWEsR0FBRyxJQUFJLE1BQU0sQ0FBQyxzQkFBc0IsQ0FBQyxXQUFXLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUMzRSxNQUFNLGdCQUFnQixHQUFHLElBQUksTUFBTSxDQUFDLHNCQUFzQixDQUFDLGFBQWEsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ2hGLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxNQUFNLENBQUMsc0JBQXNCLENBQUMsYUFBYSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFFaEYsTUFBTSxjQUFjLEdBQUcsMENBQTBDLENBQUM7QUFFbEUsTUFBYSw2QkFBOEIsU0FBUSxrQkFBUztJQUE1RDs7UUFDUyxjQUFTLEdBQUcsS0FBSyxDQUFDO0lBc0IzQixDQUFDO0lBcEJBLFVBQVUsQ0FBQyxJQUFZLEVBQUUsUUFBZ0IsRUFBRSxRQUFrQjtRQUM1RCxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ2QsUUFBUSxHQUFHLE1BQU0sQ0FBQztTQUNsQjthQUFNLElBQUksUUFBUSxLQUFLLFFBQVEsRUFBRTtZQUNqQyxRQUFRLEdBQUcsTUFBTSxDQUFDO1NBQ2xCO1FBQ0QsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNsQyxHQUFHLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRTtZQUN4QyxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUU7Z0JBQ25CLE9BQU8sU0FBUyxHQUFHLEVBQUUsQ0FBQzthQUN0QjtZQUNELElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO1lBQ3RCLE9BQU8sRUFBRSxDQUFDO1FBQ1gsQ0FBQyxDQUFDLENBQUM7UUFDSCxHQUFHLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUM1QyxHQUFHLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUM1QyxHQUFHLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDdEMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDekIsUUFBUSxFQUFFLENBQUM7SUFDWixDQUFDO0NBQ0Q7QUF2QkQsc0VBdUJDIn0=