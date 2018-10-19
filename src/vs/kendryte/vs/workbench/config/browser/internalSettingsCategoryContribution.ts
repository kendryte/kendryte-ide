import { Registry } from 'vs/platform/registry/common/platform';
import { Extensions, IConfigCategoryRegistry } from 'vs/kendryte/vs/workbench/config/common/type';
import { commonlyUsedData } from 'vs/workbench/parts/preferences/browser/settingsLayout';

const CategoryRegistry = Registry.as<IConfigCategoryRegistry>(Extensions.ConfigCategory);
if (!CategoryRegistry) {
	debugger;
	(require('electron') as any).remote.getCurrentWindow().reload();
}

CategoryRegistry.registerCategory({ id: 'build-deploy', category: '构建与调试' });
CategoryRegistry.registerCategory({ id: 'debugger', category: '调试器', parent: 'build-deploy' });
CategoryRegistry.registerCategory({ id: 'deployment', category: '上传', parent: 'build-deploy' });

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

CategoryRegistry.addSettings('debugger', [
	'debugger.target',
	'debugger.targetIp',
	'debugger.port.core0',
	'debugger.port.core1',
]);

CategoryRegistry.addSettings('deployment', [
	'serialport.device',
	'serialport.reloadDevice',
	'flash.baudrate',
	'flash.weight',
	'flash.weightPath',
]);