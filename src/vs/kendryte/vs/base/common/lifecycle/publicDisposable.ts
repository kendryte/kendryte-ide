import { IDisposable } from 'vs/base/common/lifecycle';
import { StatefulDisposable } from 'vs/kendryte/vs/base/common/lifecycle/statefulDisposable';

export class PublicDisposable extends StatefulDisposable {
	registerWith<T extends IDisposable>(t: T): T {
		return this._register(t);
	}
}
