/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

interface Array<T> {
	findIndex(predicate: (value: T, index: number, obj: T[]) => boolean, thisArg?: any): number;
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