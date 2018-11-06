"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const rimraf = require("rimraf");
const util_1 = require("util");
const constants_1 = require("./constants");
const timeUtil_1 = require("./timeUtil");
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
function readFile(path) {
    return new Promise((resolve, reject) => {
        fs_1.readFile(path, 'utf8', (err, data) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(data);
            }
        });
    });
}
exports.readFile = readFile;
function writeFile(path, data) {
    return new Promise((resolve, reject) => {
        fs_1.writeFile(path, 'utf8', (err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
}
exports.writeFile = writeFile;
exports.unlink = util_1.promisify(fs_1.unlink);
exports.rmdir = util_1.promisify(fs_1.rmdir);
exports.open = util_1.promisify(fs_1.open);
exports.rename = util_1.promisify(fs_1.rename);
function wrapFs(of, output) {
    return ((...args) => {
        output.write(`${of.name}: ${args[0]}\n`);
        return of.apply(undefined, args);
    });
}
function removeDirectory(path, output) {
    output.write(`removing direcotry: ${path}...\n`);
    const p = new Promise((resolve, reject) => {
        const wrappedCallback = (err) => err ? reject(err) : resolve();
        rimraf(path, {
            maxBusyTries: 5,
            emfileWait: true,
            disableGlob: true,
            unlink: wrapFs(fs_1.unlink, output),
            rmdir: wrapFs(fs_1.rmdir, output),
        }, wrappedCallback);
    });
    if (constants_1.isWin) {
        return p.then(() => timeUtil_1.timeout(5000));
    }
    else {
        return p.then(() => timeUtil_1.timeout(500));
    }
}
exports.removeDirectory = removeDirectory;
let productData;
async function getProductData() {
    try {
        const productFile = path_1.resolve(constants_1.VSCODE_ROOT, 'product.json');
        const jsonData = await readFile(productFile);
        productData = JSON.parse(jsonData);
        return productData;
    }
    catch (e) {
        throw new Error(`Failed to load product.json: ${e.message}`);
    }
}
exports.getProductData = getProductData;
let packageData;
async function getPackageData() {
    try {
        const packageFile = path_1.resolve(constants_1.VSCODE_ROOT, 'package.json');
        const jsonData = await readFile(packageFile);
        packageData = JSON.parse(jsonData);
        return packageData;
    }
    catch (e) {
        throw new Error(`Failed to load package.json: ${e.message}`);
    }
}
exports.getPackageData = getPackageData;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnNVdGlsLmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJidWlsZC1lbnYvbWlzYy9mc1V0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwyQkFZWTtBQUNaLCtCQUErQjtBQUMvQixpQ0FBaUM7QUFFakMsK0JBQWlDO0FBQ2pDLDJDQUFpRDtBQUNqRCx5Q0FBcUM7QUFFckMsa0NBQWtDO0FBRWxDLFNBQWdCLFVBQVUsQ0FBQyxDQUFTO0lBQ25DLElBQUksQ0FBQyxDQUFDLEVBQUU7UUFDUCxNQUFNLElBQUksS0FBSyxDQUFDLDRCQUE0QixDQUFDLENBQUM7S0FDOUM7SUFDRCxJQUFJLENBQUMsZUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFO1FBQ25CLFVBQVUsQ0FBQyxjQUFPLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDN0IsY0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ2I7QUFDRixDQUFDO0FBUkQsZ0NBUUM7QUFFRCxTQUFnQixVQUFVLENBQUMsSUFBWTtJQUN0QyxJQUFJO1FBQ0gsT0FBTyxjQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7S0FDeEM7SUFBQyxPQUFPLENBQUMsRUFBRTtLQUNYO0FBQ0YsQ0FBQztBQUxELGdDQUtDO0FBRU0sS0FBSyxVQUFVLFFBQVEsQ0FBQyxJQUFZO0lBQzFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzVCLENBQUM7QUFGRCw0QkFFQztBQUVELFNBQWdCLFlBQVksQ0FBQyxJQUFZO0lBQ3hDLElBQUk7UUFDSCxjQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDaEIsT0FBTyxJQUFJLENBQUM7S0FDWjtJQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ1gsT0FBTyxLQUFLLENBQUM7S0FDYjtBQUNGLENBQUM7QUFQRCxvQ0FPQztBQUVELFNBQWdCLEtBQUssQ0FBQyxDQUFTO0lBQzlCLE9BQU8sSUFBSSxP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