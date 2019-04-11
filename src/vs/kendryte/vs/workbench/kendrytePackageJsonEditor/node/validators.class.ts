import {
	combineValidation,
	IValidValidator,
	validateArgList,
	validateDefinitions,
	validateFile,
	validateFolders,
	validateKeyValue,
	validateProjectName,
	validateRequired,
	validateSources,
	validateUrl,
	validateVersionString,
} from 'vs/kendryte/vs/workbench/kendrytePackageJsonEditor/node/validators';

export enum PackageJsonValidate {
	Required,
	File,
	Folders,
	Sources,
	KeyValue,
	ArgList,
	VersionString,
	Url,
	ProjectName,
	Definitions,
}

export type PackageJsonValidatorType = PackageJsonValidate | PackageJsonValidate[];

export class KendryteJsonValidator {
	private rootPath = '/not/exists';

	constructor() {
		this.validateFile = this.validateFile.bind(this);
		this.validateFolders = this.validateFolders.bind(this);
		this.validateSources = this.validateSources.bind(this);
	}

	setRootPath(path: string) {
		this.rootPath = path;
	}

	private _getValidate(type: PackageJsonValidate): IValidValidator {
		switch (type) {
			case PackageJsonValidate.File:
				return this.validateFile;
			case PackageJsonValidate.Folders:
				return this.validateFolders;
			case PackageJsonValidate.Sources:
				return this.validateSources;
			case PackageJsonValidate.Required:
				return validateRequired;
			case PackageJsonValidate.KeyValue:
				return validateKeyValue;
			case PackageJsonValidate.ArgList:
				return validateArgList;
			case PackageJsonValidate.VersionString:
				return validateVersionString;
			case PackageJsonValidate.Url:
				return validateUrl;
			case PackageJsonValidate.ProjectName:
				return validateProjectName;
			case PackageJsonValidate.Definitions:
				return validateDefinitions;
			default:
				return undefined;
		}
	}

	getValidate(type: PackageJsonValidatorType): IValidValidator {
		if (Array.isArray(type)) {
			return combineValidation(type.map(type => this._getValidate(type)));
		} else {
			return this._getValidate(type);
		}
	}

	validateFile(value: string) {
		return validateFile(this.rootPath, value);
	}

	validateFolders(value: string) {
		return validateFolders(this.rootPath, value);
	}

	validateSources(value: string) {
		return validateSources(this.rootPath, value);
	}
}