export namespace dumpDate {
	export function time(date: Date | string | number) {
		if (typeof date === 'string') {
			date = parseInt(date);
		}
		date = new Date(date as number);
		return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
	}

	export function date(date: Date | string | number, sp = '-') {
		if (typeof date === 'string') {
			date = parseInt(date);
		}
		date = new Date(date as number);
		return `${date.getFullYear()}${sp}${date.getMonth() + 1}${sp}${date.getDate()}`;
	}

	export function datetime(date: Date | string | number) {
		if (typeof date === 'string') {
			date = parseInt(date);
		}
		date = new Date(date as number);
		return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
	}
}
