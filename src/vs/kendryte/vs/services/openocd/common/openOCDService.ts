import { createDecorator } from 'vs/platform/instantiation/common/instantiation';

export interface IOpenOCDService {
	_serviceBrand: any;

	getCurrentPort(): number;
	start(): Promise<void>;
	stop(): Promise<void>;
	restart(): Promise<void>;
}

export const IOpenOCDService = createDecorator<IOpenOCDService>('openOCDService');