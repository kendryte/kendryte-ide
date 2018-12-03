// TODO: Need Test !!!

export function replaceBuffer(source: Buffer, from: Buffer, to: Buffer): Buffer {
	const length = from.length;

	const idxList: number[] = [];

	let itr = 0;
	while (true) {
		const found = source.indexOf(from, itr);
		if (found !== -1) {
			idxList.push(found);
			itr += length;
		} else {
			break;
		}
	}

	if (idxList.length === 0) {
		return source;
	}

	let newView: Buffer;
	let cur = 0;
	if (length >= to.length) {
		cur = idxList.shift();
		itr = cur + from.length;
		newView = source;
	} else {
		itr = 0;
		newView = Buffer.allocUnsafe(source.length + idxList.length * (to.length - length));
	}

	while (idxList.length > 0) {
		const next = idxList.length ? idxList.shift() : source.length;
		cur += source.copy(newView, cur, itr, next);
		cur += source.copy(to, cur);
		itr = next + length;
	}

	return newView;
}
