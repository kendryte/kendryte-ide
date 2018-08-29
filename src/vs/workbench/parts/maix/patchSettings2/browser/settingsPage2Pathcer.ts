export function PatchClassMethodFunction<T extends Function>(Class: any, wrapperName: string, wrapper: (original: T) => T) {
	const original = Class.prototype[wrapperName];
	if (!original) {
		throw new TypeError('[PatchClassMethodFunction]: function ' + wrapperName + ' is not found in original class.');
	}

	Class.prototype[wrapperName] = wrapper(original);
}
