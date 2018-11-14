import { OutputStreamControl } from '@gongt/stillalive';
import { S3 } from 'aws-sdk';
import { ClientConfiguration } from 'aws-sdk/clients/s3';
import { createReadStream } from 'fs';
import { format, promisify } from 'util';
import { getPackageData, getProductData } from './fsUtil';
import { globalLog } from './globalOutput';
import { hashStream } from './hashUtil';
import { CollectingStream } from './streamUtil';

const {loadCredentialsFromEnv, loadCredentialsFromIniFile, loadRegionFromEnv, loadRegionFromIniFile} = require('awscred');
require('awscred').credentialsCallChain = [loadCredentialsFromEnv, loadCredentialsFromIniFile];
require('awscred').regionCallChain = [loadRegionFromEnv, loadRegionFromIniFile];
const loadCredentialsAndRegion = promisify(require('awscred').loadCredentialsAndRegion);

export const OBJKEY_IDE_JSON = 'release/IDE.json';
export const OBJKEY_DOWNLOAD_INDEX = 'release/download/index.html';

let s3: S3;

export function getDefaultBucket() {
	return getProductData().applicationName;
}

export function bucketUrl(Key: string, Bucket: string = getDefaultBucket()) {
	return `http://s3.${s3.config.region}.amazonaws.com.cn/${Bucket}/${Key}`;
}

async function loadCred(output: OutputStreamControl, home: string): Promise<Partial<ClientConfiguration>> {
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

export async function initS3(output: OutputStreamControl) {
	if (s3) {
		return;
	}
	const awsConfig = await loadCred(output, process.env.HOME) || await loadCred(output, process.env.ORIGINAL_HOME);
	if (!awsConfig) {
		throw new Error('Not able to load AWS config. see https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/setup-credentials.html');
	}
	
	s3 = new S3({
		...awsConfig,
		
		logger: {
			write: output.write.bind(output),
			log(...messages: any[]) {
				output.writeln((format as any)(...messages));
			},
		},
	});
}

export function getS3(): S3 {
	return s3;
}

export function s3LoadText(Key: string, Bucket: string = getDefaultBucket()): Promise<string> {
	globalLog('[S3] getText -> %s :: %s', Bucket, Key);
	return s3.getObject({Bucket, Key})
	         .createReadStream()
	         .pipe(new CollectingStream(), {end: true})
	         .promise();
}

export async function s3LoadJson<T>(Key: string, Bucket: string = getDefaultBucket()): Promise<T> {
	globalLog('[S3] getJson -> %s :: %s', Bucket, Key);
	const json = await s3.getObject({Bucket, Key})
	                     .createReadStream()
	                     .pipe(new CollectingStream(), {end: true})
	                     .promise();
	return JSON.parse(json) as any;
}

export interface S3Upload<T> {
	stream: T;
	mime: string;
}

export async function s3UploadBuffer(data: S3Upload<Buffer>, Key: string, Bucket: string = getDefaultBucket()) {
	globalLog('[S3] upload -> %s :: %s', Bucket, Key);
	await new Promise<string>((resolve, reject) => {
		s3.upload(
			{ACL: 'public-read', Bucket, Key, Body: data.stream, ContentType: data.mime},
			{partSize: 10 * 1024 * 1024, queueSize: 4},
			(err, data) => err? reject(err) : resolve(data.Location),
		);
	});
}

export async function s3UploadFile(
	output: OutputStreamControl,
	Key: string,
	data: S3Upload<string>,
	Bucket: string = getDefaultBucket(),
) {
	const md5 = await hashStream(createReadStream(data.stream));
	await s3UploadBuffer(
		{
			stream: Buffer.from(md5),
			mime: 'text/plain',
		},
		Key + '.md5',
	);
	await s3UploadStream(
		output,
		{
			stream: createReadStream(data.stream),
			mime: data.mime,
		},
		Key,
	);
}

export async function s3UploadStream(
	output: OutputStreamControl,
	data: S3Upload<NodeJS.ReadableStream>,
	Key: string,
	Bucket: string = getDefaultBucket(),
) {
	globalLog('[S3] upload -> %s :: %s', Bucket, Key);
	await new Promise<string>((resolve, reject) => {
		const mup = s3.upload(
			{ACL: 'public-read', Bucket, Key, Body: data.stream, ContentType: data.mime},
			{partSize: 10 * 1024 * 1024, queueSize: 4},
			(err, data) => err? reject(err) : resolve(data.Location),
		);
		
		mup.on('httpUploadProgress', ({loaded, total}) => {
			output.screen.writeln(`${loaded} / ${total}`);
		});
	});
}

export function s3DownloadStream(Key: string, Bucket: string = getDefaultBucket()): NodeJS.ReadableStream {
	globalLog('[S3] download <- %s :: %s', Bucket, Key);
	return s3.getObject(
		{Bucket, Key},
	).createReadStream();
}

export function calcReleaseFileAwsKey(platform: string, type: string): string {
	const product = getProductData();
	const packageJson = getPackageData();
	
	const pv = ('' + packageJson.patchVersion).replace(/\./g, '');
	return `release/download/${product.quality}/v${packageJson.version}/${platform}.${pv}.${type}`;
}

export function calcPackageAwsKey(platform: string, type: string): string {
	const product = getProductData();
	return `release/download/${product.quality}/${platform}.offlinepackages.${type}`;
}
