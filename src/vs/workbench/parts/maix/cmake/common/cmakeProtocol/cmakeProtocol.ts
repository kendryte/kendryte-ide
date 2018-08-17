export enum CMAKE_EVENT_TYPE {
	// event
	REPLY = 'reply',
	ERROR = 'error',
	PROGRESS = 'progress',
	MESSAGE = 'message',
	SIGNAL = 'signal',
	// message
	HELLO = 'hello',
	HANDSHAKE = 'handshake',
	GLOBALSETTINGS = 'globalSettings',
	SETGLOBALSETTINGS = 'setGlobalSettings',
	CONFIGURE = 'configure',
	COMPUTE = 'compute',
	CODEMODEL = 'codemodel',
	CTESTINFO = 'ctestInfo',
	CMAKEINPUTS = 'cmakeInputs',
	CACHE = 'cache',
	FILESYSTEMWATCHERS = 'fileSystemWatchers',
}

export type REQUEST_TYPE =
	CMAKE_EVENT_TYPE.HANDSHAKE
	|CMAKE_EVENT_TYPE.GLOBALSETTINGS
	|CMAKE_EVENT_TYPE.SETGLOBALSETTINGS
	|CMAKE_EVENT_TYPE.CONFIGURE
	|CMAKE_EVENT_TYPE.COMPUTE
	|CMAKE_EVENT_TYPE.CODEMODEL
	|CMAKE_EVENT_TYPE.CTESTINFO
	|CMAKE_EVENT_TYPE.CMAKEINPUTS
	|CMAKE_EVENT_TYPE.CACHE;

export enum CMAKE_SIGNAL_TYPE {
	DIRTY = 'dirty',
	FILECHANGE = 'fileChange',
}

export interface ICMakeProtocolBase {
	type: CMAKE_EVENT_TYPE;
}

export interface ICMakeProtocol extends ICMakeProtocolBase {
	cookie?: string;
}

export interface ICMakeProtocolAny extends ICMakeProtocol {
	[id: string]: any;
}

export interface ICMakeResponse extends ICMakeProtocol {
	inReplyTo: CMAKE_EVENT_TYPE;
}

export interface ICMakeRequest extends ICMakeProtocol {
	type: REQUEST_TYPE;
}
