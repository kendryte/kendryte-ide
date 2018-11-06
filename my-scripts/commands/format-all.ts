import { resolve } from 'path';
import { PassThrough } from 'stream';
import { getOutputCommand, pipeCommandOut } from '../build-env/childprocess/complex';
import { ProgramError } from '../build-env/childprocess/error';
import { RELEASE_ROOT, VSCODE_ROOT } from '../build-env/misc/constants';
import { runMain, usePretty, useWriteFileStream, whatIsThis } from '../build-env/misc/myBuildSystem';
import { chdir } from '../build-env/misc/pathUtil';
import { CollectingStream } from '../build-env/misc/streamUtil';
import { timeout } from '../build-env/misc/timeUtil';

whatIsThis(__filename, 'format all source code and check any errors.');

const split2 = require('split2');

const fileNotFormat = /^File not formatted: (.+)$/;
const errReport = /^(src[\\/].+?)\(\d+,\d+\): /;
const violates = /^(src[\\/].+?):\d+:\d+:Imports violates/;
const isTs = /\.ts$/i;
const isCss = /\.css$/i;

runMain(async () => {
	process.stderr.write('\x1Bc\r');
	chdir(VSCODE_ROOT);
	
	const output = usePretty();
	
	output.success('running reformat on ALL source files, this will use about 1min. please wait.').continue();
	output.write('waiting for \'yarn gulp hygiene\'');
	
	const notFormattedFiles: string[] = [];
	const notValidFiles: string[] = [];
	const processor = split2().on('data', (line) => {
		line = line.toString();
		
		if (fileNotFormat.test(line)) {
			notFormattedFiles.push(fileNotFormat.exec(line)[1].trim());
		} else if (errReport.test(line)) {
			notFormattedFiles.push(errReport.exec(line)[1].trim());
		} else if (violates.test(line)) {
			notValidFiles.push(violates.exec(line)[1].trim());
		}
	});
	
	const multiplex = new PassThrough();
	const collector = new CollectingStream();
	multiplex.pipe(processor);
	multiplex.pipe(collector);
	multiplex.pipe(output, {end: false});
	multiplex.pipe(useWriteFileStream(resolve(RELEASE_ROOT, 'hygiene.log')));
	
	await await pipeCommandOut(multiplex, 'yarn', 'run', 'gulp', 'hygiene').then(() => {
		output.success('gulp hygiene exit successful').continue();
	}, (e: ProgramError) => {
		output.fail(`gulp hygiene exit with failed status: ${e.status || ''}${e.signal || ''}`);
		notValidFiles.unshift('hygiene failed. this list may not complete. run yarn gulp hygiene too see full.');
		output.continue();
	});
	
	if (notFormattedFiles.length) {
		output.success(`fixing ${notFormattedFiles.length} error....\n`).continue();
		
		for (const file of notFormattedFiles) {
			output.write(file + '\n');
			if (isTs.test(file)) {
				await getOutputCommand('tsfmt', '-r', file).catch(() => {
					notValidFiles.push(file);
				});
			} else if (isCss.test(file)) {
				
				await getOutputCommand(
					'css-beautify',
					'-n', '-t', '-L', '-N', '--type', 'css', '-r', '-f', file).catch(() => {
					notValidFiles.push(file);
				});
			} else {
				notValidFiles.push(file);
			}
		}
	}
	
	if (notValidFiles.length) {
		output.write('\n\n');
		output.nextLine();
		
		await timeout(500);
		
		console.error('\n' + collector.getOutput() + '\n');
		
		output.fail(notValidFiles.length + ' files must fix by hand.');
		for (const file of notValidFiles) {
			console.error(' x %s', file);
		}
		console.log('\n\n');
		throw new Error('auto fix fail.');
	} else {
		output.success(notFormattedFiles.length + ' files auto fix complete.');
	}
	
	console.error('Notice: you must run `yarn gulp hygiene` again...');
});
