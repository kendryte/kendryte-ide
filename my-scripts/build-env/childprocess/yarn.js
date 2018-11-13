"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const stream_1 = require("stream");
const pathUtil_1 = require("../misc/pathUtil");
const complex_1 = require("./complex");
async function installDependency(output, dir) {
    if (dir && process.cwd() !== dir) {
        pathUtil_1.chdir(dir);
    }
    const tee = new stream_1.PassThrough();
    tee.pipe(output.screen, { end: false });
    tee.pipe(fs_1.createWriteStream('yarn-install.log'));
    if (fs_1.existsSync('yarn-error.log')) {
        fs_1.unlinkSync('yarn-error.log');
    }
    output.writeln(`Pwd: ${process.cwd()}\nCommand: yarn install --verbose\nLogfile: ${path_1.resolve(process.cwd(), 'yarn-install.log')}`);
    await complex_1.pipeCommandOut(tee, 'yarn', 'install', '--verbose');
    if (fs_1.existsSync('yarn-error.log')) {
        output.writeln('Failed: yarn install failed, see yarn-install.log And yarn-error.log\n');
        throw new Error(`yarn install failed, please see ${path_1.resolve(process.cwd(), 'yarn-error.log')}`);
    }
}
exports.installDependency = installDependency;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieWFybi5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsiYnVpbGQtZW52L2NoaWxkcHJvY2Vzcy95YXJuLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsMkJBQStEO0FBQy9ELCtCQUErQjtBQUMvQixtQ0FBcUM7QUFDckMsK0NBQXlDO0FBQ3pDLHVDQUEyQztBQUVwQyxLQUFLLFVBQVUsaUJBQWlCLENBQUMsTUFBMkIsRUFBRSxHQUFZO0lBQ2hGLElBQUksR0FBRyxJQUFJLE9BQU8sQ0FBQyxHQUFHLEVBQUUsS0FBSyxHQUFHLEVBQUU7UUFDakMsZ0JBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUNYO0lBRUQsTUFBTSxHQUFHLEdBQUcsSUFBSSxvQkFBVyxFQUFFLENBQUM7SUFDOUIsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLEVBQUMsR0FBRyxFQUFFLEtBQUssRUFBQyxDQUFDLENBQUM7SUFDdEMsR0FBRyxDQUFDLElBQUksQ0FBQyxzQkFBaUIsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7SUFFaEQsSUFBSSxlQUFVLENBQUMsZ0JBQWdCLENBQUMsRUFBRTtRQUNqQyxlQUFVLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztLQUM3QjtJQUNELE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBUSxPQUFPLENBQUMsR0FBRyxFQUFFLCtDQUErQyxjQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLGtCQUFrQixDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ2pJLE1BQU0sd0JBQWMsQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxXQUFXLENBQUMsQ0FBQztJQUMxRCxJQUFJLGVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFO1FBQ2pDLE1BQU0sQ0FBQyxPQUFPLENBQUMsd0VBQXdFLENBQUMsQ0FBQztRQUN6RixNQUFNLElBQUksS0FBSyxDQUFDLG1DQUFtQyxjQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLGdCQUFnQixDQUFDLEVBQUUsQ0FBQyxDQUFDO0tBQy9GO0FBQ0YsQ0FBQztBQWxCRCw4Q0FrQkMifQ==