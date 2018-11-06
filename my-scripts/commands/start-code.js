"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const getElectron_1 = require("../build-env/codeblocks/getElectron");
const clsUtil_1 = require("../build-env/misc/clsUtil");
const constants_1 = require("../build-env/misc/constants");
const fsUtil_1 = require("../build-env/misc/fsUtil");
const myBuildSystem_1 = require("../build-env/misc/myBuildSystem");
const pathUtil_1 = require("../build-env/misc/pathUtil");
myBuildSystem_1.whatIsThis(__filename, 'start local debug IDE, you must run this after start-watch show success.');
myBuildSystem_1.runMain(async () => {
    await getElectron_1.getElectronIfNot();
    delete process.env.VSCODE_PORTABLE;
    pathUtil_1.chdir(constants_1.VSCODE_ROOT);
    fsUtil_1.mkdirpSync('data');
    const passArgs = process.argv.slice(2);
    if (constants_1.isWin) {
        clsUtil_1.cleanScreen();
        console.error('cmd.exe /c scripts\\code.bat %s', passArgs.join(' '));
        child_process_1.spawnSync('cmd.exe', ['/C', 'scripts\\code.bat', ...passArgs], {
            encoding: 'utf8',
            stdio: 'inherit',
        });
    }
    else {
        clsUtil_1.cleanScreen();
        console.error('bash scripts/code.sh %s', passArgs.join(' '));
        child_process_1.spawnSync('bash', ['scripts/code.sh', ...passArgs], {
            encoding: 'utf8',
            stdio: 'inherit',
        });
    }
});
/*
elif [ "$SYSTEM" = "mac" ]; then
    mkdir -p ~/kendryte-ide-user-data
    if [ -L ../data ] && [ "$(readlink ../data)" != ~/kendryte-ide-user-data ] ; then
        unlink ../data
        ln -s ~/kendryte-ide-user-data ../data
    fi

    do_start bash scripts/code.sh "$@"
*/ 
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhcnQtY29kZS5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsiY29tbWFuZHMvc3RhcnQtY29kZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGlEQUEwQztBQUUxQyxxRUFBdUU7QUFDdkUsdURBQXdEO0FBQ3hELDJEQUFpRTtBQUNqRSxxREFBc0Q7QUFDdEQsbUVBQXNFO0FBQ3RFLHlEQUFtRDtBQUVuRCwwQkFBVSxDQUFDLFVBQVUsRUFBRSwwRUFBMEUsQ0FBQyxDQUFDO0FBRW5HLHVCQUFPLENBQUMsS0FBSyxJQUFJLEVBQUU7SUFDbEIsTUFBTSw4QkFBZ0IsRUFBRSxDQUFDO0lBRXpCLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUM7SUFFbkMsZ0JBQUssQ0FBQyx1QkFBVyxDQUFDLENBQUM7SUFFbkIsbUJBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUVuQixNQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN2QyxJQUFJLGlCQUFLLEVBQUU7UUFDVixxQkFBVyxFQUFFLENBQUM7UUFDZCxPQUFPLENBQUMsS0FBSyxDQUFDLGlDQUFpQyxFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNyRSx5QkFBUyxDQUFDLFNBQVMsRUFBRSxDQUFDLElBQUksRUFBRSxtQkFBbUIsRUFBRSxHQUFHLFFBQVEsQ0FBQyxFQUFFO1lBQzlELFFBQVEsRUFBRSxNQUFNO1lBQ2hCLEtBQUssRUFBRSxTQUFTO1NBQ2hCLENBQUMsQ0FBQztLQUNIO1NBQU07UUFDTixxQkFBVyxFQUFFLENBQUM7UUFDZCxPQUFPLENBQUMsS0FBSyxDQUFDLHlCQUF5QixFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUM3RCx5QkFBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLGlCQUFpQixFQUFFLEdBQUcsUUFBUSxDQUFDLEVBQUU7WUFDbkQsUUFBUSxFQUFFLE1BQU07WUFDaEIsS0FBSyxFQUFFLFNBQVM7U0FDaEIsQ0FBQyxDQUFDO0tBQ0g7QUFDRixDQUFDLENBQUMsQ0FBQztBQUVIOzs7Ozs7Ozs7RUFTRSJ9