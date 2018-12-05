import { DebugSession, Event } from 'vscode-debugadapter';
import { NodeLoggerCommon } from '../../common/logger';

export class CustomEvent<T = any> extends Event {
	constructor(type: string, body: T) {
		super('custom', {
			type,
			body,
		});
	}
}

export class CustomLogger extends NodeLoggerCommon {
	constructor(
		tag: string,
		private readonly session: DebugSession,
	) {
		super(tag);
	}

	write(data: string) {
		this.session.sendEvent(new CustomEvent('log', { data }));
	}
}
