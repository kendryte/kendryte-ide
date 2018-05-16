import { localize } from 'vs/nls';
import { Extensions as ConfigurationExtensions, IConfigurationRegistry } from 'vs/platform/configuration/common/configurationRegistry';
import { Registry } from 'vs/platform/registry/common/platform';
import { Extensions, IConfigCategoryRegistry } from 'vs/workbench/parts/maix/common/category';

const CategoryRegistry = Registry.as<IConfigCategoryRegistry>(Extensions.ConfigCategory);

CategoryRegistry.registerCategory('appearance', '界面设置');

CategoryRegistry.registerCategory('appearance.theme', '主题', 'appearance');
CategoryRegistry.addSettings('appearance.theme',
	'workbench.colorTheme',
	'workbench.editor.showIcons',
	'workbench.iconTheme',
	'editor.fontFamily',
);
CategoryRegistry.registerCategory('appearance.look', '外观', 'appearance');
CategoryRegistry.addSettings('appearance.look',
	'editor.fontSize',
	'editor.cursorBlinking',
	'editor.cursorStyle',
	'editor.cursorWidth',
);

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
