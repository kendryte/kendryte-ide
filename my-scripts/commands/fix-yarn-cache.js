"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const childCommands_1 = require("../build-env/childCommands");
const include_1 = require("../build-env/include");
const rimraf = require("rimraf");
include_1.runMain(async () => {
    const logger = fs_1.createWriteStream('filesToRemove.txt', 'utf8');
    function log(s) {
        return new Promise((resolve, reject) => {
            const wrappedCallback = (err) => err ? reject(err) : resolve();
            logger.write(s, wrappedCallback);
        });
    }
    include_1.mainDispose(() => {
        logger.end();
    });
    const yarnCache = (await childCommands_1.shellOutput('yarn', 'cache', 'dir')).trim();
    await log('dir is ' + yarnCache + '\n');
    if (!yarnCache) {
        throw new Error('yarn cache dir empty');
    }
    const leafs = [];
    findAnyDirToDelete(yarnCache, leafs);
    for (const dir of leafs) {
        if (!fs_1.existsSync(path_1.resolve(dir, '.yarn-metadata.json'))) {
            await log(`rm -f '${dir}'\n`);
            rimraf.sync(dir);
        }
    }
});
// return dir should delete
function findAnyDirToDelete(dir, ret = []) {
    const dirContent = fs_1.readdirSync(dir);
    const tarballExists = dirContent.includes('.yarn-tarball.tgz');
    const onlyTarballExists = tarballExists && dirContent.length === 1;
    const metadataExists = dirContent.includes('.yarn-metadata.json');
    // const tarball = resolve(dir, '.yarn-tarball.tgz');
    const metadata = path_1.resolve(dir, '.yarn-metadata.json');
    if (tarballExists) {
        if (metadataExists) {
            ret.push(metadata);
            return false;
        }
        else if (onlyTarballExists) {
            return true;
        }
        else { // impossible
            return true;
        }
    }
    let shouldNotDelete = false;
    for (const item of dirContent) {
        const sub = path_1.resolve(dir, item);
        if (fs_1.lstatSync(sub).isDirectory()) {
            const shouldSubDelete = findAnyDirToDelete(sub, ret);
            if (shouldSubDelete) {
                ret.push(sub);
            }
            else {
                shouldNotDelete = true;
            }
        }
        else {
            shouldNotDelete = true;
        }
    }
    if (!shouldNotDelete) {
        return true;
    }
    else {
        return false;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZml4LXlhcm4tY2FjaGUuanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbImNvbW1hbmRzL2ZpeC15YXJuLWNhY2hlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMkJBQTJFO0FBQzNFLCtCQUErQjtBQUMvQiw4REFBeUQ7QUFDekQsa0RBQTREO0FBQzVELGlDQUFrQztBQUVsQyxpQkFBTyxDQUFDLEtBQUssSUFBSSxFQUFFO0lBQ2xCLE1BQU0sTUFBTSxHQUFHLHNCQUFpQixDQUFDLG1CQUFtQixFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBRTlELFNBQVMsR0FBRyxDQUFDLENBQVM7UUFDckIsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtZQUN0QyxNQUFNLGVBQWUsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFBLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQzlELE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLGVBQWUsQ0FBQyxDQUFDO1FBQ2xDLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVELHFCQUFXLENBQUMsR0FBRyxFQUFFO1FBQ2hCLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUNkLENBQUMsQ0FBQyxDQUFDO0lBRUgsTUFBTSxTQUFTLEdBQUcsQ0FBQyxNQUFNLDJCQUFXLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ3JFLE1BQU0sR0FBRyxDQUFDLFNBQVMsR0FBRyxTQUFTLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDeEMsSUFBSSxDQUFDLFNBQVMsRUFBRTtRQUNmLE1BQU0sSUFBSSxLQUFLLENBQUMsc0JBQXNCLENBQUMsQ0FBQztLQUN4QztJQUNELE1BQU0sS0FBSyxHQUFHLEVBQUUsQ0FBQztJQUNqQixrQkFBa0IsQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDckMsS0FBSyxNQUFNLEdBQUcsSUFBSSxLQUFLLEVBQUU7UUFDeEIsSUFBSSxDQUFDLGVBQVUsQ0FBQyxjQUFPLENBQUMsR0FBRyxFQUFFLHFCQUFxQixDQUFDLENBQUMsRUFBRTtZQUNyRCxNQUFNLEdBQUcsQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDLENBQUM7WUFDOUIsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUNqQjtLQUNEO0FBQ0YsQ0FBQyxDQUFDLENBQUM7QUFFSCwyQkFBMkI7QUFDM0IsU0FBUyxrQkFBa0IsQ0FBQyxHQUFXLEVBQUUsTUFBZ0IsRUFBRTtJQUMxRCxNQUFNLFVBQVUsR0FBRyxnQkFBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBRXBDLE1BQU0sYUFBYSxHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUMsbUJBQW1CLENBQUMsQ0FBQztJQUMvRCxNQUFNLGlCQUFpQixHQUFHLGFBQWEsSUFBSSxVQUFVLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQztJQUNuRSxNQUFNLGNBQWMsR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDLHFCQUFxQixDQUFDLENBQUM7SUFFbEUscURBQXFEO0lBQ3JELE1BQU0sUUFBUSxHQUFHLGNBQU8sQ0FBQyxHQUFHLEVBQUUscUJBQXFCLENBQUMsQ0FBQztJQUVyRCxJQUFJLGFBQWEsRUFBRTtRQUNsQixJQUFJLGNBQWMsRUFBRTtZQUNuQixHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ25CLE9BQU8sS0FBSyxDQUFDO1NBQ2I7YUFBTSxJQUFJLGlCQUFpQixFQUFFO1lBQzdCLE9BQU8sSUFBSSxDQUFDO1NBQ1o7YUFBTSxFQUFFLGFBQWE7WUFDckIsT0FBTyxJQUFJLENBQUM7U0FDWjtLQUNEO0lBRUQsSUFBSSxlQUFlLEdBQUcsS0FBSyxDQUFDO0lBQzVCLEtBQUssTUFBTSxJQUFJLElBQUksVUFBVSxFQUFFO1FBQzlCLE1BQU0sR0FBRyxHQUFHLGNBQU8sQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDL0IsSUFBSSxjQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsV0FBVyxFQUFFLEVBQUU7WUFDakMsTUFBTSxlQUFlLEdBQUcsa0JBQWtCLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ3JELElBQUksZUFBZSxFQUFFO2dCQUNwQixHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ2Q7aUJBQU07Z0JBQ04sZUFBZSxHQUFHLElBQUksQ0FBQzthQUN2QjtTQUNEO2FBQU07WUFDTixlQUFlLEdBQUcsSUFBSSxDQUFDO1NBQ3ZCO0tBQ0Q7SUFFRCxJQUFJLENBQUMsZUFBZSxFQUFFO1FBQ3JCLE9BQU8sSUFBSSxDQUFDO0tBQ1o7U0FBTTtRQUNOLE9BQU8sS0FBSyxDQUFDO0tBQ2I7QUFDRixDQUFDIn0=