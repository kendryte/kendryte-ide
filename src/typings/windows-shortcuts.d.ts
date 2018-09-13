declare module 'windows-shortcuts' {
	interface ErrorHandler {
		(err: Error): void;
	}

	interface Handler<T> {
		(err: Error, data: T): void;
	}

	enum WindowType {
		NORMAL,
		MAX,
		MIN,
	}

	export const NORMAL: WindowType;
	export const MAX: WindowType;
	export const MIN: WindowType;

	export interface IShortcutValue extends IShortcutOptions {
		expanded: string;
	}

	export interface IShortcutOptions {
		target: string;
		args?: string;
		workingDir?: string;
		runStyle?: WindowType;
		icon?: string;
		iconIndex?: string;
		hotkey?: number;
		desc?: string;
	}

	export function edit(src: string, options: IShortcutOptions, callback?: ErrorHandler): void;

	export function query(src: string, callback?: Handler<IShortcutValue>): void;

	export function create(src: string, options: IShortcutOptions, callback?: ErrorHandler): void;
	export function create(src: string, dest: string, callback?: ErrorHandler): void;
}