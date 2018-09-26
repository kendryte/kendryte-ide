import { ChipPackageType, IChipPackagingCalculated } from 'kendryte/vs/workbench/fpioaConfig/common/packagingTypes';
import { BGATableRender } from 'kendryte/vs/workbench/fpioaConfig/electron-browser/editor/right/bgaTable';
import { AbstractTableRender } from 'kendryte/vs/workbench/fpioaConfig/electron-browser/editor/right/abstract';
import { IThemeService } from 'vs/platform/theme/common/themeService';

export function chipRenderFactory(chip: IChipPackagingCalculated, themeService: IThemeService): AbstractTableRender<any> {
	switch (chip.geometry.type) {
		case ChipPackageType.BGA:
			return new BGATableRender(chip, themeService);
		default:
			throw new Error('unknwon chip type: ' + chip.geometry.type);
	}
}
