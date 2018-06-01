import { ChipPackageType, IChipPackagingCalculated } from 'vs/workbench/parts/maix/fpgio-config/common/packagingTypes';
import { BGATableRender } from 'vs/workbench/parts/maix/fpgio-config/electron-browser/editor/right/bgaTable';
import { AbstractTableRender } from 'vs/workbench/parts/maix/fpgio-config/electron-browser/editor/right/abstract';

export function chipRenderFactory(chip: IChipPackagingCalculated): AbstractTableRender {
	switch (chip.geometry.type) {
		case ChipPackageType.BGA:
			return new BGATableRender(chip);
		default:
			throw new Error('unknwon chip type: ' + chip.geometry.type);
	}
}
