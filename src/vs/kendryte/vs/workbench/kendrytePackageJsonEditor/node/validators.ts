import { IInputValidator, IMessage, MessageType } from 'vs/base/browser/ui/inputbox/inputBox';
import { localize } from 'vs/nls';
import { resolvePath } from 'vs/kendryte/vs/base/common/resolvePath';
import { lstatSync } from 'fs';

export type IValidValidator = IInputValidator | undefined ;

function msg(content: string, type: MessageType = MessageType.ERROR): IMessage | null {
	return { content, type };
}

export function validateRequired(value: string): IMessage | null {
	if (!value) {
		return msg(localize('error.empty', 'This is required'));
	}
	return null;
}

export function validateProjectName(value: string): IMessage | null {
	if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
		return msg(localize('error.project-name.invalid', 'Invalid project name'));
	}
	return null;
}

export function validateVersionString(value: string): IMessage | null {
	if (!/^[0-9]+\.[0-9]+\.[0-9]+(?:-[a-z]+)?$/.test(value) && !/^develop$/.test(value) && !/^master$/.test(value)) {
		return msg(localize('error.version.invalid', 'Invalid version string, must be: x.y.z[-aaa]'));
	}
	return null;
}

export function validateUrl(value: string): IMessage | null {
	if (!value) {
		return null;
	}
	if (!/^https?:\/\//.test(value)) {
		return msg(localize('error.url.invalid', 'Invalid homepage url, must start with http(s)://'));
	}
	return null;
}

export function validateFolders(relativeTo: string, value: string): IMessage | null {
	const folders = value.split(/\n/g).filter(e => e.length > 0).map(p => p.trim().replace(/^[.\/\\]+/, ''));

	for (const line of folders) {
		const file = resolvePath(relativeTo, line);
		try {
			if (!lstatSync(file).isDirectory()) {
				return msg(localize('error.folder.invalid', 'Not a folder: {0}', file));
			}
		} catch (e) {
			return msg(localize('error.folder.nf', 'Not found folder: {0}', file), MessageType.WARNING);
		}
	}

	return null;
}

export function validateSources(relativeTo: string, alue: string): IMessage | null {
	// const lines = value.split(/\n/g).filter(e => e.length > 0).map(p => p.trim().replace(/^[.\/\\]+/, ''));
	// todo: uni match
	return null;
}

export function validateFile(relativeTo: string, value: string): IMessage | null {
	if (!value) {
		return null;
	}
	const file = resolvePath(relativeTo, value);
	try {
		if (!lstatSync(file).isFile()) {
			return msg(localize('error.file.invalid', 'Not a file: {0}', file));
		}
	} catch (e) {
		return msg(localize('error.file.nf', 'Not found file: {0}', file), MessageType.WARNING);
	}

	return null;
}

const regDefs = /^[a-zA-Z_][a-zA-Z0-9_]+:(?:str|raw)=/;

export function validateArgList(value: string): IMessage | null {
	return null;
}

export function validateDefinitions(value: string): IMessage | null {
	const lines = value.split(/\n/g).filter(e => e.length > 0);

	for (const line of lines) {
		if (!regDefs.test(line)) {
			return msg(localize('error.arg.list', 'Invalid line: {0}. Must match: {1}', line, regDefs.toString()));
		}
	}
	return null;
}

const regKvs = /^[a-zA-Z0-9_]+=/;

export function validateKeyValue(value: string): IMessage | null {
	const lines = value.split(/\n/g).filter(e => e.length > 0);

	for (const line of lines) {
		if (!regKvs.test(line)) {
			return msg(localize('error.arg.list', 'Invalid line: {0}. Must match: {1}', line, regKvs.toString()));
		}
	}
	return null;
}

export function combineValidation(validation: IValidValidator | IValidValidator[]): IInputValidator | undefined {
	if (Array.isArray(validation)) {
		return (value: string) => {
			for (const vf of validation) {
				if (!vf) {
					continue;
				}
				const ret = vf(value);
				if (ret) {
					return ret;
				}
			}
			return null;
		};
	} else {
		return validation;
	}
}