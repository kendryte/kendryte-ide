/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

//@ts-check
'use strict';

// @ts-ignore
kendryteExtend();

//#region global bootstrapping

// increase number of stack frames(from 10, https://github.com/v8/v8/wiki/Stack-Trace-API)
Error.stackTraceLimit = 100;

// Workaround for Electron not installing a handler to ignore SIGPIPE
// (https://github.com/electron/electron/issues/13254)
// @ts-ignore
process.on('SIGPIPE', () => {
	console.error(new Error('Unexpected SIGPIPE'));
});

//#endregion

//#region Add support for redirecting the loading of node modules
exports.injectNodeModuleLookupPath = function (injectPath) {
	if (!injectPath) {
		throw new Error('Missing injectPath');
	}

	// @ts-ignore
	const Module = require('module');
	const path = require('path');

	const nodeModulesPath = path.join(__dirname, '../node_modules');

	// @ts-ignore
	const originalResolveLookupPaths = Module._resolveLookupPaths;

	// @ts-ignore
	Module._resolveLookupPaths = function (moduleName, parent, newReturn) {
		const result = originalResolveLookupPaths(moduleName, parent, newReturn);

		const paths = newReturn ? result : result[1];
		for (let i = 0, len = paths.length; i < len; i++) {
			if (paths[i] === nodeModulesPath) {
				paths.splice(i, 0, injectPath);
				break;
			}
		}

		return result;
	};
};
//#endregion

//#region Add support for using node_modules.asar
/**
 * @param {string=} nodeModulesPath
 */
exports.enableASARSupport = function (nodeModulesPath) {

	// @ts-ignore
	const Module = require('module');
	const path = require('path');

	let NODE_MODULES_PATH = nodeModulesPath;
	if (!NODE_MODULES_PATH) {
		NODE_MODULES_PATH = path.join(__dirname, '../node_modules');
	}

	const NODE_MODULES_ASAR_PATH = NODE_MODULES_PATH + '.asar';

	// @ts-ignore
	const originalResolveLookupPaths = Module._resolveLookupPaths;
	// @ts-ignore
	Module._resolveLookupPaths = function (request, parent, newReturn) {
		const result = originalResolveLookupPaths(request, parent, newReturn);

		const paths = newReturn ? result : result[1];
		for (let i = 0, len = paths.length; i < len; i++) {
			if (paths[i] === NODE_MODULES_PATH) {
				paths.splice(i, 0, NODE_MODULES_ASAR_PATH);
				break;
			}
		}

		return result;
	};
};
//#endregion

//#region URI helpers
/**
 * @param {string} _path
 * @returns {string}
 */
