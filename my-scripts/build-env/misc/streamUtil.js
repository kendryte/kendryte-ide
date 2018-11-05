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
const MODULES_ROOT1 = path_1.resolve(constants_1.VSCODE_ROOT, 'node_modules');
const MODULES_ROOT2 = path_1.resolve(pathUtil_1.yarnPackageDir('devDependencies'), 'node_modules');
const toReplaceRoot = new RegExp(escapeRegExpCharacters(constants_1.VSCODE_ROOT.replace(winSep, posixSep)), 'g');
const toReplaceModule1 = new RegExp(escapeRegExpCharacters(MODULES_ROOT1.replace(winSep, posixSep)), 'g');
const toReplaceModule2 = new RegExp(escapeRegExpCharacters(MODULES_ROOT2.replace(winSep, posixSep)), 'g');
class TypescriptCompileOutputStream extends stream_1.Transform {
    _transform(buff, encoding, callback) {
        if (!encoding) {
            encoding = 'utf8';
        }
        else if (encoding === 'buffer') {
            encoding = 'utf8';
        }
        let str = buff.toString(encoding);
        str = str.replace(toReplaceRoot, '.');
        str = str.replace(toReplaceModule1, '[NM]');
        str = str.replace(toReplaceModule2, '[NM]');
        this.push(str, encoding);
        callback();
    }
}
exports.TypescriptCompileOutputStream = TypescriptCompileOutputStream;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyZWFtVXRpbC5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsiYnVpbGQtZW52L21pc2Mvc3RyZWFtVXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLCtCQUErQjtBQUMvQixtQ0FBNkM7QUFDN0MsMkNBQTBDO0FBQzFDLHlDQUE0QztBQUU1QyxNQUFhLGdCQUFpQixTQUFRLGlCQUFRO0lBQTlDOztRQUNTLFdBQU0sR0FBRyxFQUFFLENBQUM7SUFlckIsQ0FBQztJQWJBLE1BQU0sQ0FBQyxLQUFhLEVBQUUsUUFBZ0IsRUFBRSxRQUFzQztRQUM3RSxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ2QsUUFBUSxHQUFHLE1BQU0sQ0FBQztTQUNsQjthQUFNLElBQUksUUFBUSxLQUFLLFFBQVEsRUFBRTtZQUNqQyxRQUFRLEdBQUcsTUFBTSxDQUFDO1NBQ2xCO1FBQ0QsSUFBSSxDQUFDLE1BQU0sSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3hDLFFBQVEsRUFBRSxDQUFDO0lBQ1osQ0FBQztJQUVELFNBQVM7UUFDUixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7SUFDcEIsQ0FBQztDQUNEO0FBaEJELDRDQWdCQztBQUVELE1BQWEsZUFBZ0IsU0FBUSxpQkFBUTtJQUM1QyxNQUFNLENBQUMsS0FBYSxFQUFFLFFBQWdCLEVBQUUsUUFBc0M7UUFDN0UsUUFBUSxFQUFFLENBQUM7SUFDWixDQUFDO0NBQ0Q7QUFKRCwwQ0FJQztBQUVELFNBQVMsc0JBQXNCLENBQUMsS0FBYTtJQUM1QyxPQUFPLEtBQUssQ0FBQyxPQUFPLENBQUMscUNBQXFDLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDckUsQ0FBQztBQUVELE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQztBQUNyQixNQUFNLFFBQVEsR0FBRyxHQUFHLENBQUM7QUFFckIsTUFBTSxhQUFhLEdBQUcsY0FBTyxDQUFDLHVCQUFXLEVBQUUsY0FBYyxDQUFDLENBQUM7QUFDM0QsTUFBTSxhQUFhLEdBQUcsY0FBTyxDQUFDLHlCQUFjLENBQUMsaUJBQWlCLENBQUMsRUFBRSxjQUFjLENBQUMsQ0FBQztBQUNqRixNQUFNLGFBQWEsR0FBRyxJQUFJLE1BQU0sQ0FBQyxzQkFBc0IsQ0FBQyx1QkFBVyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUNyRyxNQUFNLGdCQUFnQixHQUFHLElBQUksTUFBTSxDQUFDLHNCQUFzQixDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDMUcsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLE1BQU0sQ0FBQyxzQkFBc0IsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBRTFHLE1BQWEsNkJBQThCLFNBQVEsa0JBQVM7SUFDM0QsVUFBVSxDQUFDLElBQVksRUFBRSxRQUFnQixFQUFFLFFBQWtCO1FBQzVELElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDZCxRQUFRLEdBQUcsTUFBTSxDQUFDO1NBQ2xCO2FBQU0sSUFBSSxRQUFRLEtBQUssUUFBUSxFQUFFO1lBQ2pDLFFBQVEsR0FBRyxNQUFNLENBQUM7U0FDbEI7UUFDRCxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2xDLEdBQUcsR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUN0QyxHQUFHLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUM1QyxHQUFHLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUM1QyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUN6QixRQUFRLEVBQUUsQ0FBQztJQUNaLENBQUM7Q0FDRDtBQWRELHNFQWNDIn0=