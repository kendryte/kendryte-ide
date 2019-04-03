export interface MapLike<V> {
	[id: string]: V;
}

export class ExtendMap<K, V> extends Map<K, V> {
	public getReq(id: K): V {
		const v = this.get(id);
		if (v) {
			return v;
		} else {
			throw new Error(`Unknown key ${id} in map.`);
		}
	}

	public getDef(id: K, def: V): V {
		return this.get(id) || def;
	}

	public entry(id: K, init: (id: K) => V): V {
		const v = this.get(id);
		if (v) {
			return v;
		} else {
			const nv = init(id);
			this.set(id, nv);
			return nv;
		}
	}
}
