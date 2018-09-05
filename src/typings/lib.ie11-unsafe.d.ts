/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

interface Array<T> {
	/**
	 * Returns the value of the first element in the array where predicate is true, and undefined
	 * otherwise.
	 * @param predicate find calls predicate once for each element of the array, in ascending
	 * order, until it finds one where predicate returns true. If such an element is found, find
	 * immediately returns that element value. Otherwise, find returns undefined.
	 * @param thisArg If provided, it will be used as the this value for each invocation of
	 * predicate. If it is not provided, undefined is used instead.
	 */
	find<S extends T>(predicate: (this: void, value: T, index: number, obj: T[]) => value is S, thisArg?: any): S | undefined;
	find(predicate: (value: T, index: number, obj: T[]) => boolean, thisArg?: any): T | undefined;

	/**
	 * Returns the index of the first element in the array where predicate is true, and -1
	 * otherwise.
	 * @param predicate find calls predicate once for each element of the array, in ascending
	 * order, until it finds one where predicate returns true. If such an element is found,
	 * findIndex immediately returns that element index. Otherwise, findIndex returns -1.
	 * @param thisArg If provided, it will be used as the this value for each invocation of
	 * predicate. If it is not provided, undefined is used instead.
	 */
	findIndex(predicate: (value: T, index: number, obj: T[]) => boolean, thisArg?: any): number;

	/**
	 * Returns the this object after filling the section identified by start and end with value
	 * @param value value to fill array section with
	 * @param start index to start filling the array at. If start is negative, it is treated as
	 * length+start where length is the length of the array.
	 * @param end index to stop filling the array at. If end is negative, it is treated as
	 * length+end.
	 */
	fill(value: T, start?: number, end?: number): this;

	/**
	 * Returns the this object after copying a section of the array identified by start and end
	 * to the same array starting at position target
	 * @param target If target is negative, it is treated as length+target where length is the
	 * length of the array.
	 * @param start If start is negative, it is treated as length+start. If end is negative, it
	 * is treated as length+end.
	 * @param end If not specified, length of the this object is used as its default value.
	 */
	copyWithin(target: number, start: number, end?: number): this;
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