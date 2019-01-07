const {writeFileSync} = require('fs');
const {execSync} = require('child_process');

function createReleaseTag() {
	if (process.env.BUILD_BUILDNUMBER) {
		return '' + process.env.BUILD_BUILDNUMBER;
	} else {
		console.error('BUILD_BUILDNUMBER is not set, this script only for pipelines');
		process.exit(1);
	}
}

function getReleaseChannel() {
	let channel = '' + process.env.CHANNEL;
	switch (channel) {
	case 'a':
	case 'alpha':
		channel = 'alpha';
		break;
	case 'b':
	case 'beta':
		channel = 'beta';
		break;
	case 's':
	case 'stable':
		channel = 'stable';
		break;
	default:
		console.error('Please set env `CHANNEL` to "alpha" or "beta" or "stable". (or a/b/s)');
		process.exit(1);
	}
	return channel;
}

process.env.LANG = 'C';
process.env.LC_ALL = 'C';

process.chdir(__dirname);
const lstFile = `${require('os').tmpdir()}/listFile.lst`;
const distFolder = process.env.BUILD_ARTIFACTSTAGINGDIRECTORY || process.env.TMP;

execSync('yarn global add 7zip-bin 7zip-bin-wrapper', {stdio: 'inherit'});
const gitOutput = execSync('git clean -d -n -x', {encoding: 'utf-8'});
console.log(gitOutput);

const files = gitOutput.trim().split('\n').map(l => l.replace('Would remove ', '')).join('\n').trim();
writeFileSync(lstFile, files, 'utf-8');

execSync(`7za a -y -r -mmt -ms=on -mx3 -ssc "${distFolder}/node_modules.7z" "@${lstFile}"`, {stdio: 'inherit'});
