import { registerMainSingleton } from 'vs/kendryte/vs/platform/instantiation/common/mainExtensions';
import { IStorageService, IWorkspaceStorageChangeEvent, StorageScope } from 'vs/platform/storage/common/storage';
import { Disposable } from 'vs/base/common/lifecycle';
import { Emitter } from 'vs/base/common/event';
import { isUndefinedOrNull } from 'vs/base/common/types';
import Store = require('electron-store');

class StorageMainService extends Disposable implements IStorageService {
	_serviceBrand: any;

	private readonly _store = new Store();

	private readonly _onDidChangeStorage: Emitter<IWorkspaceStorageChangeEvent>;
	public readonly onDidChangeStorage = this._onDidChangeStorage.event;
	private readonly _onWillSaveState: Emitter<void>;
	public readonly onWillSaveState = this._onWillSaveState.event;

	constructor() {
		super();
	}

	public get(key: string, scope: StorageScope, fallbackValue?: string): string | undefined {
		return this._store.get(key) || fallbackValue;
	}

	public getBoolean(key: string, scope: StorageScope, fallbackValue?: boolean): boolean | undefined {
		return this._store.has(key) ? !!this._store.get(key) : fallbackValue;
	}

	public getInteger(key: string, scope: StorageScope, fallbackValue?: number): number | undefined {
		return this._store.has(key) ? parseInt(this._store.get(key), 10) : fallbackValue;
	}

	public store(key: string, value: any, scope: StorageScope): void {
		if (isUndefinedOrNull(value)) {
			return this.remove(key, null);
		}
		const valueStr = String(value);
		this._store.set(key, valueStr);
	}

	public remove(key: string, scope: StorageScope): void {
		this._store.delete(key);
	}
}

registerMainSingleton(IStorageService, StorageMainService);