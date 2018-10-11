/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

interface Array<T> {
	find<S extends T>(predicate: (this: void, value: T, index: number, obj: T[]) => value is S, thisArg?: any): S | undefined;
	find(predicate: (value: T, index: number, obj: T[]) => boolean, thisArg?: any): T | undefined;
	findIndex(predicate: (value: T, index: number, obj: T[]) => boolean, thisArg?: any): number;
	fill(value: T, start?: number, end?: number): this;
	copyWithin(target: number, start: number, end?: number): this;
}

interface ArrayConstructor {
	from<T, U = T>(iterable: Iterable<T>, mapfn?: (v: T, k: number) => U, thisArg?: any): U[];
}

interface Map<K, V> {
	entries(): IterableIterator<[K, V]>;
	keys(): IterableIterator<K>;
	values(): IterableIterator<V>;
	[Symbol.iterator](): IterableIterator<[K, V]>;
	// [Symbol.toStringTag]: string;
}

interface ObjectConstructor {
	assign<T, U>(target: T, source: U): T & U;
	assign<T, U, V>(target: T, source1: U, source2: V): T & U & V;
	assign<T, U, V, W>(target: T, source1: U, source2: V, source3: W): T & U & V & W;
	assign(target: object, ...sources: any[]): any;
}

interface IterableIterator<T> extends Iterator<T> {
	[Symbol.iterator](): IterableIterator<T>;
}

interface Iterator<T> {
	next(value?: any): IteratorResult<T>;
	return?(value?: any): IteratorResult<T>;
	throw?(e?: any): IteratorResult<T>;
}

interface IteratorResult<T> {
	done: boolean;
	value: T;
}

interface SymbolConstructor {
	readonly prototype: Symbol;
	(description?: string | number): symbol;
	for(key: string): symbol;
	keyFor(sym: symbol): string | undefined;
}

interface ProxyHandler<T extends object> {
	getPrototypeOf? (target: T): object | null;
	setPrototypeOf? (target: T, v: any): boolean;
	isExtensible? (target: T): boolean;
	preventExtensions? (target: T): boolean;
	getOwnPropertyDescriptor? (target: T, p: PropertyKey): PropertyDescriptor | undefined;
	has? (target: T, p: PropertyKey): boolean;
	get? (target: T, p: PropertyKey, receiver: any): any;
	set? (target: T, p: PropertyKey, value: any, receiver: any): boolean;
	deleteProperty? (target: T, p: PropertyKey): boolean;
	defineProperty? (target: T, p: PropertyKey, attributes: PropertyDescriptor): boolean;
	enumerate? (target: T): PropertyKey[];
	ownKeys? (target: T): PropertyKey[];
	apply? (target: T, thisArg: any, argArray?: any): any;
	construct? (target: T, argArray: any, newTarget?: any): object;
}

interface ProxyConstructor {
	revocable<T extends object>(target: T, handler: ProxyHandler<T>): { proxy: T; revoke: () => void; };
	new <T extends object>(target: T, handler: ProxyHandler<T>): T;
}

declare var Proxy: ProxyConstructor;

interface SymbolConstructor {
	readonly toStringTag: symbol;
}
