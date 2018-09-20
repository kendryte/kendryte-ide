export namespace dumpDate {
	export function time(date: Date | string | number) {
		if (typeof date === 'string') {
			date = parseInt(date);
		}
		date = new Date(date as number);
		return `${date.getHours()}:${date.getHours()}:${date.getMinutes()}`;
	}
}