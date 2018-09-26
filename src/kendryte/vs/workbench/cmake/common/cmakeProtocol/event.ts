import { CMAKE_EVENT_TYPE, ICMakeProtocolAny, ICMakeResponse } from 'kendryte/vs/workbench/cmake/common/cmakeProtocol/cmakeProtocol';

export interface ICMakeProtocolReply extends ICMakeResponse, ICMakeProtocolAny {
	type: CMAKE_EVENT_TYPE.REPLY;
}

export interface ICMakeProtocolProgress extends ICMakeResponse {
	type: CMAKE_EVENT_TYPE.PROGRESS;
	progressMessage: string;
	progressMinimum: number;
	progressMaximum: number;
	progressCurrent: number;
}

export interface ICMakeProtocolMessage extends ICMakeResponse {
	type: CMAKE_EVENT_TYPE.MESSAGE;
	message: string;
	title: string;
}