/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

interface Array<T> {
	findIndex(predicate: (value: T, index: number, obj: T[]) => boolean, thisArg?: any): number;
}

interface ArrayConstructor {
	/**
	 * Creates an array from an iterable object.
	 * @param iterable An iterable object to convert to an array.
	 * @param mapfn A mapping function to call on every element of the array.
	 * @param thisArg Value of 'this' used to invoke the mapfn.
	 */
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
	assign<T, U>(target: T, source: U): T&U;

	assign<T, U, V>(target: T, source1: U, source2: V): T&U&V;

	assign<T, U, V, W>(target: T, source1: U, source2: V, source3: W): T&U&V&W;

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