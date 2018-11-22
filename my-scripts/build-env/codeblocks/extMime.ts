import { extname } from 'path';

export function extMime(name) {
	switch (extname(name)) {
	case '.exe':
		return 'application/vnd.microsoft.portable-executable.';
	case '.bin':
		return 'application/x-executable';
	case '.zip':
		return 'application/zip';
	case '.gz':
	case '.tgz':
		return 'application/x-gzip';
	case '.json':
		return 'application/json';
	}
}