const {writeFileSync} = require('fs');
const {resolve} = require('path');
const {create} = require('guid');

const p = process.argv.pop();
const folderName = `maix.${p}-666.6.6`;

const sourcePackage = resolve('./custom-extensions', folderName, 'package.json');
const pkg = require(sourcePackage);
const genName = `${pkg.publisher}.${pkg.name}-${pkg.version}`;
if (genName !== folderName) {
	if (pkg.publisher !== 'maix') {
		if (!pkg.publisherOriginal) {
			pkg.publisherOriginal = pkg.publisher;
		}
		pkg.publisher = 'maix';
	}
	if (pkg.version !== '666.6.6') {
		if (!pkg.upstreamVersion) {
			pkg.upstreamVersion = pkg.version;
		}
		pkg.version = '666.6.6';
	}
	pkg.__metadata = {
		'id': create().toString(),
		'publisherDisplayName': 'Maix IDE',
		'publisherId': '54e8304d-0605-d908-f300-fb98b128b868',
	};
	writeFileSync(sourcePackage, JSON.stringify(pkg, null, 2), 'utf8');
}
