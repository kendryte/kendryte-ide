import { Action } from 'vs/base/common/actions';
import { localize } from 'vs/nls';
import { IPackageRegistryService } from 'vs/kendryte/vs/workbench/packageManager/common/type';
import { ACTION_ID_PACKAGE_MANAGER_OPEN_MARKET, ACTION_LABEL_PACKAGE_MANAGER_OPEN_MARKET } from 'vs/kendryte/vs/base/common/menu/packageManager';

export class OpenPackagesMarketPlaceAction extends Action {
	static readonly ID = ACTION_ID_PACKAGE_MANAGER_OPEN_MARKET;
	static readonly LABEL = ACTION_LABEL_PACKAGE_MANAGER_OPEN_MARKET;
	static readonly LABEL_EXAMPLE = localize('openMarketPlaceExample', 'Find an examples');

	constructor(
		id: string = OpenPackagesMarketPlaceAction.ID,
		label: string = OpenPackagesMarketPlaceAction.LABEL,
		@IPackageRegistryService private packageRegistryService: IPackageRegistryService,
	) {
		super(id, label, 'open-markplace-icon');
	}

	run() {
		return this.packageRegistryService.openBrowser();
	}
}