"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const childCommands_1 = require("../build-env/childCommands");
const include_1 = require("../build-env/include");
const stringWidth_1 = require("../build-env/stringWidth");
// import './prepare-release';
include_1.thisIsABuildScript();
function unicodeEscape(str) {
    return str.replace(/[\s\S]/g, function (escape) {
        return '\\u' + ('0000' + escape.charCodeAt().toString(16)).slice(-4);
    });
}
include_1.runMain(async () => {
    childCommands_1.chdir(process.env.VSCODE_ROOT);
    /*
        const stream = new Transform({
            transform(this: Transform, chunk: string | Buffer, encoding: string, callback: Function) {
                this.push(chunk, encoding);
                callback();
            },
        });
        setInterval(() => {
            stream.write(`${new Date} ~ ${Math.random()}`);
        }, 1000);

        handleStream(stream);
        */
    const r = stringWidth_1.codePointWidth('👍🏽😂啊aaaa');
    console.log(unicodeEscape(r.data), r);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlcGFyZS1kZXZlbG9wbWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInByZXBhcmUtZGV2ZWxvcG1lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw4REFBbUQ7QUFDbkQsa0RBQW1FO0FBQ25FLDBEQUEwRDtBQUMxRCw4QkFBOEI7QUFFOUIsNEJBQWtCLEVBQUUsQ0FBQztBQUVyQixTQUFTLGFBQWEsQ0FBQyxHQUFXO0lBQ2pDLE9BQU8sR0FBRyxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsVUFBVSxNQUFNO1FBQzdDLE9BQU8sS0FBSyxHQUFHLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN0RSxDQUFDLENBQUMsQ0FBQztBQUNKLENBQUM7QUFFRCxpQkFBTyxDQUFDLEtBQUssSUFBSSxFQUFFO0lBQ2xCLHFCQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUMvQjs7Ozs7Ozs7Ozs7O1VBWUc7SUFFSCxNQUFNLENBQUMsR0FBRyw0QkFBYyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ3hDLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUN2QyxDQUFDLENBQUMsQ0FBQyJ9