"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const rimraf = require("rimraf");
const util_1 = require("util");
/* No use any node_modules deps */
function mkdirpSync(p) {
    if (!p) {
        throw new Error('path must not empty string');
    }
    if (!fs_1.existsSync(p)) {
        mkdirpSync(path_1.resolve(p, '..'));
        fs_1.mkdirSync(p);
    }
}
exports.mkdirpSync = mkdirpSync;
function isLinkSync(path) {
    try {
        return fs_1.lstatSync(path).isSymbolicLink();
    }
    catch (e) {
    }
}
exports.isLinkSync = isLinkSync;
async function isExists(path) {
    return !!await lstat(path);
}
exports.isExists = isExists;
function isExistsSync(path) {
    try {
        fs_1.lstatSync(path);
        return true;
    }
    catch (e) {
        return false;
    }
}
exports.isExistsSync = isExistsSync;
function lstat(p) {
    return new Promise((resolve, reject) => {
        fs_1.lstat(p, (err, stats) => {
            if (err && err.code !== 'ENOENT') {
                return reject(err);
            }
            return resolve(stats);
        });
    });
}
exports.lstat = lstat;
exports.readFile = util_1.promisify(fs_1.readFile);
exports.writeFile = util_1.promisify(fs_1.writeFile);
exports.unlink = util_1.promisify(fs_1.unlink);
exports.rmdir = util_1.promisify(fs_1.rmdir);
exports.open = util_1.promisify(fs_1.open);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnNVdGlsLmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJidWlsZC1lbnYvbWlzYy9mc1V0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwyQkFXWTtBQUNaLCtCQUErQjtBQUMvQixpQ0FBaUM7QUFFakMsK0JBQWlDO0FBRWpDLGtDQUFrQztBQUVsQyxTQUFnQixVQUFVLENBQUMsQ0FBUztJQUNuQyxJQUFJLENBQUMsQ0FBQyxFQUFFO1FBQ1AsTUFBTSxJQUFJLEtBQUssQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO0tBQzlDO0lBQ0QsSUFBSSxDQUFDLGVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRTtRQUNuQixVQUFVLENBQUMsY0FBTyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQzdCLGNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNiO0FBQ0YsQ0FBQztBQVJELGdDQVFDO0FBRUQsU0FBZ0IsVUFBVSxDQUFDLElBQVk7SUFDdEMsSUFBSTtRQUNILE9BQU8sY0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDO0tBQ3hDO0lBQUMsT0FBTyxDQUFDLEVBQUU7S0FDWDtBQUNGLENBQUM7QUFMRCxnQ0FLQztBQUVNLEtBQUssVUFBVSxRQUFRLENBQUMsSUFBWTtJQUMxQyxPQUFPLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM1QixDQUFDO0FBRkQsNEJBRUM7QUFFRCxTQUFnQixZQUFZLENBQUMsSUFBWTtJQUN4QyxJQUFJO1FBQ0gsY0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2hCLE9BQU8sSUFBSSxDQUFDO0tBQ1o7SUFBQyxPQUFPLENBQUMsRUFBRTtRQUNYLE9BQU8sS0FBSyxDQUFDO0tBQ2I7QUFDRixDQUFDO0FBUEQsb0NBT0M7QUFFRCxTQUFnQixLQUFLLENBQUMsQ0FBUztJQUM5QixPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1FBQ3RDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLEVBQUU7WUFDNUIsSUFBSSxHQUFHLElBQUksR0FBRyxDQUFDLElBQUksS0FBSyxRQUFRLEVBQUU7Z0JBQ2pDLE9BQU8sTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ25CO1lBQ0QsT0FBTyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdkIsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQztBQUNKLENBQUM7QUFURCxzQkFTQztBQUVZLFFBQUEsUUFBUSxHQUFHLGdCQUFTLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDcEMsUUFBQSxTQUFTLEdBQUcsZ0JBQVMsQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUN0QyxRQUFBLE1BQU0sR0FBRyxnQkFBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ2hDLFFBQUEsS0FBSyxHQUFHLGdCQUFTLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDOUIsUUFBQSxJQUFJLEdBQUcsZ0JBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUV6QyxTQUFTLE1BQU0sQ0FBQyxFQUFZLEVBQUUsTUFBZ0I7SUFDN0MsT0FBTyxDQUFDLENBQUMsR0FBRyxJQUFJLEVBQUUsRUFBRTtRQUNuQixNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3pDLE9BQU8sRUFBRSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDbEMsQ0FBQyxDQUFRLENBQUM7QUFDWCxDQUFDO0FBRUQsU0FBZ0IsZUFBZSxDQUFDLElBQVksRUFBRSxNQUFnQjtJQUM3RCxPQUFPLElBQUksT0FBTyxDQUFPLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1FBQzVDLE1BQU0sZUFBZSxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUEsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7UUFFOUQsTUFBTSxDQUFDLElBQUksRUFBRTtZQUNaLFlBQVksRUFBRSxDQUFDO1lBQ2YsVUFBVSxFQUFFLElBQUk7WUFDaEIsV0FBVyxFQUFFLElBQUk7WUFDakIsTUFBTSxFQUFFLE1BQU0sQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUF1QjtZQUN6RCxLQUFLLEVBQUUsTUFBTSxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQXNCO1NBQ3RELEVBQUUsZUFBZSxDQUFDLENBQUM7SUFDckIsQ0FBQyxDQUFDLENBQUM7QUFDSixDQUFDO0FBWkQsMENBWUMifQ==