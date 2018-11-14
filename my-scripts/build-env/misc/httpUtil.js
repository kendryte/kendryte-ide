"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const http_1 = require("http");
const https_1 = require("https");
const path_1 = require("path");
const url_1 = require("url");
const statusHash_1 = require("../codeblocks/statusHash");
const fsUtil_1 = require("./fsUtil");
const streamUtil_1 = require("./streamUtil");
function request(url, options, callback) {
    const request = url.startsWith('https') ? https_1.request : http_1.request;
    const uri = url_1.parse(url);
    return request({
        ...options,
        host: uri.host,
        port: uri.port,
        path: uri.path,
    }, callback);
}
exports.request = request;
function requestPromise(url, options) {
    return new Promise((resolve, reject) => {
        request(url, options, (res) => {
            resolve(res);
        }).end();
    });
}
exports.requestPromise = requestPromise;
async function getWithCache(url) {
    const hash = statusHash_1.md5(url);
    const cache = path_1.resolve(process.env.TEMP, 'hash');
    if (await fsUtil_1.isExists(cache)) {
        return await fsUtil_1.readFile(cache);
    }
    const fd = await fsUtil_1.open(cache, 'w');
    fs_1.ftruncateSync(fd);
    const write = fs_1.createWriteStream(cache, { fd });
    const collect = new streamUtil_1.CollectingStream();
    const res = await requestPromise(url, {});
    res.pipe(write);
    res.pipe(collect);
    await streamUtil_1.streamPromise(write);
    await fsUtil_1.close(fd).catch(() => void 0);
    return collect.promise();
}
exports.getWithCache = getWithCache;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHR0cFV0aWwuanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbImJ1aWxkLWVudi9taXNjL2h0dHBVdGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMkJBQXNEO0FBQ3RELCtCQUErRDtBQUMvRCxpQ0FBZ0U7QUFDaEUsK0JBQStCO0FBQy9CLDZCQUE0QjtBQUM1Qix5REFBK0M7QUFDL0MscUNBQTJEO0FBQzNELDZDQUErRDtBQUUvRCxTQUFnQixPQUFPLENBQUMsR0FBVyxFQUFFLE9BQXVCLEVBQUUsUUFBeUM7SUFDdEcsTUFBTSxPQUFPLEdBQUcsR0FBRyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQSxDQUFDLENBQUMsZUFBWSxDQUFDLENBQUMsQ0FBQyxjQUFXLENBQUM7SUFDcEUsTUFBTSxHQUFHLEdBQUcsV0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3ZCLE9BQU8sT0FBTyxDQUFDO1FBQ2QsR0FBRyxPQUFPO1FBQ1YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJO1FBQ2QsSUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJO1FBQ2QsSUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJO0tBQ2QsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUNkLENBQUM7QUFURCwwQkFTQztBQUVELFNBQWdCLGNBQWMsQ0FBQyxHQUFXLEVBQUUsT0FBdUI7SUFDbEUsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtRQUN0QyxPQUFPLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFO1lBQzdCLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNkLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ1YsQ0FBQyxDQUFDLENBQUM7QUFDSixDQUFDO0FBTkQsd0NBTUM7QUFFTSxLQUFLLFVBQVUsWUFBWSxDQUFDLEdBQVc7SUFDN0MsTUFBTSxJQUFJLEdBQUcsZ0JBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN0QixNQUFNLEtBQUssR0FBRyxjQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDaEQsSUFBSSxNQUFNLGlCQUFRLENBQUMsS0FBSyxDQUFDLEVBQUU7UUFDMUIsT0FBTyxNQUFNLGlCQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDN0I7SUFFRCxNQUFNLEVBQUUsR0FBRyxNQUFNLGFBQUksQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDbEMsa0JBQWEsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNsQixNQUFNLEtBQUssR0FBRyxzQkFBaUIsQ0FBQyxLQUFLLEVBQUUsRUFBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDO0lBQzdDLE1BQU0sT0FBTyxHQUFHLElBQUksNkJBQWdCLEVBQUUsQ0FBQztJQUV2QyxNQUFNLEdBQUcsR0FBRyxNQUFNLGNBQWMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDMUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNoQixHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBRWxCLE1BQU0sMEJBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUUzQixNQUFNLGNBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUVwQyxPQUFPLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUMxQixDQUFDO0FBckJELG9DQXFCQyJ9