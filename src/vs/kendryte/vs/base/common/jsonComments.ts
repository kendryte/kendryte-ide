import { parse, ParseError } from 'vs/base/common/json';
import { getParseErrorMessage } from 'vs/base/common/jsonErrorMessages';
import { localize } from 'vs/nls';

export interface ExParseError extends ParseError {
	message: string;
}

export function parseExtendedJson<T>(content: string, fileName: string = 'JSON'): [T, ExParseError[]] {
	const errors: ParseError[] = [];
	const data: T = parse(content, errors);

	return [
		data,
		errors.map((error) => {
			return {
				...error,
				message: localize('jsonsParseReportErrors', 'Failed to parse {0}: {1}.', fileName, getParseErrorMessage(error.error)),
			};
		}),
	];
}