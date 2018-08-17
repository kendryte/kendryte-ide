import { CMAKE_EVENT_TYPE, ICMakeProtocolBase, ICMakeRequest, ICMakeResponse } from 'vs/workbench/parts/maix/cmake/common/cmakeProtocol/cmakeProtocol';
import { ICMakeSettings } from 'vs/workbench/parts/maix/cmake/common/cmakeProtocol/settings';
import { ICMakeCodeModel } from 'vs/workbench/parts/maix/cmake/common/cmakeProtocol/config';
import { ICMakeTestInfo } from 'vs/workbench/parts/maix/cmake/common/cmakeProtocol/ctest';

export interface SupportedVersion {
	major: number;
	minor: number;
	isExperimental: boolean;
}

export interface ICMakeProtocolHello extends ICMakeProtocolBase {
	type: CMAKE_EVENT_TYPE.HELLO;
	supportedProtocolVersions: SupportedVersion[];
}

export interface ICMakeProtocolHandshake extends ICMakeRequest, Partial<ICMakeSettings> {
	type: CMAKE_EVENT_TYPE.HANDSHAKE;
	protocolVersion?: SupportedVersion;
}

export interface ICMakeProtocolGlobalSettings extends ICMakeResponse, ICMakeSettings {
	type: CMAKE_EVENT_TYPE.GLOBALSETTINGS;
}

export interface ICMakeProtocolSetGlobalSettings extends ICMakeRequest, Partial<ICMakeSettings> {
	type: CMAKE_EVENT_TYPE.SETGLOBALSETTINGS;
}

export interface ICMakeProtocolConfigure extends ICMakeResponse {
	type: CMAKE_EVENT_TYPE.CONFIGURE;
	cacheArguments: string[]; // -DXXXX=
}

export interface ICMakeProtocolCompute extends ICMakeResponse {
	type: CMAKE_EVENT_TYPE.COMPUTE;
}

export interface ICMakeProtocolCodeModel extends ICMakeResponse {
	type: CMAKE_EVENT_TYPE.CODEMODEL;
	configurations: ICMakeCodeModel[];
}

export interface ICMakeProtocolMessage extends ICMakeResponse {
	type: CMAKE_EVENT_TYPE.CTESTINFO;
	configurations: ICMakeTestInfo[];
}

export interface ICMakeProtocolCMakeInputs extends ICMakeResponse {
	type: CMAKE_EVENT_TYPE.CMAKEINPUTS;
	buildFiles: {
		isCMake: boolean;
		isTemporary: boolean;
		sources: string[];
	}[];
	cmakeRootDirectory: string;
	sourceDirectory: string;
}

export enum CMAKE_VAE_TYPE {
	FILEPATH = 'FILEPATH', // = File chooser dialog.
	PATH = 'PATH', // = Directory chooser dialog.
	STRING = 'STRING', // = Arbitrary string.
	BOOL = 'BOOL', // = Boolean ON/OFF checkbox.
	INTERNAL = 'INTERNAL', // = No GUI entry (used for persistent variables).
	UNINITIALIZED = 'UNINITIALIZED',
	STATIC = 'STATIC',
}

export interface ICMakeProtocolCache extends ICMakeResponse {
	type: CMAKE_EVENT_TYPE.CACHE;
	cache: {
		type: CMAKE_VAE_TYPE;
		key: string;
		value: string;
		properties: {
			[id: string]: string;
		};
	}[];
}

export interface ICMakeProtocolFilesystemWatchers extends ICMakeResponse {
	type: CMAKE_EVENT_TYPE.FILESYSTEMWATCHERS;
	watchedFiles: string[];
	watchedDirectories: string [];
}