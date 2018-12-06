export function arrayUnique<T>(arr: T[]): T[] {
	return arr.filter((item, index) => {
		return arr.lastIndexOf(item) === index;
	});
}
