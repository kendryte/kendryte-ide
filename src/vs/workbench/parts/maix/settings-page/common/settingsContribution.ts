import { Registry } from 'vs/platform/registry/common/platform';
import { Extensions, IConfigCategoryRegistry } from 'vs/workbench/parts/maix/settings-page/common/category';

const CategoryRegistry = Registry.as<IConfigCategoryRegistry>(Extensions.ConfigCategory);

CategoryRegistry.registerCategory({ id: 'build-deploy', category: '构建、部署' });
CategoryRegistry.registerCategory({ id: 'toolchain', category: 'Toolchain', parent: 'build-deploy' });
CategoryRegistry.registerCategory({ id: 'cmake', category: 'CMake', parent: 'build-deploy' });
CategoryRegistry.registerCategory({ id: 'debugger', category: '调试器', parent: 'build-deploy' });
CategoryRegistry.registerCategory({ id: 'deployment', category: '部署', parent: 'build-deploy' });

CategoryRegistry.registerCategory({ id: 'appearance', category: '界面设置' });
CategoryRegistry.registerCategory({ id: 'appearance.theme', category: '图标、颜色', parent: 'appearance' });
CategoryRegistry.registerCategory({ id: 'appearance.editor', category: '编辑器', parent: 'appearance' });

CategoryRegistry.addSettings('appearance.theme', [
	'workbench.colorTheme',
	'workbench.editor.showIcons',
	'workbench.iconTheme',
	'editor.fontFamily',
]);
CategoryRegistry.addSettings('appearance.editor', [
	'editor.fontSize',
	'editor.cursorBlinking',
	'editor.cursorStyle',
	'editor.cursorWidth',
]);

CategoryRegistry.addSettings('cmake', [
	'cmake.toolchainSearchDirs',
	'cmake.cmakePath',
]);

CategoryRegistry.addSettings('debugger', [
	'openocd.target',
	'openocd.targetIp',
	'openocd.port.core0',
	'openocd.port.core1',
]);

CategoryRegistry.addSettings('deployment', [
	'serialport.device',
	'serialport.reloadDevice',
	'flash.baudrate',
	'flash.weight',
	'flash.weightPath',
]);