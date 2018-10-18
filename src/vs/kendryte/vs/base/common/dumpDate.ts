export namespace dumpDate {
	export function time(date: Date | string | number) {
		if (typeof date === 'string') {
			date = parseInt(date);
		}
		date = new Date(date as number);
		return `${date.getHours()}:${date.getHours()}:${date.getMinutes()}`;
	}

	export function date(date: Date | string | number, sp = '-') {
		if (typeof date === 'string') {
			date = parseInt(date);
		}
		date = new Date(date as number);
		return `${date.getFullYear()}${sp}${date.getMonth() + 1}${sp}${date.getDate()}`;
	}
}