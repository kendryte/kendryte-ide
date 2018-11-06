import { createWriteStream, existsSync, lstatSync, readdirSync } from 'fs';
import { resolve } from 'path';
import { shellOutput } from '../build-env/childprocess/noDependency';
import { RELEASE_ROOT } from '../build-env/misc/constants';
import { removeDirectory } from '../build-env/misc/fsUtil';
import { mainDispose, runMain } from '../build-env/misc/myBuildSystem';

runMain(async () => {
	const logger = createWriteStream(resolve(RELEASE_ROOT, 'yarnCacheFilesToRemove.txt'), 'utf8');
	
	function log(s: string) {
		return new Promise((resolve, reject) => {
			const wrappedCallback = (err) => err? reject(err) : resolve();
			logger.write(s, wrappedCallback);
		});
	}
	
	mainDispose(() => {
		logger.end();
	});
	
	const yarnCache = (await shellOutput('yarn', 'cache', 'dir')).trim();
	await log('dir is ' + yarnCache + '\n');
	if (!yarnCache) {
		throw new Error('yarn cache dir empty');
	}
	const leafs = [];
	findAnyDirToDelete(yarnCache, leafs);
	for (const dir of leafs) {
		if (!existsSync(resolve(dir, '.yarn-metadata.json'))) {
			await removeDirectory(dir, logger);
		}
	}
});

// return dir should delete
function findAnyDirToDelete(dir: string, ret: string[] = []) {
	const dirContent = readdirSync(dir);
	
	const tarballExists = dirContent.includes('.yarn-tarball.tgz');
	const onlyTarballExists = tarballExists && dirContent.length === 1;
	const metadataExists = dirContent.includes('.yarn-metadata.json');
	
	// const tarball = resolve(dir, '.yarn-tarball.tgz');
	const metadata = resolve(dir, '.yarn-metadata.json');
	
	if (tarballExists) {
		if (metadataExists) {
			ret.push(metadata);
			return false;
		} else if (onlyTarballExists) {
			return true;
		} else { // impossible
			return true;
		}
	}
	
	let shouldNotDelete = false;
	for (const item of dirContent) {
		const sub = resolve(dir, item);
		if (lstatSync(sub).isDirectory()) {
			const shouldSubDelete = findAnyDirToDelete(sub, ret);
			if (shouldSubDelete) {
				ret.push(sub);
			} else {
				shouldNotDelete = true;
			}
		} else {
			shouldNotDelete = true;
		}
	}
	
	if (!shouldNotDelete) {
		return true;
	} else {
		return false;
	}
}
