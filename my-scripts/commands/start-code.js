"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const getElectron_1 = require("../build-env/codeblocks/getElectron");
const clsUtil_1 = require("../build-env/misc/clsUtil");
const constants_1 = require("../build-env/misc/constants");
const fsUtil_1 = require("../build-env/misc/fsUtil");
const help_1 = require("../build-env/misc/help");
const myBuildSystem_1 = require("../build-env/misc/myBuildSystem");
const pathUtil_1 = require("../build-env/misc/pathUtil");
help_1.whatIsThis(__filename, 'start local debug IDE, you must run this after start-watch show success.');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhcnQtY29kZS5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsiY29tbWFuZHMvc3RhcnQtY29kZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGlEQUEwQztBQUMxQyxxRUFBdUU7QUFDdkUsdURBQXdEO0FBQ3hELDJEQUFpRTtBQUNqRSxxREFBc0Q7QUFDdEQsaURBQW9EO0FBQ3BELG1FQUEwRDtBQUMxRCx5REFBbUQ7QUFFbkQsaUJBQVUsQ0FBQyxVQUFVLEVBQUUsMEVBQTBFLENBQUMsQ0FBQztBQUVuRyx1QkFBTyxDQUFDLEtBQUssSUFBSSxFQUFFO0lBQ2xCLE1BQU0sOEJBQWdCLEVBQUUsQ0FBQztJQUV6QixPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDO0lBRW5DLGdCQUFLLENBQUMsdUJBQVcsQ0FBQyxDQUFDO0lBRW5CLG1CQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7SUFFbkIsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDdkMsSUFBSSxpQkFBSyxFQUFFO1FBQ1YscUJBQVcsRUFBRSxDQUFDO1FBQ2QsT0FBTyxDQUFDLEtBQUssQ0FBQyxpQ0FBaUMsRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDckUseUJBQVMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxJQUFJLEVBQUUsbUJBQW1CLEVBQUUsR0FBRyxRQUFRLENBQUMsRUFBRTtZQUM5RCxRQUFRLEVBQUUsTUFBTTtZQUNoQixLQUFLLEVBQUUsU0FBUztTQUNoQixDQUFDLENBQUM7S0FDSDtTQUFNO1FBQ04scUJBQVcsRUFBRSxDQUFDO1FBQ2QsT0FBTyxDQUFDLEtBQUssQ0FBQyx5QkFBeUIsRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDN0QseUJBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxpQkFBaUIsRUFBRSxHQUFHLFFBQVEsQ0FBQyxFQUFFO1lBQ25ELFFBQVEsRUFBRSxNQUFNO1lBQ2hCLEtBQUssRUFBRSxTQUFTO1NBQ2hCLENBQUMsQ0FBQztLQUNIO0FBQ0YsQ0FBQyxDQUFDLENBQUM7QUFFSDs7Ozs7Ozs7O0VBU0UifQ==