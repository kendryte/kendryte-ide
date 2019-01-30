import { createConnection, Socket } from 'net';
import { ILogService } from 'vs/platform/log/common/log';

const isIpPort = /:[0-9]+$/;

export function connectToHost(host: string, log: ILogService): Socket {
	host = host.trim();
	if (isIpPort.test(host)) {
		const sp = host.split(':');
		log.info('Connect to ip host: %s, port: %s.', sp[0], sp[1]);
		return createConnection(parseInt(sp[1]), sp[0]);
	} else {
		log.info('Connect to sock: %s, port: %s.', host);
		return createConnection(host);
	}
}
