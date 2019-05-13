import { URI } from 'vs/base/common/uri';

export class PathAttachedError extends Error {
	constructor(private readonly path: URI | string, message: string) {
		super(message);
	}

	get fsPath() {
		return typeof this.path === 'string' ? this.path : this.path.fsPath;
	}

	get resource() {
		return typeof this.path === 'string' ? URI.file(this.path) : this.path;
	}
}
