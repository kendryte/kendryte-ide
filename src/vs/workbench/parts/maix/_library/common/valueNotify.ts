import { ILogService } from 'vs/platform/log/common/log';
import { array_has_diff, object_has_diff } from 'vs/workbench/parts/maix/_library/common/utils';
import { Emitter } from 'vs/base/common/event';

export class ValueNotify {
	private _onInnerChange = new Emitter<any>();
	readonly onInnerChange = this._onInnerChange.event;

	private _onOuterChange = new Emitter<any>();
	readonly onOuterChange = this._onOuterChange.event;

	protected cached: any;

	constructor(private log: ILogService) { }

	notify(value: any, debugKey: string) {
		if (this.cacheMismatch(value)) {
			this.log.debug('%s: notify: changed (%O -> %O)', debugKey, this.cached, value);
			this.cached = value;
			this._onOuterChange.fire(value);
		} else {
			this.log.debug('%s: notify: not changed (%O -> %O)', debugKey, this.cached, value);
		}
	}

	updated(value: any, debugKey: string) {
		if (this.cacheMismatch(value)) {
			this.log.debug('%s: updated: changed (%O -> %O)', debugKey, this.cached, value);
			this.cached = value;
			this._onInnerChange.fire(value);
		} else {
			this.log.debug('%s: updated: not changed (%O -> %O)', debugKey, this.cached, value);
		}
	}

	private cacheMismatch(value: any) {
		if (Array.isArray(value) && this.cached) {
			return array_has_diff(value, this.cached);
		}
		if (value && typeof value === 'object' && this.cached) {
			return object_has_diff(value, this.cached);
		}
		return value !== this.cached;
	}
}
