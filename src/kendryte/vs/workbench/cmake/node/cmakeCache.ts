import { exists, readFile } from 'vs/base/node/pfs';
import { CMAKE_VAE_TYPE } from 'kendryte/vs/workbench/cmake/common/cmakeProtocol/message';

const falseValue = /^(FALSE|OFF|0|NOTFOUND|NO|N|IGNORE|.*-NOTFOUND)$/;

export function isTruthy(value: (boolean | string | null | undefined | number)) {
	if (typeof value === 'string' && value) {
		return !falseValue.test(value);
	}
	return !!value;
}

export class Entry {
	private readonly _type: CMAKE_VAE_TYPE;
	private readonly _docs: string = '';
	private readonly _key: string = '';
	private readonly _value: any = null;
	private readonly _advanced: boolean = false;

	get type() { return this._type; }

	get helpString() { return this._docs; }

	get key() { return this._key; }

	get value() { return this._value; }

	as<T>(): T { return this.value as T; }

	get advanced() { return this._advanced; }

	constructor(
		key: string,
		value: string,
		type: CMAKE_VAE_TYPE,
		docs: string,
		advanced: boolean,
	) {
		this._key = key;
		this._type = type;
		if (type === CMAKE_VAE_TYPE.BOOL) {
			this._value = isTruthy(value);
		} else {
			this._value = value;
		}
		this._docs = docs;
		this._advanced = advanced;
	}

	getNumber() {
		return parseFloat(this.value);
	}
}

export class CMakeCache {
	static async fromPath(path: string): Promise<CMakeCache> {
		const isExists = await exists(path);
		if (isExists) {
			const content = await readFile(path);
			const entries = CMakeCache.parseCache(content.toString());
			return new CMakeCache(path, isExists, entries);
		} else {
			return new CMakeCache(path, isExists, new Map());
		}
	}

	/** Get a list of all cache entries */
	get allEntries(): Entry[] { return Array.from(this._entries.values()); }

	/**
	 * Create a new instance. This is **private**. You may only create an instance
	 * via the `fromPath` static method.
	 * @param _path Path to the cache
	 * @param _exists Whether the file exists
	 * @param _entries Entries in the cache
	 */
	private constructor(
		private readonly _path: string,
		private readonly _exists: boolean,
		private readonly _entries: Map<string, Entry>,
	) { }

	/**
	 * `true` if the file exists when this instance was created.
	 * `false` otherwise.
	 */
	get exists() { return this._exists; }

	/**
	 * The path to the cache file, which may not exist
	 */
	get path() { return this._path; }

	/**
	 * Reload the cache file and return a new instance. This will not modify this
	 * instance.
	 * @returns A **new instance**.
	 */
	getReloaded(): Promise<CMakeCache> {
		return CMakeCache.fromPath(this.path);
	}

	/**
	 * Parse the contents of a CMake cache file.
	 * @param content The contents of a CMake cache file.
	 * @returns A map from the cache keys to the entries in the cache.
	 */
	static parseCache(content: string): Map<string, Entry> {
		const lines = content.split(/\r\n|\n|\r/)
			.filter(line => !!line.length)
			.filter(line => !/^\s*#/.test(line));

		const entries = new Map<string, Entry>();
		let docs_acc = '';
		for (const line of lines) {
			if (/^\/\//.test(line)) {
				docs_acc += /^\/\/(.*)/.exec(line)![1] + ' ';
			} else {
				const match = /^(.*?):(.*?)=(.*)/.exec(line);
				if (!match) {
					continue;
				}
				const [, name, typename, valuestr] = match;
				if (!name || !typename) {
					continue;
				}
				const advance = /-ADVANCED$/.test(name);
				if (advance && valuestr === '1') {
					// We skip the ADVANCED property variables. They're a little odd.
				} else {
					const key = name;
					const type = CMAKE_VAE_TYPE[typename];
					const docs = docs_acc.trim();
					docs_acc = '';
					if (!type) {
						console.warn('%ccmake type %s is unknown', 'color:red', typename);
					} else {
						entries.set(name, new Entry(key, valuestr, type, docs, advance));
					}
				}
			}
		}

		return entries;
	}

	/**
	 * Get an entry from the cache
	 * @param key The name of a cache entry
	 * @returns The cache entry, or `null` if the cache entry is not present.
	 */
	get(key: string): Entry | null {
		return this._entries.get(key) || null;
	}
}
