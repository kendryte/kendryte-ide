import { Action } from 'vs/base/common/actions';
import { localize } from 'vs/nls';
import { IPackageRegistryService, PACKAGE_MANAGER_ACTION_ID_OPEN_MARKET } from 'vs/kendryte/vs/workbench/packageManager/common/type';

export class OpenPackagesMarketPlaceAction extends Action {
	static readonly ID = PACKAGE_MANAGER_ACTION_ID_OPEN_MARKET;
	static readonly LABEL = localize('openMarketPlace', 'Explorer Packages');

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