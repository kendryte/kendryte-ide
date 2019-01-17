import { createConnection, Socket } from 'net';

export function connectToHost(host: string): Socket {
	if (host.includes(':')) {
		const sp = host.split(':');
		return createConnection(parseInt(sp[1]), sp[0]);
	} else {
		return createConnection(host);
	}
}
