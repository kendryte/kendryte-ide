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

function emojiByLevel(l: number) {
	if (isNaN(l)) {
		return '\uD83E\uDD14';
	}
	if (l < 20) { // 10K
		return '\uD83D\uDC0C';
	} else if (l < 100) { // 100K
		return '\uD83D\uDEB2';
	} else if (l < 1000) { // 1M
		return '\uD83D\uDE97';
	} else if (l < 20000) { // 20M
		return '\u2708\uFE0F';
	} else {
		return '\uD83D\uDE80';
	}
}