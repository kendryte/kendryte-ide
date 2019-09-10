import { createHash } from 'crypto';

export function sha256(data: Buffer) {
	return createHash('sha256').update(data).digest().toString('hex');
}
