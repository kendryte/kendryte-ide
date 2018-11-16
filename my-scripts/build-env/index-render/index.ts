import { OutputStreamControl } from '@gongt/stillalive';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { PLATFORM_STR_LINUX, PLATFORM_STR_MAC, PLATFORM_STR_WINDOWS } from '../codeblocks/platform';
import { TYPE_LINUX_SFX, TYPE_LINUX_ZIP, TYPE_MAC_SFX, TYPE_MAC_ZIP, TYPE_WINDOWS_SFX, TYPE_WINDOWS_ZIP } from '../codeblocks/zip.name';
import { calcPackageAwsKey, calcReleaseFileAwsKey } from '../misc/awsUtil';
import { getPackageData } from '../misc/fsUtil';
import { createCard } from './components/card';
import { createReleaseDownload, createUpdateDownload } from './components/createDownload';
import { buildHead } from './components/head';
import { notSupportHtml } from './components/not-supported';
import { wrapTable } from './components/wrapTable';

export async function createIndexFileContent(output: OutputStreamControl): Promise<string> {
	const pkg = getPackageData();
	const config = {
		versionString: `v${pkg.version} (${pkg.patchVersion})`,
		windows: {
			sfx: calcReleaseFileAwsKey(PLATFORM_STR_WINDOWS, TYPE_WINDOWS_SFX),
			zip: calcReleaseFileAwsKey(PLATFORM_STR_WINDOWS, TYPE_WINDOWS_ZIP),
		},
		windowsPackage: {
			sfx: calcPackageAwsKey(PLATFORM_STR_WINDOWS, TYPE_WINDOWS_SFX),
			zip: calcPackageAwsKey(PLATFORM_STR_WINDOWS, TYPE_WINDOWS_ZIP),
		},
		linux: {
			sfx: calcReleaseFileAwsKey(PLATFORM_STR_LINUX, TYPE_LINUX_SFX),
			zip: calcReleaseFileAwsKey(PLATFORM_STR_LINUX, TYPE_LINUX_ZIP),
		},
		linuxPackage: {
			sfx: calcPackageAwsKey(PLATFORM_STR_LINUX, TYPE_LINUX_SFX),
			zip: calcPackageAwsKey(PLATFORM_STR_LINUX, TYPE_LINUX_ZIP),
		},
		mac: {
			sfx: calcReleaseFileAwsKey(PLATFORM_STR_MAC, TYPE_MAC_SFX),
			zip: calcReleaseFileAwsKey(PLATFORM_STR_MAC, TYPE_MAC_ZIP),
		},
		macPackage: {
			sfx: calcPackageAwsKey(PLATFORM_STR_MAC, TYPE_MAC_SFX),
			zip: calcPackageAwsKey(PLATFORM_STR_MAC, TYPE_MAC_ZIP),
		},
	};
	output.log('generating index content...\n\nconfig = %j', config);
	const pieces: string[] = [
		'<!DOCTYPE html>',
		'<html>',
	];
	
	output.log('download styles...');
	await buildHead(pieces);
	
	pieces.push(`<body class="en container">`);
	pieces.push(readFileSync(resolve(__dirname, 'components/intro.html'), 'utf8'));
	pieces.push(notSupportHtml());
	pieces.push('<div id="platformContainer" class="row">');
	
	output.log('calculating files...');
	pieces.push(
		createCard('Windows', config.versionString,
			wrapTable('application', await createReleaseDownload(config.windows)),
			wrapTable('packages', await createUpdateDownload(config.windowsPackage)),
		),
		createCard('Linux', config.versionString,
			wrapTable('application', await createReleaseDownload(config.linux)),
			wrapTable('packages', await createUpdateDownload(config.linuxPackage)),
		),
		createCard('Mac', config.versionString,
			wrapTable('application', await createReleaseDownload(config.mac)),
			wrapTable('packages', await createUpdateDownload(config.macPackage)),
		),
	);
	
	pieces.push('</div>');
	
	const scriptFile = resolve(__dirname, 'components/script.ts');
	const scriptData = require('typescript').transpile(
		readFileSync(scriptFile, 'utf8'),
		{
			lib: ['esnext', 'dom'],
		},
	);
	pieces.push(`<script type="text/javascript">${scriptData}</script>`);
	
	pieces.push('</body>');
	pieces.push('</html>');
	
	output.log('generated index content.');
	return pieces.join('\n');
}