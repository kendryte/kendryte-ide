import { basename, resolve } from 'path';
import { getOutputCommand, pipeCommandOut } from '../build-env/childprocess/complex';
import { escapeRegExpCharacters } from '../build-env/codeblocks/escapeRegExpCharacters';
import { OBJKEY_PACKAGE_MANAGER_LIBRARY, s3LoadJson, s3UploadJson } from '../build-env/misc/awsUtil';
import { RELEASE_ROOT } from '../build-env/misc/constants';
import { isExists } from '../build-env/misc/fsUtil';
import { whatIsThis } from '../build-env/misc/help';
import { runMain } from '../build-env/misc/myBuildSystem';
import { ensureChdir } from '../build-env/misc/pathUtil';
import { usePretty } from '../build-env/misc/usePretty';
import { readPackageInfo } from '../build-env/package-manager/packageInfo';
import { IRemotePackageRegistry } from '../build-env/package-manager/type';

whatIsThis(
	'Register an example or library with its GitHub repo',
	'通过GitHub仓库发布一个依赖或样例程序',
);

const usage = `
library-publish [git remote url] [git RELEASE branch name]
	all argument is required.
`;

runMain(async () => {
	const args = process.argv.slice(2);
	const gitRemote = args.shift();
	const gitBranch = args.shift();
	
	if (!gitRemote) {
		throw new Error('git remote is required.' + usage);
	}
	if (!gitBranch) {
		throw new Error('git branch is required.' + usage);
	}
	const output = usePretty('library-publish');
	
	const dir = basename(gitRemote, '.git');
	const packRoot = resolve(RELEASE_ROOT, 'package-manager', dir);
	ensureChdir(packRoot);
	if (await isExists(resolve(packRoot, '.git'))) {
		output.writeln('repo is already exists, simple check.');
		const branchOut = await getOutputCommand('git', 'branch');
		const reg = new RegExp('/^\\* (' + escapeRegExpCharacters(gitBranch) + ')$/');
		const m = reg.exec(branchOut);
		if (!m) {
			throw new Error('local cache has different branch than your input, you need delete it. the folder is ' + packRoot);
		}
		
	} else {
		output.writeln('repo is not exists, clone new.');
		await pipeCommandOut(output, 'git', 'clone', '-b', gitBranch, gitRemote);
	}
	
	const data = await readPackageInfo(output, packRoot);
	
	output.writeln('reading registry file...');
	const remote = await s3LoadJson<IRemotePackageRegistry>(OBJKEY_PACKAGE_MANAGER_LIBRARY);
	output.writeln('registry file loaded.');
	const exists = findPackage(remote, data.name);
	if (exists) {
		throw new Error('Failed to register new package, same name is already exists. new version use: library-publish-version.');
	}
	
	remote.push({
		name: data.name,
		// icon:
		description: 'official library of ' + data.name,
		homepage: gitRemote,
		versions: [],
		type: 'library',
	});
	
	output.writeln('update registry file...');
	await s3UploadJson(remote, OBJKEY_PACKAGE_MANAGER_LIBRARY);
	
	output.success('Done.').pause();
});

function findPackage(remote: IRemotePackageRegistry, name: string) {
	return remote.find(e => e.name === name);
}