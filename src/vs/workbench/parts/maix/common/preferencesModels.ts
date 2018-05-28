import { EditorModel } from 'vs/workbench/common/editor';
import { ISetting } from 'vs/workbench/services/preferences/common/preferences';
import { DefaultSettingsEditorModel } from 'vs/workbench/services/preferences/common/preferencesModels';
import { TPromise } from 'vs/base/common/winjs.base';
import { ILogService } from 'vs/platform/log/common/log';

export interface ITitle {
	title: '';
}

export class MySettingsEditorModelWrapper extends EditorModel {
	protected mapper: { [id: string]: ISetting };
	protected filteredList: (ITitle | ISetting)[] = [];
	private waittingConfig: [number, string][];
	private waitDfd: Deferred<void>;

	public get settings(): (ITitle | ISetting)[] {
		return this.filteredList;
	}

	constructor(
		private readonly model: DefaultSettingsEditorModel,
		protected currentCategory: string,
		@ILogService private log: ILogService,
	) {
		super();

		this.recreate();
		this._register(model.onDidChangeGroups(() => this.recreate()));
	}

	private recreate() {
		this.mapper = {};
		for (const group of this.model.settingsGroups) {
			for (const section of group.sections) {
				for (const setting of section.settings) {
					this.mapper[setting.key] = setting;
				}
			}
		}
		if (this.waittingConfig) {
			for (let index = this.waittingConfig.length - 1; index >= 0; index--) {
				const [order, id] = this.waittingConfig[index];
				if (this.mapper[id]) {
					this.log.debug('---recreate: fill %s', id);
					this.filteredList[order] = this.mapper[id];
					this.waittingConfig.splice(index, 1);
				}
			}
			if (this.waittingConfig.length === 0) {
				this.waitDfd.resolve();
				this.waitDfd = null;
				this.waittingConfig = null;
			}
		}
	}

	public rememberCategory(cate: string) {
		this.currentCategory = cate;
	}

	public getRememberedCategory() {
		return this.currentCategory || '';
	}

	public setCategoryFilter(idList: string[]): TPromise<void> | void {
		this.log.debug('---setCategoryFilter');
		if (this.waitDfd) {
			this.waitDfd.reject('cancel: ' + this.waittingConfig.join(', '));
			this.waitDfd = null;
		}
		this.waittingConfig = [];
		this.filteredList = (idList || []).map((settingId, index) => {
			if (settingId.indexOf('--') === 0) {
				return {
					title: settingId.replace(/^--/, '')
				} as ITitle;
			} else {
				if (!this.mapper[settingId]) {
					this.waittingConfig.push([index, settingId]);
				}
				return this.mapper[settingId];
			}
		});
		if (this.waittingConfig.length) {
			if (!this.waitDfd) {
				this.waitDfd = new Deferred<void>();
				this.log.debug('---WAIT', this.waittingConfig);
				return this.waitDfd;
			}
		} else {
			this.waittingConfig = null;
		}
	}

	async wait() {
		await this.waitDfd;
	}
}

class Deferred<T> extends TPromise<T> {
	private _resolve: (value: T | PromiseLike<T>) => void;
	private _reject: (reason: any) => void;

	constructor() {
		let _resolve, _reject;
		super((resolve, reject) => {
			_resolve = resolve;
			_reject = reject;
		});
		this._resolve = _resolve;
		this._reject = _reject;
	}

	resolve(value?: T | PromiseLike<T>) {
		this._resolve(value);
	}

	reject(reason: any) {
		this._reject(reason);
	}
}