"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
const path_1 = require("path");
const constants_1 = require("../misc/constants");
const fsUtil_1 = require("../misc/fsUtil");
function md5(buffer) {
    return crypto_1.createHash('md5').update(buffer).digest('hex');
}
exports.md5 = md5;
async function compareHash(id, value, output) {
    const prev = await readHash(id);
    output.write(`compare hash - ${id}\n\tOld: ${prev}\n\tNew: ${value}\n`);
    return prev === value;
}
exports.compareHash = compareHash;
function saveHash(id, value, output) {
    const hashDir = path_1.resolve(constants_1.RELEASE_ROOT, 'hash');
    const hashFile = path_1.resolve(hashDir, id + '.md5');
    output.write(`save hash - ${id} = ${value}\n`);
    fsUtil_1.mkdirpSync(hashDir);
    return fsUtil_1.writeFile(hashFile, value);
}
exports.saveHash = saveHash;
async function readHash(id) {
    const hashFile = path_1.resolve(constants_1.RELEASE_ROOT, 'hash', id + '.md5');
    if (await fsUtil_1.isExists(hashFile)) {
        return await fsUtil_1.readFile(hashFile);
    }
    else {
        return '';
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdHVzSGFzaC5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsiYnVpbGQtZW52L2NvZGVibG9ja3Mvc3RhdHVzSGFzaC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG1DQUFvQztBQUNwQywrQkFBK0I7QUFDL0IsaURBQWlEO0FBQ2pELDJDQUEyRTtBQUczRSxTQUFnQixHQUFHLENBQUMsTUFBcUI7SUFDeEMsT0FBTyxtQkFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDdkQsQ0FBQztBQUZELGtCQUVDO0FBRU0sS0FBSyxVQUFVLFdBQVcsQ0FBQyxFQUFVLEVBQUUsS0FBYSxFQUFFLE1BQXNCO0lBQ2xGLE1BQU0sSUFBSSxHQUFHLE1BQU0sUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ2hDLE1BQU0sQ0FBQyxLQUFLLENBQUMsa0JBQWtCLEVBQUUsWUFBWSxJQUFJLFlBQVksS0FBSyxJQUFJLENBQUMsQ0FBQztJQUN4RSxPQUFPLElBQUksS0FBSyxLQUFLLENBQUM7QUFDdkIsQ0FBQztBQUpELGtDQUlDO0FBRUQsU0FBZ0IsUUFBUSxDQUFDLEVBQVUsRUFBRSxLQUFhLEVBQUUsTUFBc0I7SUFDekUsTUFBTSxPQUFPLEdBQUcsY0FBTyxDQUFDLHdCQUFZLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDOUMsTUFBTSxRQUFRLEdBQUcsY0FBTyxDQUFDLE9BQU8sRUFBRSxFQUFFLEdBQUcsTUFBTSxDQUFDLENBQUM7SUFFL0MsTUFBTSxDQUFDLEtBQUssQ0FBQyxlQUFlLEVBQUUsTUFBTSxLQUFLLElBQUksQ0FBQyxDQUFDO0lBQy9DLG1CQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDcEIsT0FBTyxrQkFBUyxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUNuQyxDQUFDO0FBUEQsNEJBT0M7QUFFRCxLQUFLLFVBQVUsUUFBUSxDQUFDLEVBQVU7SUFDakMsTUFBTSxRQUFRLEdBQUcsY0FBTyxDQUFDLHdCQUFZLEVBQUUsTUFBTSxFQUFFLEVBQUUsR0FBRyxNQUFNLENBQUMsQ0FBQztJQUM1RCxJQUFJLE1BQU0saUJBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRTtRQUM3QixPQUFPLE1BQU0saUJBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUNoQztTQUFNO1FBQ04sT0FBTyxFQUFFLENBQUM7S0FDVjtBQUNGLENBQUMifQ==