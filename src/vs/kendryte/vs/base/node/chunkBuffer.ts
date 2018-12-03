export function chunkBuffer(source: Buffer, size: number): Buffer[] {
	const ret: Buffer[] = [];

	let itr = 0;
	while (true) {
		const next = itr + size;
		if (next >= source.length) {
			ret.push(source.slice(itr, source.length));
			break;
		} else {
			ret.push(source.slice(itr, next));
			itr = next;
		}
	}

	return ret;
}
