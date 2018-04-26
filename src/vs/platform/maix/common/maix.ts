'use strict';

import { TPromise } from 'vs/base/common/winjs.base';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
// import { Event } from 'vs/base/common/event';

export const IMaixService = createDecorator<IMaixService>('maixService');

export interface IMaixService {
	_serviceBrand: any;  // This field is required

	// dialog
	showSettingsDialog(): TPromise<void>;

	setMaixSettingsHidden(hidden: boolean): void;

	// // events
	// readonly onMaixSettingsShow: Event<boolean>;
}