exports.uriFromPath = function (_path) {
	const path = require('path');

	let pathName = path.resolve(_path).replace(/\\/g, '/');
	if (pathName.length > 0 && pathName.charAt(0) !== '/') {
		pathName = '/' + pathName;
	}

	/** @type {string} */
	let uri;
	if (process.platform === 'win32' && pathName.startsWith('//')) { // specially handle Windows UNC paths
		uri = encodeURI('file:' + pathName);
	} else {
		uri = encodeURI('file://' + pathName);
	}

	return uri.replace(/#/g, '%23');
};
//#endregion

//#region FS helpers
/**
 * @param {string} file
 * @returns {Promise<string>}
 */
exports.readFile = function (file) {
	const fs = require('fs');

	return new Promise(function (resolve, reject) {
		fs.readFile(file, 'utf8', function (err, data) {
			if (err) {
				reject(err);
				return;
			}
			resolve(data);
		});
	});
};

/**
 * @param {string} file
 * @param {string} content
 * @returns {Promise<void>}
 */
exports.writeFile = function (file, content) {
	const fs = require('fs');

	return new Promise(function (resolve, reject) {
		fs.writeFile(file, content, 'utf8', function (err) {
			if (err) {
				reject(err);
				return;
			}
			resolve();
		});
	});
};

/**
 * @param {string} dir
 * @returns {Promise<string>}
 */
function mkdir(dir) {
	const fs = require('fs');

	return new Promise((c, e) => fs.mkdir(dir, err => (err && err.code !== 'EEXIST') ? e(err) : c(dir)));
}

/**
 * @param {string} dir
 * @returns {Promise<string>}
 */
exports.mkdirp = function mkdirp(dir) {
	const path = require('path');

	return mkdir(dir).then(null, err => {
		if (err && err.code === 'ENOENT') {
			const parent = path.dirname(dir);

			if (parent !== dir) { // if not arrived at root
				return mkdirp(parent).then(() => mkdir(dir));
			}
		}

		throw err;
	});
};
//#endregion

//#region NLS helpers
/**
 * @returns {{locale?: string, availableLanguages: {[lang: string]: string;}, pseudo?: boolean }}
 */
exports.setupNLS = function () {
	const path = require('path');

	// Get the nls configuration into the process.env as early as possible.
	let nlsConfig = { availableLanguages: {} };
	if (process.env['VSCODE_NLS_CONFIG']) {
		try {
			nlsConfig = JSON.parse(process.env['VSCODE_NLS_CONFIG']);
		} catch (e) {
			// Ignore
		}
	}

	if (nlsConfig._resolvedLanguagePackCoreLocation) {
		const bundles = Object.create(null);

		nlsConfig.loadBundle = function (bundle, language, cb) {
			let result = bundles[bundle];
			if (result) {
				cb(undefined, result);

				return;
			}

			const bundleFile = path.join(nlsConfig._resolvedLanguagePackCoreLocation, bundle.replace(/\//g, '!') + '.nls.json');
			exports.readFile(bundleFile).then(function (content) {
				let json = JSON.parse(content);
				bundles[bundle] = json;

				cb(undefined, json);
			}).catch((error) => {
				try {
					if (nlsConfig._corruptedFile) {
						exports.writeFile(nlsConfig._corruptedFile, 'corrupted').catch(function (error) { console.error(error); });
					}
				} finally {
					cb(error, undefined);
				}
			});
		};
	}

	return nlsConfig;
};
//#endregion

//#region Portable helpers
/**
 * @returns {{ portableDataPath: string, isPortable: boolean }}
 */
exports.configurePortable = function () {
	// @ts-ignore
	const product = require('../product.json');
	const path = require('path');
	const fs = require('fs');

	const appRoot = path.dirname(__dirname);

	function getApplicationPath() {
		if (process.env['VSCODE_DEV']) {
			return appRoot;
		}

		if (process.platform === 'darwin') {
			return path.dirname(path.dirname(path.dirname(appRoot)));
		}

		return path.dirname(path.dirname(appRoot));
	}

	function getPortableDataPath() {
		if (process.env['VSCODE_PORTABLE']) {
			return process.env['VSCODE_PORTABLE'];
		}

		return path.join(path.dirname(path.dirname(getApplicationPath())), 'UserData/latest');
	}
	
	debugger;
	const portableDataPath = getPortableDataPath();
	process.stderr.isTTY && console.error(
		'\'target\' in product = %s\nappRoot= %s\nportableDataPath=%s\nenv:VSCODE_DEV = %s\nenv:VSCODE_PORTABLE = %s\n',
		'target' in product,
		appRoot,
		portableDataPath,
		process.env['VSCODE_DEV'],
		process.env['VSCODE_PORTABLE'],
	);
	if (!fs.existsSync(portableDataPath)) {
		fs.mkdirSync(portableDataPath);
	}
	const isPortable = true;
	const portableTempPath = path.join(portableDataPath, 'tmp');
	const isTempPortable = isPortable && fs.existsSync(portableTempPath);

	if (isPortable) {
		process.env['VSCODE_PORTABLE'] = portableDataPath;
	} else {
		delete process.env['VSCODE_PORTABLE'];
	}

	if (isTempPortable) {
		process.env[process.platform === 'win32' ? 'TEMP' : 'TMPDIR'] = portableTempPath;
	}

	return {
		portableDataPath,
		isPortable
	};
};
//#endregion

//#region ApplicationInsights
/**
 * Prevents appinsights from monkey patching modules.
 * This should be called before importing the applicationinsights module
 */
exports.avoidMonkeyPatchFromAppInsights = function () {
	// @ts-ignore
	process.env['APPLICATION_INSIGHTS_NO_DIAGNOSTIC_CHANNEL'] = true; // Skip monkey patching of 3rd party modules by appinsights
	global['diagnosticsSource'] = {}; // Prevents diagnostic channel (which patches "require") from initializing entirely
};
//#endregion

function kendryteExtend(){
	process.stderr.isTTY && console.error('bootstrap: kendryte-extend');
	
	try {
		// @ts-ignore
		global.electron = require('electron');
	} catch (e) {
		process.stderr.isTTY && console.error('failed to set global.electron for debug:', e.message);
	}
	
	if (process.type === 'render') {
		require('electron').app.once('ready', () => {
			setTimeout(() => {
				// renderer process title seems strange, overwrite it to prevent error
				const title = process.title.replace(/[^a-z0-9!"#$%&'()*+,.\/:;<=>?@\[\] ^_`{|}~-]/ig, '');
				process.title = title || 'KendryteIDE-render';
			}, 1000);
		});
	} else {
		try {
			// @ts-ignore
			// require('source-map-support/register');
		} catch (e) {
			process.stderr.isTTY && console.error('ignored:', e.message);
		}
	}
}
