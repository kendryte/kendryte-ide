import { TPromise } from 'vs/base/common/winjs.base';
import { IDataSource, ITree } from 'vs/base/parts/tree/browser/tree';

export class ConfigFileCategorySource implements IDataSource {
	public getChildren(tree: ITree, element: ISettingsCategoryTree): TPromise<ISettingsCategoryTree[]> {
		return TPromise.as(element.children);
	}

	public getId(tree: ITree, element: ISettingsCategoryTree): string {
		return element.category;
	}

	public getParent(tree: ITree, element: ISettingsCategoryTree): TPromise<ISettingsCategoryTree> {
		return TPromise.as(element.parent);
	}

	public hasChildren(tree: ITree, element: ISettingsCategoryTree): boolean {
		return element.children && element.children.length > 0;
	}

	public shouldAutoexpand(tree: ITree, element: ISettingsCategoryTree): boolean {
		return !element.parent;
	}
}
