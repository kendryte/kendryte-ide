export enum SerialOpenMode {
	raw,
	term,
}

export interface ILocalOptions {
	outputCharset: 'binary' | 'utf8' | 'bin2hex' | 'bin2hexasc';
	inputCharset: 'latin1' | 'utf8' | 'hex';
	lineEnding: 'No' | '\\n' | '\\r\\n' | '\\r' | '\\0';
	escape: boolean;
	echo: boolean;
	translateLineFeed: 'No' | '\\n' | '\\r\\n' | '\\r';
	hexLineFeed: boolean;
}

export function nullMonitorOptions(): ILocalOptions {
	return <Partial<ILocalOptions>>{
		outputCharset: undefined,
		inputCharset: undefined,
		lineEnding: undefined,
		escape: undefined,
		echo: undefined,
		translateLineFeed: undefined,
		hexLineFeed: undefined,
	} as ILocalOptions;
}
