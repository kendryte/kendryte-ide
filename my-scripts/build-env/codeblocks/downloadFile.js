"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const complex_1 = require("../childprocess/complex");
const asyncUtil_1 = require("../misc/asyncUtil");
const fsUtil_1 = require("../misc/fsUtil");
const streamUtil_1 = require("../misc/streamUtil");
const request = require('request');
const progress = require('request-progress');
async function downloadFile(output, localSave, url) {
    output.writeln(`downloading file: ${url}\n  save to: ${localSave}`);
    if (fsUtil_1.isExists(url)) {
        output.writeln(`already exists...`);
        return;
    }
    await fs_extra_1.mkdirp(path_1.dirname(url));
    const hasWget = await asyncUtil_1.promiseToBool(complex_1.muteCommandOut('wget', '--version'));
    const saveTo = fs_1.createWriteStream(url + '.partial', { autoClose: true });
    if (hasWget) {
        await complex_1.pipeCommandBoth(saveTo, output.screen, 'wget', '-O', '-', '--progress=bar:force');
        await streamUtil_1.streamPromise(saveTo);
    }
    else {
        await nodeDown(output, localSave, saveTo);
    }
    await fsUtil_1.rename(url + '.partial', url);
}
exports.downloadFile = downloadFile;
function nodeDown(output, from, saveTo) {
    // The options argument is optional so you can omit it
    progress(request(from), {
    // throttle: 2000,                    // Throttle the progress event to 2000ms, defaults to 1000ms
    // delay: 1000,                       // Only start to emit after 1000ms delay, defaults to 0ms
    // lengthHeader: 'x-transfer-length'  // Length header to use, defaults to content-length
    }).on('progress', function (state) {
        // The state is an object that looks like this:
        // {
        //     percent: 0.5,               // Overall percent (between 0 to 1)
        //     speed: 554732,              // The download speed in bytes/sec
        //     size: {
        //         total: 90044871,        // The total payload size in bytes
        //         transferred: 27610959   // The transferred payload size in bytes
        //     },
        //     time: {
        //         elapsed: 36.235,        // The total elapsed seconds since the start (3 decimals)
        //         remaining: 81.403       // The remaining seconds to finish (3 decimals)
        //     }
        // }
        output.screen.log('downloading [%s%]: %s/%s MB - %sKB/s', state.percent, (state.size.transferred / 1024 / 1024).toFixed(2), (state.size.total / 1024 / 1024).toFixed(2), (state.speed / 1024).toFixed(2));
    }).pipe(saveTo);
    return streamUtil_1.streamPromise(saveTo);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG93bmxvYWRGaWxlLmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJidWlsZC1lbnYvY29kZWJsb2Nrcy9kb3dubG9hZEZpbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSwyQkFBdUM7QUFDdkMsdUNBQWtDO0FBQ2xDLCtCQUErQjtBQUMvQixxREFBMEU7QUFDMUUsaURBQWtEO0FBQ2xELDJDQUFrRDtBQUNsRCxtREFBbUQ7QUFFbkQsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ25DLE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0FBRXRDLEtBQUssVUFBVSxZQUFZLENBQUMsTUFBMkIsRUFBRSxTQUFpQixFQUFFLEdBQVc7SUFDN0YsTUFBTSxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsR0FBRyxnQkFBZ0IsU0FBUyxFQUFFLENBQUMsQ0FBQztJQUNwRSxJQUFJLGlCQUFRLENBQUMsR0FBRyxDQUFDLEVBQUU7UUFDbEIsTUFBTSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1FBQ3BDLE9BQU87S0FDUDtJQUVELE1BQU0saUJBQU0sQ0FBQyxjQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUUzQixNQUFNLE9BQU8sR0FBRyxNQUFNLHlCQUFhLENBQUMsd0JBQWMsQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQztJQUN6RSxNQUFNLE1BQU0sR0FBRyxzQkFBaUIsQ0FBQyxHQUFHLEdBQUcsVUFBVSxFQUFFLEVBQUMsU0FBUyxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7SUFDdEUsSUFBSSxPQUFPLEVBQUU7UUFDWixNQUFNLHlCQUFlLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsc0JBQXNCLENBQUMsQ0FBQztRQUN4RixNQUFNLDBCQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDNUI7U0FBTTtRQUNOLE1BQU0sUUFBUSxDQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7S0FDMUM7SUFFRCxNQUFNLGVBQU0sQ0FBQyxHQUFHLEdBQUcsVUFBVSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ3JDLENBQUM7QUFuQkQsb0NBbUJDO0FBRUQsU0FBUyxRQUFRLENBQUMsTUFBMkIsRUFBRSxJQUFZLEVBQUUsTUFBNkI7SUFDekYsc0RBQXNEO0lBQ3RELFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7SUFDdkIsa0dBQWtHO0lBQ2xHLCtGQUErRjtJQUMvRix5RkFBeUY7S0FDekYsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxVQUFVLEVBQUUsVUFBVSxLQUFLO1FBQ2hDLCtDQUErQztRQUMvQyxJQUFJO1FBQ0osc0VBQXNFO1FBQ3RFLHFFQUFxRTtRQUNyRSxjQUFjO1FBQ2QscUVBQXFFO1FBQ3JFLDJFQUEyRTtRQUMzRSxTQUFTO1FBQ1QsY0FBYztRQUNkLDRGQUE0RjtRQUM1RixrRkFBa0Y7UUFDbEYsUUFBUTtRQUNSLElBQUk7UUFDSixNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FDaEIsc0NBQXNDLEVBQ3RDLEtBQUssQ0FBQyxPQUFPLEVBQ2IsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUNqRCxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQzNDLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQy9CLENBQUM7SUFDSCxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDaEIsT0FBTywwQkFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzlCLENBQUMifQ==