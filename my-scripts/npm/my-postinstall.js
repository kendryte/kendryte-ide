if (process.env.SKIP_FIRST_COMPILE) {
	process.exit(0);
}

const {execSync} = require('child_process');
const {dirname} = require('path');

process.chdir(dirname(__dirname));
execSync('tsc -p .', {
	stdio: 'inherit',
});
