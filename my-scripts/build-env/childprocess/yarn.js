"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const stream_1 = require("stream");
const pathUtil_1 = require("../misc/pathUtil");
const complex_1 = require("./complex");
async function installDependency(output, dir, logToFile = true) {
    if (dir && process.cwd() !== dir) {
        pathUtil_1.chdir(dir);
    }
    let realOutput;
    if (logToFile) {
        const tee = new stream_1.PassThrough();
        tee.pipe(output, { end: false });
        tee.pipe(fs_1.createWriteStream('yarn-install.log'));
        realOutput = tee;
    }
    else {
        realOutput = output;
    }
    if (fs_1.existsSync('yarn-error.log')) {
        fs_1.unlinkSync('yarn-error.log');
    }
    realOutput.write(`Pwd: ${process.cwd()}\nCommand: yarn install --verbose\n`);
    await complex_1.pipeCommandOut(realOutput, 'yarn', 'install', '--verbose');
    if (fs_1.existsSync('yarn-error.log')) {
        output.write('Failed: yarn install failed, see yarn-error.log\n\n');
        throw new Error(`yarn install failed, please see ${path_1.resolve(process.cwd(), 'yarn-error.log')}`);
    }
}
exports.installDependency = installDependency;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieWFybi5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsiYnVpbGQtZW52L2NoaWxkcHJvY2Vzcy95YXJuLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMkJBQStEO0FBQy9ELCtCQUErQjtBQUMvQixtQ0FBcUM7QUFDckMsK0NBQXlDO0FBQ3pDLHVDQUEyQztBQUdwQyxLQUFLLFVBQVUsaUJBQWlCLENBQUMsTUFBc0IsRUFBRSxHQUFZLEVBQUUsU0FBUyxHQUFHLElBQUk7SUFDN0YsSUFBSSxHQUFHLElBQUksT0FBTyxDQUFDLEdBQUcsRUFBRSxLQUFLLEdBQUcsRUFBRTtRQUNqQyxnQkFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ1g7SUFFRCxJQUFJLFVBQWlDLENBQUM7SUFDdEMsSUFBSSxTQUFTLEVBQUU7UUFDZCxNQUFNLEdBQUcsR0FBRyxJQUFJLG9CQUFXLEVBQUUsQ0FBQztRQUM5QixHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUMsQ0FBQyxDQUFDO1FBQy9CLEdBQUcsQ0FBQyxJQUFJLENBQUMsc0JBQWlCLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO1FBQ2hELFVBQVUsR0FBRyxHQUFHLENBQUM7S0FDakI7U0FBTTtRQUNOLFVBQVUsR0FBRyxNQUFNLENBQUM7S0FDcEI7SUFFRCxJQUFJLGVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFO1FBQ2pDLGVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0tBQzdCO0lBQ0QsVUFBVSxDQUFDLEtBQUssQ0FBQyxRQUFRLE9BQU8sQ0FBQyxHQUFHLEVBQUUscUNBQXFDLENBQUMsQ0FBQztJQUM3RSxNQUFNLHdCQUFjLENBQUMsVUFBVSxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDakUsSUFBSSxlQUFVLENBQUMsZ0JBQWdCLENBQUMsRUFBRTtRQUNqQyxNQUFNLENBQUMsS0FBSyxDQUFDLHFEQUFxRCxDQUFDLENBQUM7UUFDcEUsTUFBTSxJQUFJLEtBQUssQ0FBQyxtQ0FBbUMsY0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsRUFBRSxnQkFBZ0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztLQUMvRjtBQUNGLENBQUM7QUF4QkQsOENBd0JDIn0=