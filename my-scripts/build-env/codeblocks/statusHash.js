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
async function compareHash(id, value) {
    return (await readHash(id)) === value;
}
exports.compareHash = compareHash;
function saveHash(id, value) {
    const hashDir = path_1.resolve(constants_1.RELEASE_ROOT, 'hash');
    const hashFile = path_1.resolve(hashDir, id + '.md5');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdHVzSGFzaC5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsiYnVpbGQtZW52L2NvZGVibG9ja3Mvc3RhdHVzSGFzaC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG1DQUFvQztBQUNwQywrQkFBK0I7QUFDL0IsaURBQWlEO0FBQ2pELDJDQUEyRTtBQUUzRSxTQUFnQixHQUFHLENBQUMsTUFBcUI7SUFDeEMsT0FBTyxtQkFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDdkQsQ0FBQztBQUZELGtCQUVDO0FBRU0sS0FBSyxVQUFVLFdBQVcsQ0FBQyxFQUFVLEVBQUUsS0FBYTtJQUMxRCxPQUFPLENBQUMsTUFBTSxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxLQUFLLENBQUM7QUFDdkMsQ0FBQztBQUZELGtDQUVDO0FBRUQsU0FBZ0IsUUFBUSxDQUFDLEVBQVUsRUFBRSxLQUFhO0lBQ2pELE1BQU0sT0FBTyxHQUFHLGNBQU8sQ0FBQyx3QkFBWSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQzlDLE1BQU0sUUFBUSxHQUFHLGNBQU8sQ0FBQyxPQUFPLEVBQUUsRUFBRSxHQUFHLE1BQU0sQ0FBQyxDQUFDO0lBRS9DLG1CQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDcEIsT0FBTyxrQkFBUyxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUNuQyxDQUFDO0FBTkQsNEJBTUM7QUFFRCxLQUFLLFVBQVUsUUFBUSxDQUFDLEVBQVU7SUFDakMsTUFBTSxRQUFRLEdBQUcsY0FBTyxDQUFDLHdCQUFZLEVBQUUsTUFBTSxFQUFFLEVBQUUsR0FBRyxNQUFNLENBQUMsQ0FBQztJQUM1RCxJQUFJLE1BQU0saUJBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRTtRQUM3QixPQUFPLE1BQU0saUJBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUNoQztTQUFNO1FBQ04sT0FBTyxFQUFFLENBQUM7S0FDVjtBQUNGLENBQUMifQ==