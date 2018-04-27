'use strict';

import { TPromise } from 'vs/base/common/winjs.base';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';

export const IMaixService = createDecorator<IMaixService>('maixService');

export interface IMaixService {
	_serviceBrand: any;  // This field is required

	// dialog, just a test
	// deprecated, dont use!
	showSettingsDialog(): TPromise<void>;
}
