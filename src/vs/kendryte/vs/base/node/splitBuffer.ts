export function splitBuffer(source: Buffer, needle: string | number | Buffer, include: boolean = false): Buffer[] {
	const ret: Buffer[] = [];

	let buff: Buffer;
	if (typeof needle === 'string') {
		buff = Buffer.from(needle);
	} else if (typeof needle === 'number') {
		buff = Buffer.alloc(1, needle);
	} else {
		buff = needle;
	}

	let length = buff.length;

	let itr = 0;
	while (true) {
		const found = source.indexOf(buff, itr);
		if (found === -1) {
			ret.push(source.slice(itr));
			break;
		} else {
			itr = found + length;
			ret.push(source.slice(itr, include ? itr : found));
		}
	}

	return ret;
}
