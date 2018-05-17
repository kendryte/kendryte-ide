import { localize } from 'vs/nls';
import { Extensions as ConfigurationExtensions, IConfigurationRegistry } from 'vs/platform/configuration/common/configurationRegistry';
import { Registry } from 'vs/platform/registry/common/platform';
import { Extensions, IConfigCategoryRegistry } from 'vs/workbench/parts/maix/common/category';

const CategoryRegistry = Registry.as<IConfigCategoryRegistry>(Extensions.ConfigCategory);

CategoryRegistry.registerCategory({ id: 'build-deploy', category: '构建、部署' });
CategoryRegistry.registerCategory({ id: 'toolchain', category: 'Toolchain', parent: 'build-deploy' });
CategoryRegistry.registerCategory({ id: 'cmake', category: 'CMake', parent: 'build-deploy' });
CategoryRegistry.registerCategory({ id: 'debugger', category: '调试器', parent: 'build-deploy' });
CategoryRegistry.registerCategory({ id: 'deployment', category: '部署', parent: 'build-deploy' });

CategoryRegistry.registerCategory({ id: 'appearance', category: '界面设置' });
CategoryRegistry.registerCategory({ id: 'appearance.theme', category: '主题', parent: 'appearance' });
CategoryRegistry.registerCategory({ id: 'appearance.look', category: '外观', parent: 'appearance' });

CategoryRegistry.addSettings('appearance.theme', [
	'workbench.colorTheme',
	'workbench.editor.showIcons',
	'workbench.iconTheme',
	'editor.fontFamily',
]);
CategoryRegistry.addSettings('appearance.look', [
	'editor.fontSize',
	'editor.cursorBlinking',
	'editor.cursorStyle',
	'editor.cursorWidth',
]);

Registry.as<IConfigurationRegistry>(ConfigurationExtensions.Configuration)
	.registerConfiguration({
		id: 'maix',
		title: localize('sampleConfigurationTitle', 'Maix'),
		properties: {
			'maix.config.sample': {
				category: 'appearance',
				type: 'string',
				enum: ['A', 'B', 'C'],
				enumDescriptions: [
					localize({
						comment: ['comment for option A'],
						key: 'maix.sampleEnum.A'
					}, 'Start without an editor.'),
					localize({
						comment: ['comment for option B'],
						key: 'maix.sampleEnum.B'
					}, 'Open the Welcome page (default).'),
					localize({
						comment: ['comment for option C'],
						key: 'maix.sampleEnum.C'
					}, 'Sample Enum Description.'),
				],
				default: 'A',
				description: localize('sampleConfigurationDesc', 'Sample Config Description.')
			},
		}
	} as any);
