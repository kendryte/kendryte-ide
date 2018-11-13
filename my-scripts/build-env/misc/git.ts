import { lstat, readFile, readlink } from './fsUtil';

const gitdirReg = /^gitdir:\s*(.+)$/mg;

export async function resolveGitDir(path: string) {
	const ls = await lstat(path);
	if (!ls) {
		throw new Error(path + ' folder not exists.');
	}
	if (ls.isSymbolicLink()) {
		return resolveGitDir(await readlink(path));
	}
	if (ls.isDirectory()) {
		return path;
	} else if (ls.isFile()) {
		const data = await readFile(path);
		const m = gitdirReg.exec(data);
		if (!m) {
			throw new Error(path + ' is not a git repo.');
		}
		return resolveGitDir(m[1]);
	} else {
		throw new Error(path + ' is not usable.');
	}
}