import { Registry } from 'vs/platform/registry/common/platform';
import { Extensions, IConfigCategoryRegistry } from 'vs/kendryte/vs/platform/config/common/category';
import { commonlyUsedData } from 'vs/workbench/parts/preferences/browser/settingsLayout';
import { localize } from 'vs/nls';

const CategoryRegistry = Registry.as<IConfigCategoryRegistry>(Extensions.ConfigCategory);
if (!CategoryRegistry) {
	debugger;
	(require('electron') as any).remote.getCurrentWindow().reload();
}

CategoryRegistry.registerCategory({ id: 'build-deploy', category: localize('and', '{0} and {1}', localize('build', 'Build'), localize('debug', 'Debug')) });
CategoryRegistry.registerCategory({ id: 'build', category: localize('build', 'Build'), parent: 'build-deploy' });
CategoryRegistry.registerCategory({ id: 'debugger', category: localize('debug', 'Debug'), parent: 'build-deploy' });
CategoryRegistry.registerCategory({ id: 'deployment', category: localize('deploy', 'Deploy'), parent: 'build-deploy' });

commonlyUsedData.settings = [
	'workbench.colorTheme',
	'workbench.editor.showIcons',
	'workbench.iconTheme',
	'editor.fontFamily',
	'editor.fontSize',
	'editor.cursorBlinking',
	'editor.cursorStyle',
	'editor.cursorWidth',
];
