import { createDecorator } from 'vs/platform/instantiation/common/instantiation';

export interface ISerialMonitorControlService {
	_serviceBrand: any;

	copySelection();

	paste();

	clearScreen(): void;

	focusFindWidget(): void;
}

export const ISerialMonitorControlService = createDecorator<ISerialMonitorControlService>('serialMonitorControlService');