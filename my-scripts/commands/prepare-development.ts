import { chdir } from '../build-env/childCommands';
import { runMain, thisIsABuildScript } from '../build-env/include';
import { codePointWidth } from '../build-env/stringWidth';
// import './prepare-release';

thisIsABuildScript();

function unicodeEscape(str: string) {
	return str.replace(/[\s\S]/g, function (escape) {
		return '\\u' + ('0000' + escape.charCodeAt().toString(16)).slice(-4);
	});
}

runMain(async () => {
	chdir(process.env.VSCODE_ROOT);
	/*
		const stream = new Transform({
			transform(this: Transform, chunk: string | Buffer, encoding: string, callback: Function) {
				this.push(chunk, encoding);
				callback();
			},
		});
		setInterval(() => {
			stream.write(`${new Date} ~ ${Math.random()}`);
		}, 1000);

		handleStream(stream);
		*/

	const r = codePointWidth('👍🏽😂啊aaaa');
	console.log(unicodeEscape(r.data), r);
});