"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fsUtil_1 = require("./fsUtil");
const gitdirReg = /^gitdir:\s*(.+)$/mg;
async function resolveGitDir(path) {
    const ls = await fsUtil_1.lstat(path);
    if (!ls) {
        throw new Error(path + ' folder not exists.');
    }
    if (ls.isSymbolicLink()) {
        return resolveGitDir(await fsUtil_1.readlink(path));
    }
    if (ls.isDirectory()) {
        return path;
    }
    else if (ls.isFile()) {
        const data = await fsUtil_1.readFile(path);
        const m = gitdirReg.exec(data);
        if (!m) {
            throw new Error(path + ' is not a git repo.');
        }
        return resolveGitDir(m[1]);
    }
    else {
        throw new Error(path + ' is not usable.');
    }
}
exports.resolveGitDir = resolveGitDir;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2l0LmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJidWlsZC1lbnYvbWlzYy9naXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxQ0FBcUQ7QUFFckQsTUFBTSxTQUFTLEdBQUcsb0JBQW9CLENBQUM7QUFFaEMsS0FBSyxVQUFVLGFBQWEsQ0FBQyxJQUFZO0lBQy9DLE1BQU0sRUFBRSxHQUFHLE1BQU0sY0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzdCLElBQUksQ0FBQyxFQUFFLEVBQUU7UUFDUixNQUFNLElBQUksS0FBSyxDQUFDLElBQUksR0FBRyxxQkFBcUIsQ0FBQyxDQUFDO0tBQzlDO0lBQ0QsSUFBSSxFQUFFLENBQUMsY0FBYyxFQUFFLEVBQUU7UUFDeEIsT0FBTyxhQUFhLENBQUMsTUFBTSxpQkFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7S0FDM0M7SUFDRCxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUUsRUFBRTtRQUNyQixPQUFPLElBQUksQ0FBQztLQUNaO1NBQU0sSUFBSSxFQUFFLENBQUMsTUFBTSxFQUFFLEVBQUU7UUFDdkIsTUFBTSxJQUFJLEdBQUcsTUFBTSxpQkFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xDLE1BQU0sQ0FBQyxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDL0IsSUFBSSxDQUFDLENBQUMsRUFBRTtZQUNQLE1BQU0sSUFBSSxLQUFLLENBQUMsSUFBSSxHQUFHLHFCQUFxQixDQUFDLENBQUM7U0FDOUM7UUFDRCxPQUFPLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUMzQjtTQUFNO1FBQ04sTUFBTSxJQUFJLEtBQUssQ0FBQyxJQUFJLEdBQUcsaUJBQWlCLENBQUMsQ0FBQztLQUMxQztBQUNGLENBQUM7QUFwQkQsc0NBb0JDIn0=