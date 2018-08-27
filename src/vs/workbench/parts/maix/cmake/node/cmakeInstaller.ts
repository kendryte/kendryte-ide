import decompress = require('decompress');
import Github = require('@octokit/rest');
import request_progress = require('request-progress');
import url_exists = require('url-exists');
import * as semver from 'semver';
import { dirname, resolve } from 'path';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { createWriteStream, existsSync, lstat, readdir, unlink } from 'fs';
import { ConfigurationTarget, IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { CMAKE_PATH_CONFIG_ID, CMAKE_USE_SERVER_CONFIG_ID } from 'vs/workbench/parts/maix/cmake/common/config';
import { execFile } from 'child_process';
import { TPromise } from 'vs/base/common/winjs.base';
import { promisify } from 'util';
import { executableExtension, is64Bit } from 'vs/workbench/parts/maix/_library/node/versions';
import { isLinux, isMacintosh, isWindows } from 'vs/base/common/platform';
import { IProgressService2, IProgressStep, ProgressLocation } from 'vs/workbench/services/progress/common/progress';
import { IProgress } from 'vs/platform/progress/common/progress';
import { CancellationToken, CancellationTokenSource } from 'vs/base/common/cancellation';
import { getInstallPath } from 'vs/workbench/parts/maix/_library/node/nodePath';
import { get } from 'request';
import { mkdirp } from 'vs/base/node/extfs';
import { IStatusbarService } from 'vs/platform/statusbar/common/statusbar';

const lstat_ = promisify(lstat);
const readdir_ = promisify(readdir);
const execFile_ = (file: string, args?: string[]): TPromise<{ stderr: string, stdout: string }> => {
	return new TPromise((resolve, reject) => {
		execFile(file, args, {
			encoding: 'utf8',
			windowsHide: false,
		}, (error, stdout, stderr) => {
			if (error) {
				reject(error);
			} else {
				resolve({ stdout, stderr });
			}
		});
	});
};
const unlink_ = promisify(unlink);

const INSTALL_PROGRESS_TITLE = 'Installing CMake';

export class CMakeInstaller {
	public readonly CMakeDownloadPath: string;

	constructor(
		@IEnvironmentService protected environmentService: IEnvironmentService,
		@IConfigurationService protected configurationService: IConfigurationService,
		@IProgressService2 protected progressService: IProgressService2,
		@IStatusbarService protected statusbarService: IStatusbarService,
	) {
		this.CMakeDownloadPath = resolve(getInstallPath(environmentService), 'packages/cmake');
		console.log('cmake download path is: %s', this.CMakeDownloadPath);
	}

	async installAtLeastOneCmake() {
		const installedVers = await this.getInstalledCMakeVersions();
		if (installedVers && installedVers.length) {
			console.log('found %d installed cmake.', installedVers.length);
			const exeFile = installedVers[0].path;
			const lstat = await lstat_(exeFile);
			if (lstat.isFile()) {
				return exeFile;
			} else {
				console.log('%cinstalled cmake not found: %s.', 'color:red', exeFile);
			}
		}
		console.log('no valid cmake found.');

		await this.configurationService.updateValue(CMAKE_PATH_CONFIG_ID, '', ConfigurationTarget.USER);

		return await this.progressService.withProgress({
			location: ProgressLocation.Notification,
			title: INSTALL_PROGRESS_TITLE,
			cancellable: false,
		}, async (reporter) => {
			console.log('install cmake.');
			reporter.report({ message: 'getting versions...', increment: -1 });
			const availableVers = await this.getRemoteCMakeVersionNames(true);
			// console.log('cmake exists versions:', availableVers);

			if (availableVers.length === 0) {
				throw new Error('Failed to download CMake: No Versions.');
			}

			for (const versionToDownload of availableVers) {
				try {
					return await this._downloadAndInstallCMake(versionToDownload, reporter);
				} catch (e) {
					console.error(e.stack);
				}
			}
			return null;
		});
	}

	/** path is to cmake.exe */
	async getInstalledCMakeVersions(): Promise<{ version: string, path: string }[]> {
		await this.initCMakeDownloadDir();

		const cmakeDirs = await readdir_(this.CMakeDownloadPath);
		const validCMakeExec: string[] = [];

		for (const file of cmakeDirs) {
			const cmakeExe = resolve(this.CMakeDownloadPath, file, 'bin/cmake' + executableExtension);
			try {
				const lstat = await lstat_(cmakeExe);
				if (lstat.isFile()) {
					validCMakeExec.push(cmakeExe);
				}
			} catch (e) {
			}
		}
		if (cmakeDirs === null || cmakeDirs.length < 1) {
			return null;
		}

		const ret = [];
		for (const exePath of validCMakeExec) {
			try {
				const version = await this.computeCMakeVersion(exePath);
				if (version) {
					ret.push({
						version,
						path: exePath,
					});
				} else {
					console.error('executable file %s is not valid cmake: --version output not parsable', exePath);
				}
			} catch (e) {
				console.error('executable file %s is not valid cmake: %s', exePath, e.message);
			}
		}

		return ret;
	}

	protected async computeCMakeVersion(cmakeExecutable: string): TPromise<string> {
		const { stdout, stderr } = await execFile_(cmakeExecutable, ['--version']);

		process.stdout.write(stdout);
		process.stderr.write(stderr);

		// sample outputs: (obtained after some trial&error)
		//  cmake version 2.4-patch 2 (the last "2" won't be matched...)
		//  cmake version 3.9.0-rc1
		//  cmake version 3.5.1
		const cmakeVersion = (stdout + stderr).match(/cmake\s+version\s+([0-9]+\.[0-9]+(\.[0-9]+)?\S*)/i);
		if (cmakeVersion === null || cmakeVersion.length < 2) {
			return null;
		}
		return cmakeVersion[1];
	}

	protected async initCMakeDownloadDir() {
		if (!existsSync(this.CMakeDownloadPath)) {
			console.log(`created path: ${this.CMakeDownloadPath} `);
			await mkdirp(this.CMakeDownloadPath);
		}
	}

	async getRemoteCMakeVersionNames(paging: boolean): Promise<string[]> {
		let ghClient = new Github({
			headers: {
				// https://developer.github.com/v3/#user-agent-required
				'user-agent': 'vscode',
				//, 'Authorization': 'token MY_SECRET_TOKEN'  // TODO remove me
			},
		});

		let tags: string[] = [];

		let res = await ghClient.gitdata.getTags({
			owner: 'Kitware',
			repo: 'CMake',
			per_page: 10,
		});
		tags.push(...res.data.map(t => t.ref));

		while (paging && ghClient.hasNextPage(res as any)) {
			res = await ghClient.getNextPage(res as any);
			tags.push(...res.data.map(t => t.ref));
		}

		tags = tags.map(t => semver['coerce'](t.replace('refs/tags/', ''))).filter(e => !!e);
		tags.sort(semver.rcompare);

		return tags.map(e => e.toString());
	}

	downloadAndInstallCMake(versionName: string) {
		const cancel = new CancellationTokenSource();
		const p = this.progressService.withProgress({
			location: ProgressLocation.Notification,
			title: INSTALL_PROGRESS_TITLE,
			cancellable: true,
		}, (reporter: IProgress<IProgressStep>) => {
			return this._downloadAndInstallCMake(versionName, reporter, cancel.token);
		}, () => {
			cancel.cancel();
		});
		p.then((data) => {
			cancel.dispose();
			return data;
		}, (err) => {
			if (cancel.token.isCancellationRequested) {
				cancel.dispose();
				return;
			}
			cancel.dispose();
			throw err;
		});
		return p;
	}

	protected async detectPath(versionName: string): TPromise<string | void> {
		for (const { version, path } of await this.getInstalledCMakeVersions()) {
			if (version === versionName) {
				return path;
			}
		}
	}

	/** return the cmake.exe path */
	private async _downloadAndInstallCMake(versionName: string, reporter: IProgress<IProgressStep>, cancelToken: CancellationToken = null) {
		console.log('downloading cmake version: %s', versionName);
		const versionNumber = versionName.replace(/^v/, '');
		const [versionMajor, versionMinor] = versionNumber.split('.');
		const versionDirUrl = `http://cmake.org/files/v${versionMajor}.${versionMinor}/`;
		const fileNameBase = `cmake-${versionNumber}-`;

		const platformExt = isWindows ? '.zip' : '.tar.gz';
		let packageName: string;
		if (isWindows) {
			packageName = is64Bit ? 'win64-x64' : 'win32-x86';
		} else if (isLinux) {
			packageName = is64Bit ? 'Linux-x86_64' : 'Linux-i386';
		} else if (isMacintosh) {
			packageName = is64Bit ? 'Darwin-x86_64' : 'Darwin-universal';
		} else {
			throw new Error('Your platform is not supported.');
		}

		const fileName = `${fileNameBase}${packageName}${platformExt}`;
		const fileUrl = `${versionDirUrl}${fileName}`;
		const filePath = resolve(this.CMakeDownloadPath, fileName);

		const [exists, err] = await new Promise<[boolean, Error]>((resolve) => {
			url_exists(fileUrl, (err, exists) => resolve([exists, err]));
			reporter.report({ message: 'checking url: ' + fileUrl, increment: -1 });
		});
		this.checkCancel(cancelToken);
		if (!exists) {
			const errMsg = `The precompiled CMake archive [${fileUrl}] does not exist [Error: ${err}]`;
			console.error(errMsg);
			throw new Error('Precompiled CMake archive do not exist.');
		}

		reporter.report({ message: 'requesting...' + fileUrl, increment: 0 });
		const request = get(fileUrl);
		const requestState = request_progress(request, {});
		let lastPercent = 0;
		requestState.on('progress', (state: ProgressReport) => {
			const progPercent = (state.percent * 100).toFixed(0) + '%';
			const progSpeed = ((state.speed / 1024) / 8).toFixed(2) + ' KB/s';
			const thisPercent = Math.floor(state.percent * 100);
			reporter.report({ message: `${progPercent} @ ${progSpeed}`, increment: thisPercent - lastPercent });
			lastPercent = thisPercent;
		});

		await new Promise((resolve, reject) => {
			requestState.on('error', e => {
				// Do something with err
				reject(new Error(`Error when downloading ${fileUrl}. ${e}`));
			});
			requestState.on('end', () => {
				resolve();
			});
			requestState.pipe(createWriteStream(filePath));
		});
		if (cancelToken) {
			cancelToken.onCancellationRequested(_ => request.abort());
		}
		this.checkCancel(cancelToken);

		reporter.report({ message: 'extracting...', increment: -1 });
		const extractedData = await decompress(filePath, this.CMakeDownloadPath);
		await unlink_(filePath);

		const extractionDir = extractedData[0].path.split(/[\/\\]/)[0];  // keep only the first "component" of the path
		const extractionPath = resolve(this.CMakeDownloadPath, extractionDir);

		const okMsg = `CMake v${versionNumber} installed in ${extractionPath}`;
		console.log(okMsg);
		this.statusbarService.setStatusMessage(okMsg, 4000);

		return resolve(extractionPath, `bin/cmake${executableExtension}`);
	}

	protected async setCurrent(version: string, path: string) {
		console.log('%cCMake is: %s', 'color:green', path);
		const useCMakeServer = semver.compare(version, '3.7.1') > 0;
		await this.configurationService.updateValue(CMAKE_USE_SERVER_CONFIG_ID, useCMakeServer, ConfigurationTarget.USER);
		await this.configurationService.updateValue(CMAKE_PATH_CONFIG_ID, path, ConfigurationTarget.USER);
	}

	protected checkCancel(cancel: CancellationToken) {
		if (cancel && cancel.isCancellationRequested) {
			throw new Error('canceled');
		}
	}

	getCurrentByCMakePath() {
		const exe = this.configurationService.getValue(CMAKE_PATH_CONFIG_ID) as string;
		return {
			cmake: exe,
			bins: dirname(exe),
			root: dirname(dirname(exe)),
		};
	}

	async setCurrentByCMakePath(path: string): TPromise<string | void> {
		const ver = await this.computeCMakeVersion(path);
		await this.setCurrent(ver, path);
		return ver;
	}
}