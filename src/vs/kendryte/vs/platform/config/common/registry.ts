import { Registry } from 'vs/platform/registry/common/platform';
import {
	Extensions as ConfigurationExtensions,
	IConfigurationNode,
	IConfigurationPropertySchema,
	IConfigurationRegistry,
} from 'vs/platform/configuration/common/configurationRegistry';
import { Extensions as CategoryExtensions, IConfigCategoryRegistry } from 'vs/kendryte/vs/platform/config/common/category';
import { Extensions as WorkbenchExtensions, IWorkbenchContribution, IWorkbenchContributionsRegistry } from 'vs/workbench/common/contributions';
import { ILifecycleService, LifecyclePhase } from 'vs/platform/lifecycle/common/lifecycle';
import { ExtendMap } from 'vs/kendryte/vs/base/common/extendMap';

/* extend the original schema */
export interface IExtendConfigurationPropertySchema extends IConfigurationPropertySchema {
	category?: string;
	longText?: boolean;
}

export interface IExtendConfigurationNode extends IConfigurationNode {
	id: string;
	properties: { [path: string]: IExtendConfigurationPropertySchema; };
	category?: string;
}

export interface ICategoryConfigurationRegistry extends IConfigurationRegistry {
	registerConfiguration(configuration: IExtendConfigurationNode): void;
	registerConfigurations(configurations: IExtendConfigurationNode[], validate?: boolean): void;
	notifyConfigurationSchemaUpdated(configuration: IExtendConfigurationNode): void;
	getConfigurations(): IExtendConfigurationNode[];
	getConfigurationProperties(): { [qualifiedKey: string]: IExtendConfigurationPropertySchema };
	getExcludedConfigurationProperties(): { [qualifiedKey: string]: IExtendConfigurationPropertySchema };
}

/* extend the original schema END */
const configurations = new ExtendMap<string, IExtendConfigurationNode>();

export function registerConfiguration(configuration: IExtendConfigurationNode): void {
	if (configuration.category && configuration.properties) {
		for (const item of Object.values(configuration.properties)) {
			if (!item.category) {
				item.category = configuration.category;
			}
		}
	}

	const target = configurations.entry(configuration.id, () => {
		return {
			...configuration,
			properties: {},
		};
	});

	Object.assign(target.properties, configuration.properties);
}

export function registerConfigurations(configurations: IExtendConfigurationNode[]): void {
	configurations.forEach(registerConfiguration);
}

class RegisterConfigSections implements IWorkbenchContribution {
	private readonly configRegistry = Registry.as<ICategoryConfigurationRegistry>(ConfigurationExtensions.Configuration);

	constructor(
		@ILifecycleService lifecycleService: ILifecycleService,
	) {
		this.checkAndAssignCategory = this.checkAndAssignCategory.bind(this);

		lifecycleService.when(LifecyclePhase.Ready).then(() => {
			Object.keys(this.configRegistry.getConfigurationProperties()).forEach(this.checkAndAssignCategory);
			this.configRegistry.onDidUpdateConfiguration((keys: string[]) => keys.forEach(this.checkAndAssignCategory));

			this.registerAll();
		});
	}

	private checkAndAssignCategory(key: string) {
		const schema = this.configRegistry.getConfigurationProperties()[key];
		if (schema.category) {
			const category = Registry.as<IConfigCategoryRegistry>(CategoryExtensions.ConfigCategory);
			category.addSetting(schema.category, key);
		}
	}

	private registerAll() {
		this.configRegistry.registerConfigurations(Array.from(configurations.values()), true);
	}
}

Registry.as<IWorkbenchContributionsRegistry>(WorkbenchExtensions.Workbench).registerWorkbenchContribution(RegisterConfigSections, LifecyclePhase.Starting);
