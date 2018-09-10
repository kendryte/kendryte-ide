import { IInstantiationService, ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
import { ConfigurationTarget, IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { Extensions as CategoryExtensions, IConfigCategoryRegistry, INodePathService } from 'vs/workbench/parts/maix/_library/common/type';
import { Extensions as ConfigurationExtensions, IConfigurationPropertySchema, IConfigurationRegistry } from 'vs/platform/configuration/common/configurationRegistry';
import { Extensions as WorkbenchExtensions, IWorkbenchContribution, IWorkbenchContributionsRegistry } from 'vs/workbench/common/contributions';
import { Registry } from 'vs/platform/registry/common/platform';
import { LifecyclePhase } from 'vs/platform/lifecycle/common/lifecycle';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { readdirSync } from 'vs/base/node/extfs';
import { executableExtension } from 'vs/workbench/parts/maix/_library/node/versions';
import { ILogService } from 'vs/platform/log/common/log';
import { resolvePath } from 'vs/workbench/parts/maix/_library/node/resolvePath';

interface SettingsOverwiter<T> {
	(access: ServicesAccessor, old: T): T;
}

const configOverwrites: { [id: string]: SettingsOverwiter<any> } = {
	'cmake.cmakePath'(access: ServicesAccessor) {
		const nodePathService = access.get<INodePathService>(INodePathService);
		return resolvePath(nodePathService.getPackagesPath('cmake/bin/cmake' + executableExtension));
	},
	'C_Cpp.default.compilerPath'(access: ServicesAccessor) {
		const nodePathService = access.get<INodePathService>(INodePathService);
		return resolvePath(nodePathService.getToolchainBinPath(), 'riscv64-unknown-elf-gcc' + executableExtension);
	},
	'C_Cpp.default.includePath'(access: ServicesAccessor) {
		const nodePathService = access.get<INodePathService>(INodePathService);
		const ret: string[] = [];
		const sdk = nodePathService.rawSDKPath();
		ret.push(sdk + '/include');

		const toolchain = nodePathService.rawToolchainPath();
		ret.push(resolvePath(toolchain, 'riscv64-unknown-elf/include'));

		const libgcc = resolvePath(toolchain, 'lib/gcc/riscv64-unknown-elf');
		const libgccVersion = readdirSync(libgcc)[0];
		ret.push(resolvePath(libgcc, libgccVersion, 'include'));

		const libcpp = resolvePath(toolchain, 'riscv64-unknown-elf/include/c++');
		const libcppVersion = readdirSync(libcpp)[0];
		ret.push(resolvePath(libcpp, libcppVersion));
		ret.push(resolvePath(libcpp, libcppVersion, 'riscv64-unknown-elf'));
		return ret;
	},
};

const setIfNot = new Map<string, any>();
setIfNot.set('workbench.list.openMode', 'doubleClick');
setIfNot.set('editor.cursorBlinking', 'smooth');
setIfNot.set('editor.cursorStyle', 'line-thin');
setIfNot.set('git.ignoreMissingGitWarning', true);
setIfNot.set('files.autoSave', 'afterDelay');
setIfNot.set('explorer.confirmDelete', false);
setIfNot.forEach((v, k) => {
	configOverwrites[k] = (a, user) => user === undefined ? v : undefined;
});

const forceOverride = new Map<string, any>();
forceOverride.set('cmake.generator', 'Unix Makefiles');
forceOverride.forEach((v, k) => {
	configOverwrites[k] = () => v;
});

class SettingCategoryContribution implements IWorkbenchContribution {
	private registry = Registry.as<IConfigurationRegistry>(ConfigurationExtensions.Configuration);
	private categoryRegistry = Registry.as<IConfigCategoryRegistry>(CategoryExtensions.ConfigCategory);

	constructor(
		@IInstantiationService private instantiationService: IInstantiationService,
		@IEnvironmentService private environmentService: IEnvironmentService,
		@IConfigurationService private configurationService: IConfigurationService,
		@ILogService private logService: ILogService,
	) {
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
			let value: any;
			try {
				value = this.instantiationService.invokeFunction(overwrite, old.user, old.default);
			} catch (e) {
				this.logService.error(`Failed to register config key: ${key}\n${e.stack}`);
			}
			if (value !== undefined) {
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
		let changed = { change: false };

		ignore(data, '.idea', changed);
		ignore(data, 'config/fpioa.cfg', changed);
		if (this.environmentService.isBuilt) {
			for (const part of ['CMakeFiles', 'cmake_install.cmake', 'CMakeLists.txt', 'compile_commands.json', 'Makefile', 'SDK']) {
				ignore(data, 'build/' + part, changed);
			}
		}
		if (changed.change) {
			this.configurationService.updateValue('files.exclude', data, ConfigurationTarget.USER);
		}
	}
}

function ignore(data: any, name: string, changed: { change: boolean }) {
	if (!data.hasOwnProperty(name)) {
		changed.change = true;
		data[name] = true;
	}
}

Registry.as<IWorkbenchContributionsRegistry>(WorkbenchExtensions.Workbench)
        .registerWorkbenchContribution(SettingCategoryContribution, LifecyclePhase.Running);
