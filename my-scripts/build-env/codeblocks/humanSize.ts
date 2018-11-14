export function humanSize(n: string): string {
	let size = parseInt(n);
	if (isNaN(size)) {
		return 'Unknown';
	}
	if (size < 1024) {
		return size.toFixed(0) + 'B';
	}
	size = size / 1024;
	if (size < 1024) {
		return size.toFixed(2) + 'KB';
	}
	size = size / 1024;
	if (size < 1024) {
		return size.toFixed(2) + 'MB';
	}
	size = size / 1024;
	return size.toFixed(2) + 'GB';
}