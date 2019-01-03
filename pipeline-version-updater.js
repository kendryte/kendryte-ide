const {writeFileSync} = require('fs');

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

process.chdir(__dirname);
const pkg = require('./package.json');
pkg.patchVersion = createReleaseTag();
writeFileSync('./package.json', JSON.stringify(pkg, null, 4), 'utf8');

const product = require('./product.json');
product.quality = getReleaseChannel();
writeFileSync('./product.json', JSON.stringify(product, null, 2), 'utf8');
