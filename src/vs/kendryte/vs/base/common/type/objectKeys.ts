export function objectKeys<T extends object>(object: T): (keyof T)[] {
	return Object.keys(object) as any;
}

export function objectEntries<T extends object, KT extends keyof T>(object: T): [KT, T[KT]][] {
	return Object.entries(object) as any;
}
