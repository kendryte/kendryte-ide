export interface ICommonLogger {
	trace(message: string): void;
	debug(message: string): void;
	info(message: string): void;
	warn(message: string): void;
	error(message: string | Error): void;
	critical(message: string | Error): void;
}