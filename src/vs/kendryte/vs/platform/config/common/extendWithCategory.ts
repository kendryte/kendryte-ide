import { Registry } from 'vs/platform/registry/common/platform';
import {
	Extensions as ConfigurationExtensions,
	IConfigurationNode,
	IConfigurationPropertySchema,
	IConfigurationRegistry,
	IDefaultConfigurationExtension,
} from 'vs/platform/configuration/common/configurationRegistry';
import { Extensions as CategoryExtensions, IConfigCategoryRegistry } from 'vs/kendryte/vs/platform/config/common/category';

/* extend the original schema */
export interface IExtendConfigurationPropertySchema extends IConfigurationPropertySchema {
	category?: string;
	longText?: boolean;
}

export interface IExtendConfigurationNode extends IConfigurationNode {
	properties: { [path: string]: IExtendConfigurationPropertySchema; };
	category?: string;
}

export interface ICategoryConfigurationRegistry extends IConfigurationRegistry {
	registerConfiguration(configuration: IExtendConfigurationNode): void;
	registerConfigurations(configurations: IExtendConfigurationNode[], defaultConfigurations: IDefaultConfigurationExtension[], validate?: boolean): void;
	notifyConfigurationSchemaUpdated(configuration: IExtendConfigurationNode): void;
	getConfigurations(): IExtendConfigurationNode[];
	getConfigurationProperties(): { [qualifiedKey: string]: IExtendConfigurationPropertySchema };
	getExcludedConfigurationProperties(): { [qualifiedKey: string]: IExtendConfigurationPropertySchema };
}

/* extend the original schema END */

const configRegistry = Registry.as<ICategoryConfigurationRegistry>(ConfigurationExtensions.Configuration);

if (!configRegistry) {
	// load order maybe wrong ?
	debugger;
	(require('electron') as any).remote.getCurrentWindow().reload();
}

Object.keys(configRegistry.getConfigurationProperties()).forEach((key: string) => checkAndAssignCategory(key));
configRegistry.onDidRegisterConfiguration((keys: string[]) => keys.forEach(checkAndAssignCategory));

function checkAndAssignCategory(key: string) {
	const schema = configRegistry.getConfigurationProperties()[key];
	if (schema.category) {
		const category = Registry.as<IConfigCategoryRegistry>(CategoryExtensions.ConfigCategory);
		category.addSetting(schema.category, key);
	}
}

export function registerConfiguration(configuration: IExtendConfigurationNode, validate: boolean = true): void {
	return registerConfigurations([configuration], [], validate);
}

export function registerConfigurations(configurations: IExtendConfigurationNode[], defaultConfigurations: IDefaultConfigurationExtension[], validate?: boolean): void {
	configurations.forEach((configuration) => {
		if (configuration.category && configuration.properties) {
			for (const item of Object.values(configuration.properties)) {
				if (!item.category) {
					item.category = configuration.category;
				}
			}
		}
	});
	return configRegistry.registerConfigurations(configurations, defaultConfigurations, validate);
}
