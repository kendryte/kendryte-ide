"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const util_1 = require("util");
const constants_1 = require("./constants");
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
exports.readlink = util_1.promisify(fs_1.readlink);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnNVdGlsLmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJidWlsZC1lbnYvbWlzYy9mc1V0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwyQkFhWTtBQUNaLCtCQUErQjtBQUMvQiwrQkFBaUM7QUFDakMsMkNBQWlEO0FBRWpELGtDQUFrQztBQUVsQyxTQUFnQixVQUFVLENBQUMsQ0FBUztJQUNuQyxJQUFJLENBQUMsQ0FBQyxFQUFFO1FBQ1AsTUFBTSxJQUFJLEtBQUssQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO0tBQzlDO0lBQ0QsSUFBSSxDQUFDLGVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRTtRQUNuQixVQUFVLENBQUMsY0FBTyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQzdCLGNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNiO0FBQ0YsQ0FBQztBQVJELGdDQVFDO0FBRUQsU0FBZ0IsVUFBVSxDQUFDLElBQVk7SUFDdEMsSUFBSTtRQUNILE9BQU8sY0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDO0tBQ3hDO0lBQUMsT0FBTyxDQUFDLEVBQUU7S0FDWDtBQUNGLENBQUM7QUFMRCxnQ0FLQztBQUVNLEtBQUssVUFBVSxRQUFRLENBQUMsSUFBWTtJQUMxQyxPQUFPLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM1QixDQUFDO0FBRkQsNEJBRUM7QUFFRCxTQUFnQixZQUFZLENBQUMsSUFBWTtJQUN4QyxJQUFJO1FBQ0gsY0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2hCLE9BQU8sSUFBSSxDQUFDO0tBQ1o7SUFBQyxPQUFPLENBQUMsRUFBRTtRQUNYLE9BQU8sS0FBSyxDQUFDO0tBQ2I7QUFDRixDQUFDO0FBUEQsb0NBT0M7QUFFRCxTQUFnQixLQUFLLENBQUMsQ0FBUztJQUM5QixPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1FBQ3RDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLEVBQUU7WUFDNUIsSUFBSSxHQUFHLElBQUksR0FBRyxDQUFDLElBQUksS0FBSyxRQUFRLEVBQUU7Z0JBQ2pDLE9BQU8sTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ25CO1lBQ0QsT0FBTyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdkIsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQztBQUNKLENBQUM7QUFURCxzQkFTQztBQUVELFNBQWdCLFFBQVEsQ0FBQyxJQUFZO0lBQ3BDLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7UUFDdEMsYUFBYSxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQUU7WUFDekMsSUFBSSxHQUFHLEVBQUU7Z0JBQ1IsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ1o7aUJBQU07Z0JBQ04sT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ2Q7UUFDRixDQUFDLENBQUMsQ0FBQztJQUNKLENBQUMsQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQVZELDRCQVVDO0FBRUQsU0FBZ0IsU0FBUyxDQUFDLElBQVksRUFBRSxJQUFtQjtJQUMxRCxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1FBQ3RDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFO1lBQzFDLElBQUksR0FBRyxFQUFFO2dCQUNSLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUNaO2lCQUFNO2dCQUNOLE9BQU8sRUFBRSxDQUFDO2FBQ1Y7UUFDRixDQUFDLENBQUMsQ0FBQztJQUNKLENBQUMsQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQVZELDhCQVVDO0FBRVksUUFBQSxNQUFNLEdBQUcsZ0JBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUNoQyxRQUFBLEtBQUssR0FBRyxnQkFBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQzlCLFFBQUEsSUFBSSxHQUFHLGdCQUFTLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDNUIsUUFBQSxNQUFNLEdBQUcsZ0JBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUNoQyxRQUFBLFFBQVEsR0FBRyxnQkFBUyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBRWpELElBQUksV0FBZ0IsQ0FBQztBQWFkLEtBQUssVUFBVSxxQkFBcUI7SUFDMUMsTUFBTSxPQUFPLEdBQUcsTUFBTSxjQUFjLEVBQUUsQ0FBQztJQUN2QyxPQUFPLE9BQU8sQ0FBQyxTQUFTLEdBQUcsQ0FBQyxpQkFBSyxDQUFBLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ2pELENBQUM7QUFIRCxzREFHQztBQUVNLEtBQUssVUFBVSxjQUFjLENBQUMsWUFBb0IsdUJBQVc7SUFDbkUsSUFBSTtRQUNILE1BQU0sV0FBVyxHQUFHLGNBQU8sQ0FBQyxTQUFTLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFDdkQsTUFBTSxRQUFRLEdBQUcsTUFBTSxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDN0MsV0FBVyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDbkMsT0FBTyxXQUFXLENBQUM7S0FDbkI7SUFBQyxPQUFPLENBQUMsRUFBRTtRQUNYLE1BQU0sSUFBSSxLQUFLLENBQUMsZ0NBQWdDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO0tBQzdEO0FBQ0YsQ0FBQztBQVRELHdDQVNDO0FBRUQsSUFBSSxXQUFnQixDQUFDO0FBRWQsS0FBSyxVQUFVLGNBQWMsQ0FBQyxZQUFvQix1QkFBVztJQUNuRSxJQUFJO1FBQ0gsTUFBTSxXQUFXLEdBQUcsY0FBTyxDQUFDLFNBQVMsRUFBRSxjQUFjLENBQUMsQ0FBQztRQUN2RCxNQUFNLFFBQVEsR0FBRyxNQUFNLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUM3QyxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNuQyxPQUFPLFdBQVcsQ0FBQztLQUNuQjtJQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ1gsTUFBTSxJQUFJLEtBQUssQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7S0FDN0Q7QUFDRixDQUFDO0FBVEQsd0NBU0MifQ==