import { exists, readFile } from 'vs/base/node/pfs';
import { CMAKE_CONFIG_FILE_NAME, CMAKE_LIBRARY_FOLDER_NAME, ICompileOptions } from 'vs/kendryte/vs/workbench/cmake/common/cmakeConfigSchema';
import { resolvePath } from 'vs/kendryte/vs/base/node/resolvePath';
import { ILogService } from 'vs/platform/log/common/log';
import { INodeFileSystemService } from 'vs/kendryte/vs/services/fileSystem/common/type';
import { INodePathService } from 'vs/kendryte/vs/services/path/common/type';
import { normalizeArray } from 'vs/kendryte/vs/base/common/normalizeArray';

export const CMAKE_LIST_GENERATED_WARNING = '# [NEVER REMOVE THIS LINE] WARNING: this file is generated, please edit ' + CMAKE_CONFIG_FILE_NAME + ' file instead.';

interface KnownFiles {
	fix9985: string;
	macros: string;
	prepend: string;
	dumpConfig: string;
	flash: string;
}

let readed: KnownFiles;

export class CMakeListsCreator {
	private readonly projectDependencies: { [name: string]: boolean };
	private readonly projectIncludes: string[];

	private config: ICompileOptions;
	private extraListContent: string;
	private myDependency: string[] = [];
	private isRoot: boolean;

	constructor(
		private readonly listSourceFile: string,
		private readonly logger: ILogService,
		depsRef: CMakeListsCreator,
		@INodeFileSystemService private readonly nodeFileSystemService: INodeFileSystemService,
		@INodePathService private readonly nodePathService: INodePathService,
	) {
		if (depsRef) {
			this.isRoot = false;
			this.projectDependencies = depsRef.projectDependencies;
			this.projectIncludes = depsRef.projectIncludes;
		} else {
			this.isRoot = true;
			this.projectDependencies = {};
			this.projectIncludes = [];
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

		const content = [CMAKE_LIST_GENERATED_WARNING];

		content.push(`set(PROJECT_NAME ${JSON.stringify(config.name)})`);

		if (this.isRoot) {
			content.push('##### dependencies #####');
			for (const name of Object.keys(this.projectDependencies)) {
				if (this.projectDependencies[name]) {
					content.push(`add_subdirectory("${CMAKE_LIBRARY_FOLDER_NAME}/${name}" "${name}")`);
				} else {
					content.push(`message(FATAL "Did you installed dependency '${name}'?")`);
				}
			}
		}

		content.push(readed.prepend, readed.macros);
		content.push('##### flags from config json #####');

		const add_compile_flags_map = [
			['c_flags', 'C'],
			['cpp_flags', 'CXX'],
			['c_cpp_flags', 'BOTH'],
			['link_flags', 'LD'],
		];
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

		if (this.extraListContent) {
			content.push('##### include(${path}) #####');
			content.push(this.extraListContent);
		}

		content.push(readed.fix9985);

		content.push('##### Main Section #####');
		content.push('project(${PROJECT_NAME})');

		content.push('## add source from config json');
		if (config.source && config.source.length > 0) {
			content.push(`file(GLOB_RECURSE SOURCE_FILES\n  ${this.spaceArrayCD(config.source)}\n)`);
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

		content.push('## final create executable');
		const verbose = config.type === 'library' ? 'add_library' : 'add_executable';
		content.push(verbose + '(${PROJECT_NAME} ${SOURCE_FILES})');

		content.push('target_link_libraries(${PROJECT_NAME} -Wl,--start-group');
		content.push('    m ' + this.spaceArray(this.myDependency));
		content.push('  -Wl,--end-group )');

		content.push(readed.fix9985);

		if (this.isRoot) {
			if (config.type !== 'library') {
				content.push(readed.flash);
			}
			content.push(readed.dumpConfig);
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
			read('prepend'),
			read('dumpConfig'),
			read('flash'),
		]);

		return val;
	}
}