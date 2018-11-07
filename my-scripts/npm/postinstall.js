"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const constants_1 = require("../build-env/misc/constants");
const installedMark = '## kendryte environment hook ## Do Not Edit This File';
const installedMarkEnd = '## kendryte environment hook end ## Do Not Edit This File';
const passingSimpleEnvironments = [
    'HTTPS_PROXY',
    'ALL_PROXY',
    'npm_config_arch',
    'npm_config_disturl',
    'npm_config_runtime',
    'ORIGINAL_HOME',
    'ORIGINAL_PATH',
].map(exportSimpleEnvironment);
const passingPathEnvironments = [
    'VSCODE_ROOT',
    'RELEASE_ROOT',
    'ARCH_RELEASE_ROOT',
    'FAKE_HOME',
    'HOME',
    'NODEJS_INSTALL',
    'NODEJS_BIN',
    'NODEJS',
    'YARN_FOLDER',
    'PREFIX',
    'YARN_CACHE_FOLDER',
    'PRIVATE_BINS',
    'PATH',
    'TMP',
    'TEMP',
    'npm_config_cache',
].map(constants_1.isWin ? exportCrossPlatformEnvironment : exportSimpleEnvironment);
function exportSimpleEnvironment(envName) {
    return `export ${envName}=${JSON.stringify(process.env[envName])}`;
}
function exportCrossPlatformEnvironment(envName) {
    const paths = process.env[envName].split(';').map((path) => {
        path = path_1.normalize(path);
        path = path.replace(/^([a-z]):\\/i, (m0, drive) => {
            return '/' + drive.toLowerCase() + '/';
        });
        path = path.replace(/\\/g, '/');
        return path;
    });
    return `export ${envName}=${JSON.stringify(paths.join(':'))}`;
}
const hooksDir = path_1.resolve(constants_1.VSCODE_ROOT, '.git', 'hooks');
process.chdir(hooksDir);
fs_1.readdirSync(hooksDir).forEach((item) => {
    if (item.endsWith('.sample')) {
        return;
    }
    const data = fs_1.readFileSync(path_1.resolve(hooksDir, item), 'utf8');
    const lines = data.split('\n');
    const startMark = lines.indexOf(installedMark);
    const endMark = lines.lastIndexOf(installedMarkEnd);
    let start = 1, length = 0;
    if (startMark !== -1 && endMark > startMark) {
        start = startMark;
        length = endMark - startMark + 1;
    }
    lines.splice(start, length, installedMark, ...passingSimpleEnvironments, ...passingPathEnvironments, installedMarkEnd);
    fs_1.writeFileSync(item, lines.join('\n'), 'utf8');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9zdGluc3RhbGwuanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbIm5wbS9wb3N0aW5zdGFsbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDJCQUE4RDtBQUM5RCwrQkFBMEM7QUFDMUMsMkRBQWlFO0FBRWpFLE1BQU0sYUFBYSxHQUFHLHVEQUF1RCxDQUFDO0FBQzlFLE1BQU0sZ0JBQWdCLEdBQUcsMkRBQTJELENBQUM7QUFDckYsTUFBTSx5QkFBeUIsR0FBRztJQUNqQyxhQUFhO0lBQ2IsV0FBVztJQUNYLGlCQUFpQjtJQUNqQixvQkFBb0I7SUFDcEIsb0JBQW9CO0lBQ3BCLGVBQWU7SUFDZixlQUFlO0NBQ2YsQ0FBQyxHQUFHLENBQUMsdUJBQXVCLENBQUMsQ0FBQztBQUMvQixNQUFNLHVCQUF1QixHQUFHO0lBQy9CLGFBQWE7SUFDYixjQUFjO0lBQ2QsbUJBQW1CO0lBQ25CLFdBQVc7SUFDWCxNQUFNO0lBQ04sZ0JBQWdCO0lBQ2hCLFlBQVk7SUFDWixRQUFRO0lBQ1IsYUFBYTtJQUNiLFFBQVE7SUFDUixtQkFBbUI7SUFDbkIsY0FBYztJQUNkLE1BQU07SUFDTixLQUFLO0lBQ0wsTUFBTTtJQUNOLGtCQUFrQjtDQUNsQixDQUFDLEdBQUcsQ0FBQyxpQkFBSyxDQUFBLENBQUMsQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDLENBQUMsdUJBQXVCLENBQUMsQ0FBQztBQUV2RSxTQUFTLHVCQUF1QixDQUFDLE9BQWU7SUFDL0MsT0FBTyxVQUFVLE9BQU8sSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQ3BFLENBQUM7QUFFRCxTQUFTLDhCQUE4QixDQUFDLE9BQWU7SUFDdEQsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUU7UUFDMUQsSUFBSSxHQUFHLGdCQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdkIsSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxFQUFFLENBQUMsRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFO1lBQ2pELE9BQU8sR0FBRyxHQUFHLEtBQUssQ0FBQyxXQUFXLEVBQUUsR0FBRyxHQUFHLENBQUM7UUFDeEMsQ0FBQyxDQUFDLENBQUM7UUFDSCxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDaEMsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDLENBQUMsQ0FBQztJQUVILE9BQU8sVUFBVSxPQUFPLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUMvRCxDQUFDO0FBRUQsTUFBTSxRQUFRLEdBQUcsY0FBTyxDQUFDLHVCQUFXLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQ3ZELE9BQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDeEIsZ0JBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFZLEVBQUUsRUFBRTtJQUM5QyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLEVBQUU7UUFDN0IsT0FBTztLQUNQO0lBRUQsTUFBTSxJQUFJLEdBQUcsaUJBQVksQ0FBQyxjQUFPLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQzNELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7SUFFL0IsTUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUMvQyxNQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDLGdCQUFnQixDQUFDLENBQUM7SUFFcEQsSUFBSSxLQUFLLEdBQUcsQ0FBQyxFQUFFLE1BQU0sR0FBRyxDQUFDLENBQUM7SUFDMUIsSUFBSSxTQUFTLEtBQUssQ0FBQyxDQUFDLElBQUksT0FBTyxHQUFHLFNBQVMsRUFBRTtRQUM1QyxLQUFLLEdBQUcsU0FBUyxDQUFDO1FBQ2xCLE1BQU0sR0FBRyxPQUFPLEdBQUcsU0FBUyxHQUFHLENBQUMsQ0FBQztLQUNqQztJQUVELEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFDekIsYUFBYSxFQUNiLEdBQUcseUJBQXlCLEVBQzVCLEdBQUcsdUJBQXVCLEVBQzFCLGdCQUFnQixDQUNoQixDQUFDO0lBRUYsa0JBQWEsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQztBQUMvQyxDQUFDLENBQUMsQ0FBQyJ9