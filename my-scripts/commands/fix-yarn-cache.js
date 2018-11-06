"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const noDependency_1 = require("../build-env/childprocess/noDependency");
const constants_1 = require("../build-env/misc/constants");
const fsUtil_1 = require("../build-env/misc/fsUtil");
const myBuildSystem_1 = require("../build-env/misc/myBuildSystem");
myBuildSystem_1.runMain(async () => {
    const logger = fs_1.createWriteStream(path_1.resolve(constants_1.RELEASE_ROOT, 'yarnCacheFilesToRemove.txt'), 'utf8');
    function log(s) {
        return new Promise((resolve, reject) => {
            const wrappedCallback = (err) => err ? reject(err) : resolve();
            logger.write(s, wrappedCallback);
        });
    }
    myBuildSystem_1.mainDispose(() => {
        logger.end();
    });
    const yarnCache = (await noDependency_1.shellOutput('yarn', 'cache', 'dir')).trim();
    await log('dir is ' + yarnCache + '\n');
    if (!yarnCache) {
        throw new Error('yarn cache dir empty');
    }
    const leafs = [];
    findAnyDirToDelete(yarnCache, leafs);
    for (const dir of leafs) {
        if (!fs_1.existsSync(path_1.resolve(dir, '.yarn-metadata.json'))) {
            await fsUtil_1.removeDirectory(dir, logger);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZml4LXlhcm4tY2FjaGUuanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbImNvbW1hbmRzL2ZpeC15YXJuLWNhY2hlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMkJBQTJFO0FBQzNFLCtCQUErQjtBQUMvQix5RUFBcUU7QUFDckUsMkRBQTJEO0FBQzNELHFEQUEyRDtBQUMzRCxtRUFBdUU7QUFFdkUsdUJBQU8sQ0FBQyxLQUFLLElBQUksRUFBRTtJQUNsQixNQUFNLE1BQU0sR0FBRyxzQkFBaUIsQ0FBQyxjQUFPLENBQUMsd0JBQVksRUFBRSw0QkFBNEIsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBRTlGLFNBQVMsR0FBRyxDQUFDLENBQVM7UUFDckIsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtZQUN0QyxNQUFNLGVBQWUsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFBLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQzlELE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLGVBQWUsQ0FBQyxDQUFDO1FBQ2xDLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVELDJCQUFXLENBQUMsR0FBRyxFQUFFO1FBQ2hCLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUNkLENBQUMsQ0FBQyxDQUFDO0lBRUgsTUFBTSxTQUFTLEdBQUcsQ0FBQyxNQUFNLDBCQUFXLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ3JFLE1BQU0sR0FBRyxDQUFDLFNBQVMsR0FBRyxTQUFTLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDeEMsSUFBSSxDQUFDLFNBQVMsRUFBRTtRQUNmLE1BQU0sSUFBSSxLQUFLLENBQUMsc0JBQXNCLENBQUMsQ0FBQztLQUN4QztJQUNELE1BQU0sS0FBSyxHQUFHLEVBQUUsQ0FBQztJQUNqQixrQkFBa0IsQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDckMsS0FBSyxNQUFNLEdBQUcsSUFBSSxLQUFLLEVBQUU7UUFDeEIsSUFBSSxDQUFDLGVBQVUsQ0FBQyxjQUFPLENBQUMsR0FBRyxFQUFFLHFCQUFxQixDQUFDLENBQUMsRUFBRTtZQUNyRCxNQUFNLHdCQUFlLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1NBQ25DO0tBQ0Q7QUFDRixDQUFDLENBQUMsQ0FBQztBQUVILDJCQUEyQjtBQUMzQixTQUFTLGtCQUFrQixDQUFDLEdBQVcsRUFBRSxNQUFnQixFQUFFO0lBQzFELE1BQU0sVUFBVSxHQUFHLGdCQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7SUFFcEMsTUFBTSxhQUFhLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0lBQy9ELE1BQU0saUJBQWlCLEdBQUcsYUFBYSxJQUFJLFVBQVUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDO0lBQ25FLE1BQU0sY0FBYyxHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUMscUJBQXFCLENBQUMsQ0FBQztJQUVsRSxxREFBcUQ7SUFDckQsTUFBTSxRQUFRLEdBQUcsY0FBTyxDQUFDLEdBQUcsRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO0lBRXJELElBQUksYUFBYSxFQUFFO1FBQ2xCLElBQUksY0FBYyxFQUFFO1lBQ25CLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDbkIsT0FBTyxLQUFLLENBQUM7U0FDYjthQUFNLElBQUksaUJBQWlCLEVBQUU7WUFDN0IsT0FBTyxJQUFJLENBQUM7U0FDWjthQUFNLEVBQUUsYUFBYTtZQUNyQixPQUFPLElBQUksQ0FBQztTQUNaO0tBQ0Q7SUFFRCxJQUFJLGVBQWUsR0FBRyxLQUFLLENBQUM7SUFDNUIsS0FBSyxNQUFNLElBQUksSUFBSSxVQUFVLEVBQUU7UUFDOUIsTUFBTSxHQUFHLEdBQUcsY0FBTyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUMvQixJQUFJLGNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxXQUFXLEVBQUUsRUFBRTtZQUNqQyxNQUFNLGVBQWUsR0FBRyxrQkFBa0IsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDckQsSUFBSSxlQUFlLEVBQUU7Z0JBQ3BCLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDZDtpQkFBTTtnQkFDTixlQUFlLEdBQUcsSUFBSSxDQUFDO2FBQ3ZCO1NBQ0Q7YUFBTTtZQUNOLGVBQWUsR0FBRyxJQUFJLENBQUM7U0FDdkI7S0FDRDtJQUVELElBQUksQ0FBQyxlQUFlLEVBQUU7UUFDckIsT0FBTyxJQUFJLENBQUM7S0FDWjtTQUFNO1FBQ04sT0FBTyxLQUFLLENBQUM7S0FDYjtBQUNGLENBQUMifQ==