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
        fs_1.writeFile(path, data, 'utf8', (err) => {
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
function removeDirectory(path, output, verbose = true) {
    output.write(`removing directory: ${path}...\n`);
    let p = new Promise((resolve, reject) => {
        const wrappedCallback = (err) => err ? reject(err) : resolve();
        rimraf(path, {
            maxBusyTries: 5,
            emfileWait: true,
            disableGlob: true,
            unlink: verbose ? wrapFs(fs_1.unlink, output) : fs_1.unlink,
            rmdir: verbose ? wrapFs(fs_1.rmdir, output) : fs_1.rmdir,
        }, wrappedCallback);
    });
    p = p.then(() => {
        output.write(`remove complete. delay for OS.\n`);
    });
    if (constants_1.isWin) {
        p = p.then(() => timeUtil_1.timeout(5000));
    }
    else {
        p = p.then(() => timeUtil_1.timeout(500));
    }
    p = p.then(() => {
        output.write(`remove directory finish.\n`);
    });
    return p;
}
exports.removeDirectory = removeDirectory;
let productData;
async function calcCompileFolderName() {
    const product = await getProductData();
    return product.nameShort + (constants_1.isMac ? '.app' : '');
}
exports.calcCompileFolderName = calcCompileFolderName;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnNVdGlsLmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJidWlsZC1lbnYvbWlzYy9mc1V0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwyQkFZWTtBQUNaLCtCQUErQjtBQUMvQixpQ0FBaUM7QUFDakMsK0JBQWlDO0FBQ2pDLDJDQUF3RDtBQUN4RCx5Q0FBcUM7QUFFckMsa0NBQWtDO0FBRWxDLFNBQWdCLFVBQVUsQ0FBQyxDQUFTO0lBQ25DLElBQUksQ0FBQyxDQUFDLEVBQUU7UUFDUCxNQUFNLElBQUksS0FBSyxDQUFDLDRCQUE0QixDQUFDLENBQUM7S0FDOUM7SUFDRCxJQUFJLENBQUMsZUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFO1FBQ25CLFVBQVUsQ0FBQyxjQUFPLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDN0IsY0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ2I7QUFDRixDQUFDO0FBUkQsZ0NBUUM7QUFFRCxTQUFnQixVQUFVLENBQUMsSUFBWTtJQUN0QyxJQUFJO1FBQ0gsT0FBTyxjQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7S0FDeEM7SUFBQyxPQUFPLENBQUMsRUFBRTtLQUNYO0FBQ0YsQ0FBQztBQUxELGdDQUtDO0FBRU0sS0FBSyxVQUFVLFFBQVEsQ0FBQyxJQUFZO0lBQzFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzVCLENBQUM7QUFGRCw0QkFFQztBQUVELFNBQWdCLFlBQVksQ0FBQyxJQUFZO0lBQ3hDLElBQUk7UUFDSCxjQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDaEIsT0FBTyxJQUFJLENBQUM7S0FDWjtJQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ1gsT0FBTyxLQUFLLENBQUM7S0FDYjtBQUNGLENBQUM7QUFQRCxvQ0FPQztBQUVELFNBQWdCLEtBQUssQ0FBQyxDQUFTO0lBQzlCLE9BQU8sSUFBSSxP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