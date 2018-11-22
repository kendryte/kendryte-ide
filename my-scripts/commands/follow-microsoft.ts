import { resolve } from 'path';
import { extract } from 'tar-fs';
import { getOutputCommand, pipeCommandBoth, pipeCommandOut } from '../build-env/childprocess/complex';
import { removeDirectory } from '../build-env/codeblocks/removeDir';
import { RELEASE_ROOT, VSCODE_ROOT } from '../build-env/misc/constants';
import { isExists, readFile, writeFile } from '../build-env/misc/fsUtil';
import { whatIsThis } from '../build-env/misc/help';
import { runMain } from '../build-env/misc/myBuildSystem';
import { chdir } from '../build-env/misc/pathUtil';
import { usePretty } from '../build-env/misc/usePretty';

whatIsThis(__filename, 'follow microsoft VS Code repo');

runMain(async () => {
	const output = usePretty('follow-microsoft');
	chdir(VSCODE_ROOT);
	
	output.writeln('checking exists upstream working tree...');
	await removeDirectory('.release/follow-upstream', output);
	await pipeCommandOut(output, 'git', 'worktree', 'prune');
	output.success('cleared upstream working tree...');
	
	output.writeln('fetching origin upstream branch...');
	await pipeCommandOut(output, 'git', 'fetch', 'origin', 'microsoft');
	output.success('origin upstream branch fetched.');
	
	output.writeln('checking out upstream working tree...');
	await pipeCommandOut(output, 'git', 'worktree', 'add', '-f', '.release/follow-upstream', 'origin/microsoft');
	output.writeln('upstream working tree checked out.');
	
	const followBranchDir = resolve(RELEASE_ROOT, 'follow-upstream');
	chdir(followBranchDir);
	const gitFileData = await readFile('.git');
	const lastLog = await getOutputCommand('git', 'log', '-1', '--format=%s');
	const lastHash = lastLog.trim().split(/\n/g)[0].split('#').pop().trim().toLowerCase();
	output.success(`last following commit is: {${lastHash}}`);
	if (!/^[0-9a-f]{40}$/.test(lastHash)) {
		throw new Error('Fatal: remote branch log is wrong.');
	}
	
	chdir(RELEASE_ROOT);
	await removeDirectory(followBranchDir, output);
	
	const upstreamStorage = process.env.MICROSOFT_VSCODE_ROOT || resolve(VSCODE_ROOT, '..', 'MicrosoftVSCode');
	if (await isExists(upstreamStorage)) {
		output.writeln('upstream vscode repo is exists. update it.');
		chdir(upstreamStorage);
		await pipeCommandOut(output, 'git', 'fetch', 'origin', 'master');
	} else {
		output.writeln('upstream vscode repo is not exists.');
		await pipeCommandOut(output, 'git', 'clone', '--bare', '-b', 'master', '--single-branch', 'https://github.com/Microsoft/vscode.git', upstreamStorage);
		chdir(upstreamStorage);
	}
	const latestMicrosoftCommit = await getOutputCommand('git', 'rev-parse', 'origin/master');
	output.success('upstream vscode is up to date. last commit is: ' + latestMicrosoftCommit);
	
	const logs = await getOutputCommand('git', 'log', '--format=%h %s', 'origin/master', `${lastHash}...origin/master`);
	const cnt = logs.trim().split(/\n/g).length;
	if (cnt === 1 && logs.trim().length === 0) {
		output.success('Remote hash not changed, update terminated.');
		return;
	}
	output.success(`${cnt} new commits from microsoft`);
	
	output.writeln('extracting source code...');
	const untar = extract(followBranchDir);
	await pipeCommandBoth(untar, output, 'git', 'archive', '--format', 'tar', 'origin/master');
	await removeDirectory(resolve(followBranchDir, '.git'), output);
	await writeFile(resolve(followBranchDir, '.git'), gitFileData);
	output.success('extracted source code.');
	
	const myNextCommitLog = `sync with upstream # ${latestMicrosoftCommit}\n\n${logs.trim()}\n`;
	const commitLogFile = resolve(process.env.TEMP, 'follow-upstream.commit.log');
	await writeFile(commitLogFile, myNextCommitLog);
	
	chdir(followBranchDir);
	output.writeln('commit working tree...');
	await pipeCommandOut(output, 'git', 'add', '.');
	await pipeCommandOut(output, 'git', 'commit', '.', '--no-verify', '--file=' + commitLogFile);
	output.success('commit success.');
	
	output.writeln('pushing...');
	await pipeCommandOut(output, 'git', 'push','origin','HEAD:microsoft');
	output.writeln('push success.');
	
	output.writeln('cleaning...');
	chdir(RELEASE_ROOT);
	await removeDirectory('.release/follow-upstream', output);
	await pipeCommandOut(output, 'git', 'worktree', 'prune');
	
	output.success('Done.');
});