export function array_has_diff(a: any[], b: any[]) {
	if (a.length === b.length) {
		for (let i = 0; i < a.length; i++) {
			if (a[i] !== b[i]) {
				return true;
			}
		}
		return false;
	} else {
		return true;
	}
}

export function object_has_diff(a: any, b: any) {
	const keys = Object.keys(a);

	if (array_has_diff(keys, Object.keys(b))) {
		return true;
	}
	for (const i of keys) {
		if (a[i] !== b[i]) {
			return true;
		}
	}
	return false;
}