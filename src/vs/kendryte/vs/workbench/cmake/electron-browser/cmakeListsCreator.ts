import { exists, readFile } from 'vs/base/node/pfs';
import { CMAKE_CONFIG_FILE_NAME, CMAKE_LIBRARY_FOLDER_NAME, ICompileOptions } from 'vs/kendryte/vs/workbench/cmake/common/cmakeConfigSchema';
import { resolvePath } from 'vs/kendryte/vs/base/node/resolvePath';
import { ILogService } from 'vs/platform/log/common/log';
import { INodeFileSystemService } from 'vs/kendryte/vs/services/fileSystem/common/type';
import { INodePathService } from 'vs/kendryte/vs/services/path/common/type';
import { normalizeArray } from 'vs/kendryte/vs/base/common/normalizeArray';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { CONFIG_KEY_BUILD_VERBOSE } from 'vs/kendryte/vs/base/common/configKeys';

export const CMAKE_LIST_GENERATED_WARNING = '# [NEVER REMOVE THIS LINE] WARNING: this file is generated, please edit ' + CMAKE_CONFIG_FILE_NAME + ' file instead.';

interface KnownFiles {
	reset: string;
	fix9985: string;
	macros: string;
	ideSettings: string;
	toolchain: string;
	dumpConfig: string;
	flash: string;
	afterProject: string;
}

let readed: KnownFiles;

export class CMakeListsCreator {
	private readonly projectDependencies: { [name: string]: boolean };
	private readonly projectLinkerScripts: string[];
	private readonly projectIncludes: string[];

	private config: ICompileOptions;
	private extraListContent: string;
	private myDependency: string[] = [];
	private readonly isRoot: boolean;
	private readonly isDebugMode: boolean;

	constructor(
		private readonly listSourceFile: string,
		private readonly logger: ILogService,
		depsRef: CMakeListsCreator,
		@INodeFileSystemService private readonly nodeFileSystemService: INodeFileSystemService,
		@INodePathService private readonly nodePathService: INodePathService,
		@IConfigurationService configurationService: IConfigurationService,
	) {
		this.isDebugMode = configurationService.getValue<boolean>(CONFIG_KEY_BUILD_VERBOSE);
		if (depsRef) {
			this.isRoot = false;
			this.projectDependencies = depsRef.projectDependencies;
			this.projectIncludes = depsRef.projectIncludes;
			this.projectLinkerScripts = depsRef.projectLinkerScripts;
		} else {
			this.isRoot = true;
			this.projectDependencies = {};
			this.projectIncludes = [];
			this.projectLinkerScripts = [];
		}
	}

	get dependencies() {
		return this.myDependency;
	}

	private spaceArray(arr: string[]) {
		return arr.map(e => JSON.stringify(e)).join('\n  ');
	}

	private spaceArrayCD(source: string[]) {
		return this.spaceArray(source.map(e => '${CMAKE_CURRENT_LIST_DIR}/' + e));
	}

