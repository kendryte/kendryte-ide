import { CMAKE_EVENT_TYPE, CMAKE_SIGNAL_TYPE, ICMakeResponse } from 'vs/workbench/parts/maix/cmake/common/cmakeProtocol/cmakeProtocol';

export interface ICMakeProtocolSignal extends ICMakeResponse {
	type: CMAKE_EVENT_TYPE.SIGNAL;
	name: CMAKE_SIGNAL_TYPE;
}

export interface ICMakeProtocolDirtySignal extends ICMakeProtocolSignal {
	name: CMAKE_SIGNAL_TYPE.DIRTY;
}

export interface ICMakeProtocolFileChangeSignal extends ICMakeProtocolSignal {
	name: CMAKE_SIGNAL_TYPE.FILECHANGE;
	path: string;
	properties: string[];
}