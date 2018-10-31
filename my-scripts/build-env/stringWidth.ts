import ansiRegexConstructor = require('ansi-regex');
import isFullwidthCodePoint = require('is-fullwidth-code-point');
import emojiRegexConstructor = require('emoji-regex/es2015');

function modifyRegexp(reg: RegExp): RegExp {
	const str = reg.toString().slice(1);
	const li = str.lastIndexOf('/');
	return new RegExp('^(?:' + str.slice(0, li) + ')', str.slice(li + 1));
}

const ansiRegex = ansiRegexConstructor();
const ansiRegexStarting = modifyRegexp(ansiRegex);

const emojiRegex = emojiRegexConstructor();
const emojiRegexStarting = modifyRegexp(emojiRegex);


export function stringLimitWidth(str: string, maxWidth: number): [string, number] {
	if (!str || !str.length) {
		return ['', 0];
	}

	let width = 0;

	console.log(str, str.length, Buffer.from(str, 'utf8').toString('HEX'));

	for (let i = 0; i < str.length; i++) {
		const code = str.codePointAt(i);
		console.log(i, code, code.toString(16), str.slice(i, i + 1));

		// Ignore control characters
		if (code <= 0x1F || (code >= 0x7F && code <= 0x9F)) {
			continue;
		}

		// Ignore combining characters
		if (code >= 0x300 && code <= 0x36F) {
			continue;
		}

		// Surrogates
		if (code > 0xFFFF) {
			i++;
		}

		const v = str.slice(i);
		let currentI = i;
		let currentWidth = width;
		if (emojiRegexStarting.test(v)) {
			console.log('eml', emojiRegexStarting.exec(v)[0].length);
			i += emojiRegexStarting.exec(v)[0].length - 1;
			width += 2;
		} else {
			const em = emojiRegex.exec(v);
			if (em && em.index === 0) {
				i += ansiRegexStarting.exec(v)[0].length - 1;
				continue;
			}

			width += isFullwidthCodePoint(code) ? 2 : 1;
		}

		if (width === maxWidth) {
			console.log(1);
			return [str.slice(0, i), width];
		} else if (width >= maxWidth) {
			console.log(2);
			return [str.slice(0, currentI), currentWidth];
		}
	}

	return [str, width];
}

const fwSpace = String.fromCodePoint(0x115f);

export function stringWidth(str: string) {
	if (!str || !str.length) {
		return 0;
	}

	str = str.replace(emojiRegex, fwSpace);
	str = str.replace(ansiRegex, '');

	let width = 0;

	for (let i = 0; i < str.length; i++) {
		const code = str.codePointAt(i);

		// Ignore control characters
		if (code <= 0x1F || (code >= 0x7F && code <= 0x9F)) {
			continue;
		}

		// Ignore combining characters
		if (code >= 0x300 && code <= 0x36F) {
			continue;
		}

		// Surrogates
		if (code > 0xFFFF) {
			i++;
		}

		width += isFullwidthCodePoint(code) ? 2 : 1;
	}

	return width;
}