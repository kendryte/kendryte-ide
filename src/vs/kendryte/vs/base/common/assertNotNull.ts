export function assertNotNull<T>(val: T | null | undefined): T {
	console.assert(val !== undefined && val !== null, 'AssertValue failed, got undefined or null.');
	return val as any;
}

export function throwNull<T>(val: T | null | undefined): T {
	if (val !== undefined && val !== null) {
		return val;
	} else {
		throw new Error('Value is null');
	}
}
