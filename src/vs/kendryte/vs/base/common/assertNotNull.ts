export function assertNotNull<T>(val: T) {
	console.assert(val !== undefined && val !== null, 'AssertValue failed, got undefined or null.');
	return val!;
}

export function throwNull<T>(val: T) {
	if (val !== undefined && val !== null) {
		return val!;
	} else {
		throw new Error('Value is null');
	}
}
