"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const noDependency_1 = require("../build-env/childprocess/noDependency");
const getElectron_1 = require("../build-env/codeblocks/getElectron");
const clsUtil_1 = require("../build-env/misc/clsUtil");
const constants_1 = require("../build-env/misc/constants");
const fsUtil_1 = require("../build-env/misc/fsUtil");
const myBuildSystem_1 = require("../build-env/misc/myBuildSystem");
const pathUtil_1 = require("../build-env/misc/pathUtil");
myBuildSystem_1.runMain(async () => {
    await getElectron_1.getElectronIfNot();
    delete process.env.VSCODE_PORTABLE;
    pathUtil_1.chdir(constants_1.VSCODE_ROOT);
    fsUtil_1.mkdirpSync('data');
    const passArgs = process.argv.slice(2);
    if (constants_1.isWin) {
        noDependency_1.shellExec('chcp', '65001');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhcnQtY29kZS5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsiY29tbWFuZHMvc3RhcnQtY29kZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGlEQUEwQztBQUMxQyx5RUFBbUU7QUFDbkUscUVBQXVFO0FBQ3ZFLHVEQUF3RDtBQUN4RCwyREFBaUU7QUFDakUscURBQXNEO0FBQ3RELG1FQUEwRDtBQUMxRCx5REFBbUQ7QUFFbkQsdUJBQU8sQ0FBQyxLQUFLLElBQUksRUFBRTtJQUNsQixNQUFNLDhCQUFnQixFQUFFLENBQUM7SUFFekIsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQztJQUVuQyxnQkFBSyxDQUFDLHVCQUFXLENBQUMsQ0FBQztJQUVuQixtQkFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBRW5CLE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3ZDLElBQUksaUJBQUssRUFBRTtRQUNWLHdCQUFTLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzNCLHFCQUFXLEVBQUUsQ0FBQztRQUNkLE9BQU8sQ0FBQyxLQUFLLENBQUMsaUNBQWlDLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3JFLHlCQUFTLENBQUMsU0FBUyxFQUFFLENBQUMsSUFBSSxFQUFFLG1CQUFtQixFQUFFLEdBQUcsUUFBUSxDQUFDLEVBQUU7WUFDOUQsUUFBUSxFQUFFLE1BQU07WUFDaEIsS0FBSyxFQUFFLFNBQVM7U0FDaEIsQ0FBQyxDQUFDO0tBQ0g7U0FBTTtRQUNOLHFCQUFXLEVBQUUsQ0FBQztRQUNkLE9BQU8sQ0FBQyxLQUFLLENBQUMseUJBQXlCLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzdELHlCQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsaUJBQWlCLEVBQUUsR0FBRyxRQUFRLENBQUMsRUFBRTtZQUNuRCxRQUFRLEVBQUUsTUFBTTtZQUNoQixLQUFLLEVBQUUsU0FBUztTQUNoQixDQUFDLENBQUM7S0FDSDtBQUNGLENBQUMsQ0FBQyxDQUFDO0FBRUg7Ozs7Ozs7OztFQVNFIn0=