"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const rimraf = require("rimraf");
const util_1 = require("util");
const constants_1 = require("./constants");
const globalOutput_1 = require("./globalOutput");
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
    if (output.hasOwnProperty('screen')) {
        output = output.screen;
    }
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
            unlink: wrapFs(fs_1.unlink, output),
            rmdir: wrapFs(fs_1.rmdir, output),
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
        globalOutput_1.globalSuccessMessage(`remove directory finish.`);
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
async function getProductData(alterRoot = constants_1.VSCODE_ROOT) {
    try {
        const productFile = path_1.resolve(alterRoot, 'product.json');
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
async function getPackageData(alterRoot = constants_1.VSCODE_ROOT) {
    try {
        const packageFile = path_1.resolve(alterRoot, 'package.json');
        const jsonData = await readFile(packageFile);
        packageData = JSON.parse(jsonData);
        return packageData;
    }
    catch (e) {
        throw new Error(`Failed to load package.json: ${e.message}`);
    }
}
exports.getPackageData = getPackageData;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnNVdGlsLmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJidWlsZC1lbnYvbWlzYy9mc1V0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwyQkFZWTtBQUNaLCtCQUErQjtBQUMvQixpQ0FBaUM7QUFDakMsK0JBQWlDO0FBQ2pDLDJDQUF3RDtBQUN4RCxpREFBc0Q7QUFDdEQseUNBQXFDO0FBRXJDLGtDQUFrQztBQUVsQyxTQUFnQixVQUFVLENBQUMsQ0FBUztJQUNuQyxJQUFJLENBQUMsQ0FBQyxFQUFFO1FBQ1AsTUFBTSxJQUFJLEtBQUssQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO0tBQzlDO0lBQ0QsSUFBSSxDQUFDLGVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRTtRQUNuQixVQUFVLENBQUMsY0FBTyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQzdCLGNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNiO0FBQ0YsQ0FBQztBQVJELGdDQVFDO0FBRUQsU0FBZ0IsVUFBVSxDQUFDLElBQVk7SUFDdEMsSUFBSTtRQUNILE9BQU8sY0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDO0tBQ3hDO0lBQUMsT0FBTyxDQUFDLEVBQUU7S0FDWDtBQUNGLENBQUM7QUFMRCxnQ0FLQztBQUVNLEtBQUssVUFBVSxRQUFRLENBQUMsSUFBWTtJQUMxQyxPQUFPLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM1QixDQUFDO0FBRkQsNEJBRUM7QUFFRCxTQUFnQixZQUFZLENBQUMsSUFBWTtJQUN4QyxJQUFJO1FBQ0gsY0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2hCLE9BQU8sSUFBSSxDQUFDO0tBQ1o7SUFBQyxPQUFPLENBQUMsRUFBRTtRQUNYLE9BQU8sS0FBSyxDQUFDO0tBQ2I7QUFDRixDQUFDO0FBUEQsb0NBT0M7QUFFRCxTQUFnQixLQUFLLENBQUMsQ0FBUztJQUM5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