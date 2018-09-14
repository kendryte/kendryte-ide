process.on('uncaughtException', pause);
process.on('beforeExit', pause);
const _exit = process.exit.bind(process);
process.exit = pause;

const NODE_EXE_PATH = require('path').resolve(process.argv[0], '..');
const yarnPath = require('path').resolve(NODE_EXE_PATH, 'node_modules/yarn/bin/yarn.js')

process.env.PATH=NODE_EXE_PATH+";C:/Windows;C:/WINDOWS/system32;C:/WINDOWS/System32/Wbem;C:/WINDOWS/System32/WindowsPowerShell/v1.0/"
process.argv = [process.argv[0], yarnPath, "global", "add", "windows-build-tools"];

delete module.main;
require(yarnPath);

function pause(e){
	if(e){
		console.error((e&e.stack)?e.stack:e);
	}
	if(e === 0){
		require('child_process').execSync('pause',{stdio:'inherit'});
	}
	_exit(e?e:0);
}

