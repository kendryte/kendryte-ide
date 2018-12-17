const {resolve} = require('path');
const {unlinkSync, existsSync} = require('fs');
const file = resolve(__dirname, '../../', '.release/tmp/help.txt');
if (existsSync(file)) {
	unlinkSync(file);
}
