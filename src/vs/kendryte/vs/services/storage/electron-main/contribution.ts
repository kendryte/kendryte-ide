import { registerMainSingleton } from 'vs/kendryte/vs/platform/instantiation/common/mainExtensions';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IStorage, StorageService } from 'vs/platform/storage/common/storageService';

import Store = require('electron-store');

class MainStorage implements IStorage {
	private readonly store = new Store();

	get length() { return this.store.size; }

	public key(index: number) {
		return Object.keys(this.store.store)[index];
	}

	public setItem(key: string, value: any): void {
		this.store.set(key, value);
	}

	public getItem(key: string): string {
		return this.store.get(key);
	}

	public removeItem(key: string): void {
		return this.store.delete(key);
	}
}

class StorageMainService extends StorageService {
	constructor() {
		super(new MainStorage, null);
	}
}

registerMainSingleton(IStorageService, StorageMainService);