import { Registry } from 'vs/platform/registry/common/platform';
import { Extensions, IConfigCategoryRegistry } from 'vs/kendryte/vs/platform/config/common/category';
import { commonlyUsedData } from 'vs/workbench/contrib/preferences/browser/settingsLayout';
import { CONFIG_CATEGORY } from 'vs/kendryte/vs/base/common/configKeys';
import { openModeSettingKey } from 'vs/platform/list/browser/listService';

const CategoryRegistry = Registry.as<IConfigCategoryRegistry>(Extensions.ConfigCategory);
if (!CategoryRegistry) {
	debugger;
	(require('electron') as any).remote.getCurrentWindow().reload();
}

for (const object of Object.values(CONFIG_CATEGORY)) {
	CategoryRegistry.registerCategory(object);
}

commonlyUsedData.settings = [
	'window.titleBarStyle',
	'workbench.colorTheme',
	openModeSettingKey,
	'workbench.iconTheme',
	'editor.fontFamily',
	'editor.fontSize',
	'editor.cursorBlinking',
	'editor.cursorStyle',
	'editor.cursorWidth',
	'C_Cpp.clang_format_fallbackStyle',
];
