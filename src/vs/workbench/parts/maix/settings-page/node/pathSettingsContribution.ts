import { expandToRoot, getDataPath, getInstallPath } from './nodePath';
import { resolve } from 'path';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ConfigurationTarget, IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { Extensions as CategoryExtensions, IConfigCategoryRegistry } from 'vs/workbench/parts/maix/common/category';
import { Extensions as ConfigurationExtensions, IConfigurationPropertySchema, IConfigurationRegistry } from 'vs/platform/configuration/common/configurationRegistry';
import { Extensions as WorkbenchExtensions, IWorkbenchContribution, IWorkbenchContributionsRegistry } from 'vs/workbench/common/contributions';
import { Registry } from 'vs/platform/registry/common/platform';
import { LifecyclePhase } from 'vs/platform/lifecycle/common/lifecycle';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';

interface SettingsOverwiter<T> {
	(this: IEnvironmentService, old: T): T;
}

const configOverwrites: { [id: string]: SettingsOverwiter<any> } = {
	'cmake-tools-helper.cmake_download_path'() {
		return resolve(getDataPath(this), 'cmakeDownload');
	},
};

class SettingCategoryContribution implements IWorkbenchContribution {
	private registry = Registry.as<IConfigurationRegistry>(ConfigurationExtensions.Configuration);
	private categoryRegistry = Registry.as<IConfigCategoryRegistry>(CategoryExtensions.ConfigCategory);

	constructor(
		@IInstantiationService instantiationService: IInstantiationService,
		@IEnvironmentService private environmentService: IEnvironmentService,
		@IConfigurationService private configurationService: IConfigurationService,
	) {
		registerSystemSearchPath(this.environmentService);

		Object.keys(this.registry.getConfigurationProperties()).forEach((key: string) => this.checkCategory(key));
		this.registry.onDidRegisterConfiguration((keys: string[]) => keys.forEach(this.checkCategory, this));
	}

	private checkCategory(key: string) {
		const schema: IConfigurationPropertySchema = this.registry.getConfigurationProperties()[key];
		if (schema.hasOwnProperty('category')) {
			this.categoryRegistry.addSetting((schema as any).category, key);
		}
		const overwrite = configOverwrites[key];
		if (overwrite) {
			const old = this.configurationService.inspect(key);
			/// if (!old.user) {
			const value = overwrite.call(this.environmentService, old.default);
			this.configurationService.updateValue(key, value, ConfigurationTarget.USER);
			/// }
		}
	}
}

Registry.as<IWorkbenchContributionsRegistry>(WorkbenchExtensions.Workbench)
	.registerWorkbenchContribution(SettingCategoryContribution, LifecyclePhase.Running);

function registerSystemSearchPath(environmentService: IEnvironmentService) {
	// Not only MinGW, but all platform.
	const r = [];
	if (typeof process.env.MAIX_TOOLCHAIN_ROOT === 'string') {
		r.push(process.env.MAIX_TOOLCHAIN_ROOT);
	}
	if (process.env['VSCODE_DEV']) {
		r.push(...expandToRoot(getInstallPath(environmentService), 'maix-toolchain/dist'));
	}
	r.push(...expandToRoot(getInstallPath(environmentService), 'toolchain'));

	Registry.as<IConfigurationRegistry>(ConfigurationExtensions.Configuration)
		.registerConfiguration({
			id: 'maix',
			properties: {
				'cmake.systemSearchDirs': {
					type: 'array',
					default: r,
					overridable: false,
				},
			}
		} as any);
}