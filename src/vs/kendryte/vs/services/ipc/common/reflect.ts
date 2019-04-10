function getOwnMethods(o: any) {
	const ret: string[] = [];
	for (const prop of Object.getOwnPropertyNames(o)) {
		if (prop === 'constructor') {
			continue;
		}
		const desc = Object.getOwnPropertyDescriptor(o, prop);
		if (desc && typeof desc.value === 'function') {
			ret.push(prop);
		}
	}
	return ret;
}

export function getAllMethodOf(o: any) {
	const ret = getOwnMethods(o);

	let c = o.constructor;
	while (c && c.prototype && c !== Object) {
		ret.push(...getOwnMethods(c.prototype));
		c = Object.getPrototypeOf(c);
	}
	return ret;
}
