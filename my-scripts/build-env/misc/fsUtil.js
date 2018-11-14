"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const util_1 = require("util");
const constants_1 = require("./constants");
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
exports.close = util_1.promisify(fs_1.close);
exports.rename = util_1.promisify(fs_1.rename);
exports.readlink = util_1.promisify(fs_1.readlink);
let productData;
async function calcCompileFolderName() {
    const product = await getProductData();
    return product.nameShort + (constants_1.isMac ? '.app' : '');
}
exports.calcCompileFolderName = calcCompileFolderName;
const cache = {};
function getProductData(alterRoot = constants_1.VSCODE_ROOT) {
    const productFile = path_1.resolve(alterRoot, 'product.json');
    if (cache[productFile]) {
        return cache[productFile];
    }
    try {
        const jsonData = fs_1.readFileSync(productFile, 'utf8');
        return cache[productFile] = JSON.parse(jsonData);
    }
    catch (e) {
        throw new Error(`Failed to load product.json: ${e.message}`);
    }
}
exports.getProductData = getProductData;
let packageData;
function getPackageData(alterRoot = constants_1.VSCODE_ROOT) {
    const packageFile = path_1.resolve(alterRoot, 'package.json');
    if (cache[packageFile]) {
        return cache[packageFile];
    }
    try {
        const jsonData = fs_1.readFileSync(packageFile, 'utf8');
        return cache[packageFile] = JSON.parse(jsonData);
    }
    catch (e) {
        throw new Error(`Failed to load package.json: ${e.message}`);
    }
}
exports.getPackageData = getPackageData;
async function removeIfExists(file) {
    if (await isExists(file)) {
        await fs_extra_1.remove(file);
    }
}
exports.removeIfExists = removeIfExists;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnNVdGlsLmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJidWlsZC1lbnYvbWlzYy9mc1V0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwyQkFlWTtBQUNaLHVDQUFrQztBQUNsQywrQkFBK0I7QUFDL0IsK0JBQWlDO0FBQ2pDLDJDQUFpRDtBQUVqRCxTQUFnQixVQUFVLENBQUMsQ0FBUztJQUNuQyxJQUFJLENBQUMsQ0FBQyxFQUFFO1FBQ1AsTUFBTSxJQUFJLEtBQUssQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO0tBQzlDO0lBQ0QsSUFBSSxDQUFDLGVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRTtRQUNuQixVQUFVLENBQUMsY0FBTyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQzdCLGNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNiO0FBQ0YsQ0FBQztBQVJELGdDQVFDO0FBRUQsU0FBZ0IsVUFBVSxDQUFDLElBQVk7SUFDdEMsSUFBSTtRQUNILE9BQU8sY0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDO0tBQ3hDO0lBQUMsT0FBTyxDQUFDLEVBQUU7S0FDWDtBQUNGLENBQUM7QUFMRCxnQ0FLQztBQUVNLEtBQUssVUFBVSxRQUFRLENBQUMsSUFBWTtJQUMxQyxPQUFPLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM1QixDQUFDO0FBRkQsNEJBRUM7QUFFRCxTQUFnQixZQUFZLENBQUMsSUFBWTtJQUN4QyxJQUFJO1FBQ0gsY0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2hCLE9BQU8sSUFBSSxDQUFDO0tBQ1o7SUFBQyxPQUFPLENBQUMsRUFBRTtRQUNYLE9BQU8sS0FBSyxDQUFDO0tBQ2I7QUFDRixDQUFDO0FBUEQsb0NBT0M7QUFFRCxTQUFnQixLQUFLLENBQUMsQ0FBUztJQUM5QixPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1B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