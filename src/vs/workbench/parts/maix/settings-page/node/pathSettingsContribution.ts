import { expandToRoot, getDataPath, getInstallPath, getSDKPath } from './nodePath';
import { resolve } from 'path';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ConfigurationTarget, IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { Extensions as CategoryExtensions, IConfigCategoryRegistry } from 'vs/workbench/parts/maix/settings-page/common/category';
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
	'C_Cpp.default.includePath'(def: string[]) {
		const sdk = getSDKPath(this);
		if (!sdk) {
			return undefined;
		}
		const sdkInclude = sdk + '/include';
		if (def && def.indexOf(sdkInclude) !== -1) {
			return undefined;
		}
		return def ? [...def, sdkInclude] : [sdkInclude];
	}
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
			const value = overwrite.call(this.environmentService, old.user || old.default);
			if (typeof value !== 'undefined') {
				this.configurationService.updateValue(key, value, ConfigurationTarget.USER);
			}
			/// }
		}

		if (key === 'files.exclude') {
			this.hideBuildDirectory();
		}
	}

	private hideBuildDirectory() {
		const inspect = this.configurationService.inspect<any>('files.exclude');
		let data = inspect.user ? { ...inspect.user } : { ...inspect.default };
		let changed = new Boolean(false);

		ignore(data, '.idea', changed);
		ignore(data, 'config/fpioa.cfg', changed);
		for (const part of ['CMakeCache.txt', 'CMakeFiles', 'cmake_install.cmake', 'CMakeLists.txt', 'compile_commands.json', 'Makefile']) {
			ignore(data, 'build/' + part, changed);
		}
		if (changed) {
			this.configurationService.updateValue('files.exclude', data, ConfigurationTarget.USER);
		}
	}
}

function ignore(data: any, name: string, changed: Boolean) {
	if (!data.hasOwnProperty(name)) {
		changed = true;
		data[name] = true;
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