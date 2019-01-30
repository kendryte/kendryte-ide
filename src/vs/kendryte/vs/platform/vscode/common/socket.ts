import { createConnection, Socket } from 'net';
import { ILogService } from 'vs/platform/log/common/log';

export function connectToHost(host: string, log: ILogService): Socket {
	if (host.includes(':')) {
		const sp = host.split(':');
		log.info('Connect to ip host: %s, port: %s.', sp[0], sp[1]);
		return createConnection(parseInt(sp[1]), sp[0]);
	} else {
		log.info('Connect to sock: %s, port: %s.', host);
		return createConnection(host);
	}
}
