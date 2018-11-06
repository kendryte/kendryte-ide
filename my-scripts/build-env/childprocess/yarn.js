"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const stream_1 = require("stream");
const pathUtil_1 = require("../misc/pathUtil");
const complex_1 = require("./complex");
async function installDependency(output, dir) {
    if (dir && process.cwd() !== dir) {
        pathUtil_1.chdir(dir);
    }
    const tee = new stream_1.PassThrough();
    tee.pipe(output, { end: false });
    tee.pipe(fs_1.createWriteStream('yarn-install.log'));
    if (fs_1.existsSync('yarn-error.log')) {
        fs_1.unlinkSync('yarn-error.log');
    }
    tee.write(`Pwd: ${process.cwd()}\nCommand: yarn install --verbose\n`);
    await complex_1.pipeCommandOut(tee, 'yarn', 'install', '--verbose');
}
exports.installDependency = installDependency;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieWFybi5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsiYnVpbGQtZW52L2NoaWxkcHJvY2Vzcy95YXJuLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMkJBQStEO0FBQy9ELG1DQUErQztBQUMvQywrQ0FBeUM7QUFDekMsdUNBQTJDO0FBRXBDLEtBQUssVUFBVSxpQkFBaUIsQ0FBQyxNQUFnQixFQUFFLEdBQVk7SUFDckUsSUFBSSxHQUFHLElBQUksT0FBTyxDQUFDLEdBQUcsRUFBRSxLQUFLLEdBQUcsRUFBRTtRQUNqQyxnQkFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ1g7SUFFRCxNQUFNLEdBQUcsR0FBRyxJQUFJLG9CQUFXLEVBQUUsQ0FBQztJQUM5QixHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUMsQ0FBQyxDQUFDO0lBQy9CLEdBQUcsQ0FBQyxJQUFJLENBQUMsc0JBQWlCLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO0lBRWhELElBQUksZUFBVSxDQUFDLGdCQUFnQixDQUFDLEVBQUU7UUFDakMsZUFBVSxDQUFDLGdCQUFnQixDQUFDLENBQUM7S0FDN0I7SUFDRCxHQUFHLENBQUMsS0FBSyxDQUFDLFFBQVEsT0FBTyxDQUFDLEdBQUcsRUFBRSxxQ0FBcUMsQ0FBQyxDQUFDO0lBQ3RFLE1BQU0sd0JBQWMsQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxXQUFXLENBQUMsQ0FBQztBQUMzRCxDQUFDO0FBZEQsOENBY0MifQ==