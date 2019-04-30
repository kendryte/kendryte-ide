import { createDecorator } from 'vs/platform/instantiation/common/instantiation';

export interface IKendrytePackageJsonEditorService {
	_serviceBrand: any;

}

export const IKendrytePackageJsonEditorService = createDecorator<IKendrytePackageJsonEditorService>('kendrytePackageJsonEditorService');
