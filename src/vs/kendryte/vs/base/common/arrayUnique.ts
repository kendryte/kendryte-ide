export function arrayUnique<T>(arr: T[]): T[] {
	return arr.filter((item, index) => {
		return arr.lastIndexOf(item) === index;
	});
}

export function arrayRemoveDuplicate(arr: any[]): void {
	for (let index = arr.length - 1; index >= 0; index--) {
		if (arr.lastIndexOf(arr[index]) !== index) {
			arr.splice(index, 1);
		}
	}
}
