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
async function downloadFile(output, oldPackageAt, oldPackageLocal) {
    output.writeln(`downloading file: ${oldPackageLocal}\n  save to: ${oldPackageAt}`);
    if (fsUtil_1.isExists(oldPackageLocal)) {
        output.writeln(`already exists...`);
        return;
    }
    await fs_extra_1.mkdirp(path_1.dirname(oldPackageLocal));
    const hasWget = await asyncUtil_1.promiseToBool(complex_1.muteCommandOut('wget', '--version'));
    const saveTo = fs_1.createWriteStream(oldPackageLocal + '.partial', { autoClose: true });
    if (hasWget) {
        await complex_1.pipeCommandBoth(saveTo, output.screen, 'wget', '-O', '-', '--progress=bar:force');
        await streamUtil_1.streamPromise(saveTo);
    }
    else {
        await nodeDown(output, oldPackageAt, saveTo);
    }
    await fsUtil_1.rename(oldPackageLocal + '.partial', oldPackageLocal);
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
        output.screen.writeln('downloading [%s%]: %s/%s MB - %sKB/s', state.percent, (state.size.transferred / 1024 / 1024).toFixed(2), (state.size.total / 1024 / 1024).toFixed(2), (state.speed / 1024).toFixed(2));
    }).pipe(saveTo);
    return streamUtil_1.streamPromise(saveTo);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG93bmxvYWRGaWxlLmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJidWlsZC1lbnYvY29kZWJsb2Nrcy9kb3dubG9hZEZpbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSwyQkFBdUM7QUFDdkMsdUNBQWtDO0FBQ2xDLCtCQUErQjtBQUMvQixxREFBMEU7QUFDMUUsaURBQWtEO0FBQ2xELDJDQUFrRDtBQUNsRCxtREFBbUQ7QUFFbkQsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ25DLE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0FBRXRDLEtBQUssVUFBVSxZQUFZLENBQUMsTUFBMkIsRUFBRSxZQUFvQixFQUFFLGVBQXVCO0lBQzVHLE1BQU0sQ0FBQyxPQUFPLENBQUMscUJBQXFCLGVBQWUsZ0JBQWdCLFlBQVksRUFBRSxDQUFDLENBQUM7SUFDbkYsSUFBSSxpQkFBUSxDQUFDLGVBQWUsQ0FBQyxFQUFFO1FBQzlCLE1BQU0sQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQztRQUNwQyxPQUFPO0tBQ1A7SUFFRCxNQUFNLGlCQUFNLENBQUMsY0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7SUFFdkMsTUFBTSxPQUFPLEdBQUcsTUFBTSx5QkFBYSxDQUFDLHdCQUFjLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUM7SUFDekUsTUFBTSxNQUFNLEdBQUcsc0JBQWlCLENBQUMsZUFBZSxHQUFHLFVBQVUsRUFBRSxFQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO0lBQ2xGLElBQUksT0FBTyxFQUFFO1FBQ1osTUFBTSx5QkFBZSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLHNCQUFzQixDQUFDLENBQUM7UUFDeEYsTUFBTSwwQkFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQzVCO1NBQU07UUFDTixNQUFNLFFBQVEsQ0FBQyxNQUFNLEVBQUUsWUFBWSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0tBQzdDO0lBRUQsTUFBTSxlQUFNLENBQUMsZUFBZSxHQUFHLFVBQVUsRUFBRSxlQUFlLENBQUMsQ0FBQztBQUM3RCxDQUFDO0FBbkJELG9DQW1CQztBQUVELFNBQVMsUUFBUSxDQUFDLE1BQTJCLEVBQUUsSUFBWSxFQUFFLE1BQTZCO0lBQ3pGLHNEQUFzRDtJQUN0RCxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO0lBQ3ZCLGtHQUFrRztJQUNsRywrRkFBK0Y7SUFDL0YseUZBQXlGO0tBQ3pGLENBQUMsQ0FBQyxFQUFFLENBQUMsVUFBVSxFQUFFLFVBQVUsS0FBSztRQUNoQywrQ0FBK0M7UUFDL0MsSUFBSTtRQUNKLHNFQUFzRTtRQUN0RSxxRUFBcUU7UUFDckUsY0FBYztRQUNkLHFFQUFxRTtRQUNyRSwyRUFBMkU7UUFDM0UsU0FBUztRQUNULGNBQWM7UUFDZCw0RkFBNEY7UUFDNUYsa0ZBQWtGO1FBQ2xGLFFBQVE7UUFDUixJQUFJO1FBQ0osTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQ3BCLHNDQUFzQyxFQUN0QyxLQUFLLENBQUMsT0FBTyxFQUNiLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFDakQsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUMzQyxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUMvQixDQUFDO0lBQ0gsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2hCLE9BQU8sMEJBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUM5QixDQUFDIn0=