	public getString() {
		const { config } = this;

		const content = [CMAKE_LIST_GENERATED_WARNING, readed.reset];
		content.push(`set(PROJECT_NAME ${JSON.stringify(config.name)})`);
		if (this.isRoot) {
			content.push(
				'cmake_minimum_required(VERSION 3.0.0)',
				readed.macros,
				readed.ideSettings,
				readed.toolchain,
			);
		}

		const add_compile_flags_map = [
			['c_flags', 'C'],
			['cpp_flags', 'CXX'],
			['c_cpp_flags', 'BOTH'],
			['link_flags', 'LD'],
		];
		content.push('');
		content.push('##### internal flags #####');
		content.push(`add_compile_flags(LD -nostartfiles -Wl,--gc-sections)`);
		if (this.projectLinkerScripts.length) {
			content.push(`add_compile_flags(LD`);
			for (const file of this.projectLinkerScripts) {
				content.push(`  -T ${JSON.stringify(file)}`);
			}
			content.push(`)`);
		}
		content.push('##### flags from config json #####');
		for (const [from, to] of add_compile_flags_map) {
			const arr = normalizeArray<string>(config[from]);
			if (arr.length === 0) {
				continue;
			}

			content.push(`add_compile_flags(${to}`);
			for (const item of arr) {
				content.push(`  ${JSON.stringify(item)}`);
			}
			content.push(`)`);
		}

		if (this.isRoot) {
			content.push(readed.fix9985);

			content.push('##### Main Section #####');
			content.push('message("======== PROJECT ========")');
			content.push('project(${PROJECT_NAME})');
			if (this.isDebugMode) {
				content.push('set(CMAKE_VERBOSE_MAKEFILE TRUE)');
			}

			content.push('##### dependencies #####');
			for (const name of Object.keys(this.projectDependencies)) {
				if (this.projectDependencies[name]) {
					content.push(`add_subdirectory("${CMAKE_LIBRARY_FOLDER_NAME}/${name}" "${name}")`);
				} else {
					content.push(`message(FATAL "Did you installed dependency '${name}'?")`);
				}
			}
		}

		content.push('## add source from config json');
		if (config.source && config.source.length > 0) {
			content.push(`add_source_files(\n  ${this.spaceArrayCD(config.source)}\n)`);
		}

		if (this.isRoot) {
			content.push('## add include from self and dependency');
			if (this.projectIncludes.length > 0) {
				content.push(`include_directories(\n  ${this.spaceArrayCD(this.projectIncludes)}\n)`);
			}
		} else {
			content.push('## add include from self');
			if (this.config.include && this.config.include.length > 0) {
				content.push(`include_directories(\n  ${this.spaceArrayCD(this.config.include)}\n)`);
			}
		}

		if (this.extraListContent) {
			content.push('##### include(${path}) #####');
			content.push(this.extraListContent);
		}

		content.push('## final create executable');
		const verbose = config.type === 'library' ? 'add_library' : 'add_executable';
		content.push(verbose + '(${PROJECT_NAME} ${SOURCE_FILES})');

		if (this.isDebugMode) {
			content.push(
				'set_property(GLOBAL PROPERTY JOB_POOLS single_debug=1)',
				'set_property(TARGET ${PROJECT_NAME} PROPERTY JOB_POOL_COMPILE single_debug)',
				'set_property(TARGET ${PROJECT_NAME} PROPERTY JOB_POOL_LINK single_debug)',
			);
		}

		if (config.properties) {
			content.push('## set properties');
			for (const [key, value] of Object.entries(config.properties)) {
				content.push(`set_target_properties($\{PROJECT_NAME} PROPERTIES ${key.toUpperCase()} ${JSON.stringify(value)})`);
			}
		}

		content.push('## dependencies link');
		content.push('target_link_libraries(${PROJECT_NAME} -Wl,--start-group gcc m c -Wl,--end-group)');
		if (this.myDependency.length) {
			content.push('target_link_libraries(${PROJECT_NAME}');
			content.push('  -Wl,--start-group');
			this.myDependency.forEach((item: string) => {
				content.push('    ' + JSON.stringify(item));
			});
			content.push('  -Wl,--end-group');
			content.push(')');
		}

		content.push(readed.afterProject);
		content.push(readed.fix9985);

		if (this.isRoot) {
			if (config.type !== 'library') {
				content.push(readed.flash);
			}
			content.push(readed.dumpConfig);
		}

		if (this.isDebugMode) {
			content.push('message("")');
			content.push('message("  ${PROJECT_NAME} :: SOURCE_FILES=${SOURCE_FILES}")');
		}

		return content.join('\n').trim() + '\n';
	}

	public async create(): Promise<void> {
		if (!readed) {
			this.logger.info('Load system cmake lists');
			readed = await this.readCMakeListPackage(this.nodePathService);
		}

		this.logger.info(`Create list from ${this.listSourceFile}`);

		const [config, errors] = await this.nodeFileSystemService.readJsonFile<ICompileOptions>(this.listSourceFile);
		if (errors.length) {
			throw errors;
		}

		if (!config.version) {
			config.version = '0.0.0';
		}

		if (config.dependency) {
			for (const dirName of Object.keys(config.dependency)) {
				if (!this.projectDependencies[dirName]) {
					const subDir = resolvePath(this.listSourceFile, '..', CMAKE_LIBRARY_FOLDER_NAME, dirName, CMAKE_CONFIG_FILE_NAME);
					this.projectDependencies[dirName] = await exists(subDir);
				}
				this.myDependency.push(dirName);
			}
		}
		if (config.ld_file) {
			this.projectLinkerScripts.push(resolvePath(this.listSourceFile, '..', config.ld_file));
		}

		if (config.extraList) {
			const path = resolvePath(this.listSourceFile, '..', config.extraList);
			this.extraListContent = await readFile(path, 'utf8');
		}

		if (config.include && config.include.length > 0) {
			if (this.isRoot) {
				this.projectIncludes.push(...config.include);
			} else {
				this.projectIncludes.push(...config.include.map((v) => {
					return `${CMAKE_LIBRARY_FOLDER_NAME}/${config.name}/${v}`;
				}));
			}
		}

		this.config = config;
		this.logger.info(`CMake config created.`);
	}

	private async readCMakeListPackage(pathService: INodePathService): Promise<KnownFiles> {
		const val: KnownFiles = {} as any;

		const read = async (file: keyof KnownFiles) => {
			const filePath = pathService.getPackagesPath('cmake-list-files/' + file + '.cmake');
			const content = await readFile(filePath, 'utf8');
			val[file] = `##### include(${file}) #####\n${content.trim()}\n\n`;
		};

		await Promise.all([
			read('fix9985'),
			read('macros'),
			read('ideSettings'),
			read('dumpConfig'),
			read('flash'),
			read('reset'),
			read('afterProject'),
			read('toolchain'),
		]);

		return val;
	}
}