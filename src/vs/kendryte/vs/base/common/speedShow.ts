import { localize } from 'vs/nls';

export function showDownloadSpeed(total: number, workedStart: number = 0) {
	const startAt = Date.now();

	return function (worked: number): string {
		if (worked === 0) {
			return '...';
		}
		const kbps = (worked - workedStart) / (Date.now() - startAt);
		const kbpsStr = isNaN(kbps) ? 'Unknown' : kbps.toFixed(1) + 'KB/s';

		const complete = 100 * worked / total;
		const completeStr = isNaN(complete) ? 'Unknown' : complete.toFixed(1) + '%';

		const speedLevel = emojiByLevel(kbps);

		return localize('kendryte.download.message', 'Complete: {0} {1} Speed@ {2}', completeStr, speedLevel, kbpsStr);
	};
}

function emojiByLevel(bps: number) {
	if (isNaN(bps)) {
		return '\uD83E\uDD14';
	}
	if (bps < 20) { // 10K
		return '\uD83D\uDC0C';
	} else if (bps < 100) { // 100K
		return '\uD83D\uDEB2';
	} else if (bps < 1000) { // 1M
		return '\uD83D\uDE97';
	} else if (bps < 20000) { // 20M
		return '\u2708\uFE0F';
	} else {
		return '\uD83D\uDE80';
	}
}

export function humanSize(bytes: number, fixed = 2) {
	if (bytes < 1024) {
		return bytes + 'B';
	} else if (bytes < 1048576) { // 1024 * 1024
		return (bytes / 1024).toFixed(fixed) + 'KB';
	} else if (bytes < 1073741824) { // 1024 * 1024 * 1024
		return (bytes / 1048576).toFixed(fixed) + 'MB';
	} else {
		return (bytes / 1073741824).toFixed(fixed) + 'GB';
	}
}

export function humanSpeed(bps: number, fixed = 2) {
	return humanSize(bps) + '/s';
}

export class SpeedMeter {
	private startTime: number;
	private deltaTime: number;
	private currentBytes: number;

	constructor() {
	}

	public getSpeed() {
		if (this.deltaTime) {
			return humanSpeed(1000 * this.currentBytes / this.deltaTime);
		} else {
			return humanSpeed(1000 * this.currentBytes / (Date.now() - this.startTime));
		}
	}

	public setCurrent(currentBytes: number) {
		this.currentBytes = currentBytes;
	}

	public start() {
		this.startTime = Date.now();
	}

	public complete() {
		this.deltaTime = Date.now() - this.startTime;
	}
}
