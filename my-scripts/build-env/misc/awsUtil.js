"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = require("aws-sdk");
const path_1 = require("path");
const util_1 = require("util");
const fsUtil_1 = require("./fsUtil");
const globalOutput_1 = require("./globalOutput");
const streamUtil_1 = require("./streamUtil");
const { loadCredentialsFromEnv, loadCredentialsFromIniFile, loadRegionFromEnv, loadRegionFromIniFile } = require('awscred');
require('awscred').credentialsCallChain = [loadCredentialsFromEnv, loadCredentialsFromIniFile];
require('awscred').regionCallChain = [loadRegionFromEnv, loadRegionFromIniFile];
const loadCredentialsAndRegion = util_1.promisify(require('awscred').loadCredentialsAndRegion);
exports.OBJKEY_IDE_JSON = 'release/IDE.json';
exports.OBJKEY_DOWNLOAD_INDEX = 'release/download/index.html';
let s3;
function getDefaultBucket() {
    return fsUtil_1.getProductData().applicationName;
}
exports.getDefaultBucket = getDefaultBucket;
function bucketUrl(Key, Bucket = getDefaultBucket()) {
    return `http://s3.${s3.config.region}.amazonaws.com.cn/${Bucket}/${Key}`;
}
exports.bucketUrl = bucketUrl;
async function loadCred(output, home) {
    output.writeln('try load aws key from ' + home);
    const saveHome = process.env.HOME;
    process.env.HOME = home;
    const p = loadCredentialsAndRegion();
    process.env.HOME = saveHome;
    return p.then((cfg) => {
        if (cfg) {
            output.success('success load config from ' + home);
        }
        return cfg;
    }, () => {
        output.writeln('not able to load.');
        return null;
    });
}
async function initS3(output) {
    if (s3) {
        return;
    }
    const awsConfig = await loadCred(output, process.env.HOME) || await loadCred(output, process.env.ORIGINAL_HOME);
    if (!awsConfig) {
        throw new Error('Not able to load AWS config. see https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/setup-credentials.html');
    }
    s3 = new aws_sdk_1.S3({
        ...awsConfig,
        logger: {
            write: output.write.bind(output),
            log(...messages) {
                output.writeln(util_1.format(...messages));
            },
        },
    });
}
exports.initS3 = initS3;
function getS3() {
    return s3;
}
exports.getS3 = getS3;
function s3LoadText(key, Bucket = getDefaultBucket()) {
    globalOutput_1.globalLog('[S3] getText -> %s :: %s', Bucket, key);
    return s3.getObject({ Bucket, Key: exports.OBJKEY_IDE_JSON })
        .createReadStream()
        .pipe(new streamUtil_1.CollectingStream(), { end: true })
        .promise();
}
exports.s3LoadText = s3LoadText;
async function s3LoadJson(key, Bucket = getDefaultBucket()) {
    globalOutput_1.globalLog('[S3] getJson -> %s :: %s', Bucket, key);
    const json = await s3.getObject({ Bucket, Key: exports.OBJKEY_IDE_JSON })
        .createReadStream()
        .pipe(new streamUtil_1.CollectingStream(), { end: true })
        .promise();
    return JSON.parse(json);
}
exports.s3LoadJson = s3LoadJson;
async function s3UploadStream(data, Key, Bucket = getDefaultBucket()) {
    globalOutput_1.globalLog('[S3] upload -> %s :: %s', Bucket, Key);
    await new Promise((resolve, reject) => {
        s3.upload({ ACL: 'public-read', Bucket, Key, Body: data.stream, ContentType: data.mime }, { partSize: 10 * 1024 * 1024, queueSize: 4 }, (err, data) => err ? reject(err) : resolve(data.Location));
    });
}
exports.s3UploadStream = s3UploadStream;
function s3DownloadStream(Key, Bucket = getDefaultBucket()) {
    globalOutput_1.globalLog('[S3] download <- %s :: %s', Bucket, Key);
    return s3.getObject({ Bucket, Key }).createReadStream();
}
exports.s3DownloadStream = s3DownloadStream;
function calcReleaseFileAwsKey(platform, type) {
    const product = fsUtil_1.getProductData();
    const packageJson = fsUtil_1.getPackageData();
    const pv = ('' + packageJson.patchVersion).replace(/\./g, '');
    return path_1.normalize(`release/download/${product.quality}/v${packageJson.version}/${platform}.${pv}.${type}`);
}
exports.calcReleaseFileAwsKey = calcReleaseFileAwsKey;
function calcPackageAwsKey(platform, type) {
    const product = fsUtil_1.getProductData();
    return path_1.normalize(`release/download/${product.quality}/${platform}.offlinepackages.${type}`);
}
exports.calcPackageAwsKey = calcPackageAwsKey;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXdzVXRpbC5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsiYnVpbGQtZW52L21pc2MvYXdzVXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLHFDQUE2QjtBQUU3QiwrQkFBaUM7QUFDakMsK0JBQXlDO0FBQ3pDLHFDQUEwRDtBQUMxRCxpREFBMkM7QUFDM0MsNkNBQWdEO0FBRWhELE1BQU0sRUFBQyxzQkFBc0IsRUFBRSwwQkFBMEIsRUFBRSxpQkFBaUIsRUFBRSxxQkFBcUIsRUFBQyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUMxSCxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsb0JBQW9CLEdBQUcsQ0FBQyxzQkFBc0IsRUFBRSwwQkFBMEIsQ0FBQyxDQUFDO0FBQy9GLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxlQUFlLEdBQUcsQ0FBQyxpQkFBaUIsRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO0FBQ2hGLE1BQU0sd0JBQXdCLEdBQUcsZ0JBQVMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsd0JBQXdCLENBQUMsQ0FBQztBQUUzRSxRQUFBLGVBQWUsR0FBRyxrQkFBa0IsQ0FBQztBQUNyQyxRQUFBLHFCQUFxQixHQUFHLDZCQUE2QixDQUFDO0FBRW5FLElBQUksRUFBTSxDQUFDO0FBRVgsU0FBZ0IsZ0JBQWdCO0lBQy9CLE9BQU8sdUJBQWMsRUFBRSxDQUFDLGVBQWUsQ0FBQztBQUN6QyxDQUFDO0FBRkQsNENBRUM7QUFFRCxTQUFnQixTQUFTLENBQUMsR0FBVyxFQUFFLFNBQWlCLGdCQUFnQixFQUFFO0lBQ3pFLE9BQU8sYUFBYSxFQUFFLENBQUMsTUFBTSxDQUFDLE1BQU0scUJBQXFCLE1BQU0sSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUMxRSxDQUFDO0FBRkQsOEJBRUM7QUFFRCxLQUFLLFVBQVUsUUFBUSxDQUFDLE1BQTJCLEVBQUUsSUFBWTtJQUNoRSxNQUFNLENBQUMsT0FBTyxDQUFDLHdCQUF3QixH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