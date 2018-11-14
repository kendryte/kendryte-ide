const {execSync} = require('child_process');
const {dirname} = require('path');

process.chdir(dirname(__dirname));
execSync('tsc -p .', {
	stdio: 'inherit',
});
