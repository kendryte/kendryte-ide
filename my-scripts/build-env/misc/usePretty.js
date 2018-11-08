"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stillalive_1 = require("@gongt/stillalive");
const globalOutput_1 = require("./globalOutput");
const myBuildSystem_1 = require("./myBuildSystem");
const streamUtil_1 = require("./streamUtil");
function usePretty(save, opts) {
    const stream = stillalive_1.startWorking();
    globalOutput_1.useThisStream(stream);
    Object.assign(stream, { noEnd: true });
    myBuildSystem_1.mainDispose((error) => {
        globalOutput_1.useThisStream(process.stderr);
        if (error) {
            stream.fail(error.message);
        }
        stream.end();
        return streamUtil_1.streamPromise(stream);
    });
    if (save) {
        stream.pipe(myBuildSystem_1.useWriteFileStream(`logs/${save}.log`), { end: true });
    }
    return stream;
}
exports.usePretty = usePretty;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlUHJldHR5LmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJidWlsZC1lbnYvbWlzYy91c2VQcmV0dHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxrREFBaUY7QUFDakYsaURBQStDO0FBQy9DLG1EQUFrRTtBQUNsRSw2Q0FBNkM7QUFFN0MsU0FBZ0IsU0FBUyxDQUFDLElBQWEsRUFBRSxJQUFnQjtJQUN4RCxNQUFNLE1BQU0sR0FBRyx5QkFBWSxFQUFFLENBQUM7SUFDOUIsNEJBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN0QixNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxFQUFDLEtBQUssRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO0lBQ3JDLDJCQUFXLENBQUMsQ0FBQyxLQUFZLEVBQUUsRUFBRTtRQUM1Qiw0QkFBYSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM5QixJQUFJLEtBQUssRUFBRTtZQUNWLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQzNCO1FBQ0QsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ2IsT0FBTywwQkFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzlCLENBQUMsQ0FBQyxDQUFDO0lBRUgsSUFBSSxJQUFJLEVBQUU7UUFDVCxNQUFNLENBQUMsSUFBSSxDQUFDLGtDQUFrQixDQUFDLFFBQVEsSUFBSSxNQUFNLENBQUMsRUFBRSxFQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO0tBQ2pFO0lBRUQsT0FBTyxNQUFNLENBQUM7QUFDZixDQUFDO0FBbEJELDhCQWtCQyJ9