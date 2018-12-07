import { createDecorator } from 'vs/platform/instantiation/common/instantiation';

export interface IRelaunchRenderService {
	_serviceBrand: any;

	relaunch();
}

export const IRelaunchRenderService = createDecorator<IRelaunchRenderService>('relaunchService');

export interface IRelaunchMainService extends IRelaunchRenderService {
	preExit(): Promise<void>;
}

export const IRelaunchMainService = createDecorator<IRelaunchMainService>('relaunchService');
