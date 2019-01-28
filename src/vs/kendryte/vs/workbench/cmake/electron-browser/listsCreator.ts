import {
	CMAKE_CONFIG_FILE_NAME, CMAKE_LIBRARY_FOLDER_NAME, CMakeProjectTypes, ICompileInfo as ICompileInfoBase,
	ILibraryProject,
} from 'vs/kendryte/vs/base/common/jsonSchemas/cmakeConfigSchema';
import { ILogService } from 'vs/platform/log/common/log';
import { IJSONResult, INodeFileSystemService } from 'vs/kendryte/vs/services/fileSystem/common/type';
import { INodePathService } from 'vs/kendryte/vs/services/path/common/type';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { CONFIG_KEY_BUILD_VERBOSE } from 'vs/kendryte/vs/base/common/configKeys';
import { relativePath, resolvePath } from 'vs/kendryte/vs/base/node/resolvePath';
import { normalizeArray } from 'vs/kendryte/vs/base/common/normalizeArray';
import { resolve } from 'path';

export const CMAKE_LIST_GENERATED_WARNING = '# [NEVER REMOVE THIS LINE] WARNING: this file is generated, please edit ' + CMAKE_CONFIG_FILE_NAME + ' file instead.';

interface DefineValue {
	id: string;
	config: string;
	value: string;
}

interface CreatorCachedData {
	absoluteIncludes: string[];
	treeIncludes: string[];
	linkerScripts: string[];
	extraListData: string;
	definitionsWanted: DefineValue[];
}

type ICompileInfo = ICompileInfoBase & CreatorCachedData & {
	fsPath: string;
	parent: ICompileInfo;
	children: ICompileInfo[];
};

interface KnownFiles {
	reset: string;
	fix9985: string;
	macros: string;
	ideSettings: string;
	toolchain: string;
	dumpConfig: string;
	flash: string;
	afterProject: string;
	coreFlags: string;
}

function walkKeys(pp: { [id: string]: string }): string[] {
	return pp ? Object.keys(pp) : [];
}

function defaultConcat(a: any, b: any) {
	return a.push(...b);
}

const CMAKE_CWD = '${CMAKE_CURRENT_LIST_DIR}/';

export class CMakeListsCreator {
	private readonly readed: KnownFiles = {} as any;
	private readonly isDebugMode: boolean;
	private tree: ICompileInfo;
	private treeCache: { [id: string]: ICompileInfo };
	private definitionsRegistry: Map<string, DefineValue>;

	constructor(
		private readonly currentDir: string,
		private readonly logger: ILogService,
		@INodeFileSystemService private readonly nodeFileSystemService: INodeFileSystemService,
		@INodePathService private readonly nodePathService: INodePathService,
		@IConfigurationService configurationService: IConfigurationService,
	) {
		this.isDebugMode = configurationService.getValue<boolean>(CONFIG_KEY_BUILD_VERBOSE);
	}

	private async readBlockFiles() {
		const read = async (file: keyof KnownFiles) => {
			const filePath = this.nodePathService.getPackagesPath('cmake-list-files/' + file + '.cmake');
			const content = await this.nodeFileSystemService.readFileIfExists(filePath);
			this.readed[file] = `##### include(${file}) #####\n${content.trim()}\n\n`;
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
			read('coreFlags'),
		]);
	}

	public walkList() {
		return Array.from(Object.entries(this.treeCache)).filter(([k, v]) => {
			return k.length > 0;
		}).map(([k, v]) => {
			return v;
		});
	}

	private walkSubList() {
		return this.walkList().filter((item) => {
			return item !== this.tree;
		});
	}

	public async readDependenceTree(): Promise<ICompileInfoBase> {
		if (!this.tree) {
			this.treeCache = {};
			this.tree = await this.rawReadTree().catch((e) => {
				delete this.treeCache;
				throw e;
			});
			this.logger.info('Loaded projects: ' + Object.keys(this.treeCache).join(', '));
		}
		return this.tree;
	}

	protected async rawReadTree(lib = ''): Promise<ICompileInfo> {
		if (this.treeCache[lib]) {
			return this.treeCache[lib];
		}
		const file = lib
			? resolvePath(this.currentDir, CMAKE_LIBRARY_FOLDER_NAME, lib, CMAKE_CONFIG_FILE_NAME)
			: resolvePath(this.currentDir, CMAKE_CONFIG_FILE_NAME);

		this.logger.info('reading file: ' + file);
		const { json: current, warnings }: IJSONResult<ICompileInfo> = await this.nodeFileSystemService.readJsonFile<ICompileInfo>(file).catch((e) => {
			throw new Error(`parsing dependencies, please check. invalid JSON file "${file}".`);
		});
		if (warnings.length) {
			this.logger.warn(`(${warnings.length}) warning(s) during parse json`);
			warnings.forEach((e) => this.logger.warn(e.message));
		}

		if (current.dependency) {
			current.children = [];
			for (const id of walkKeys(current.dependency)) {
				if (!id) {
					throw new Error(`dependency in "${file}" not valid.`);
				}
				const child = await this.rawReadTree(id);
				child.parent = current;
				current.children.push(child);
			}
		}

		current.fsPath = resolvePath(file, '..');

		if (!lib) {
			this.treeCache[current.name] = current;
		}

		return this.treeCache[lib] = current;
	}

	private walkConcatTree<K extends keyof CreatorCachedData, T extends CreatorCachedData[K]>(
		current: ICompileInfo,
		storeKey: K | null,
		sliceMap: (item: ICompileInfo) => T,
		rootToLeaf: boolean = false,
		concat?: (a: T, b: T) => T,
		walkCache = [],
	): T {
		if (storeKey && current[storeKey]) {
			return current[storeKey] as any;
		}
		if (!concat) {
			concat = storeKey ? defaultConcat : (a) => a;
		}

		walkCache.push(current.name);
		const results: T = sliceMap(current);
		if (current.children) {
			for (const child of current.children) {
				if (walkCache.includes(child.name)) {
					continue;
				}
				walkCache.push(child.name);
				const result = this.walkConcatTree(child, storeKey, sliceMap, rootToLeaf, concat, walkCache);

				concat(results, result);
			}
		}
		if (rootToLeaf) {
			concat(results, sliceMap(current));
		}

		if (storeKey) {
			current[storeKey] = results;
		}
		return results;
	}

	private findAllLinkerScripts(parent: ICompileInfo): string[] {
		return this.walkConcatTree(parent, 'linkerScripts', (current: ICompileInfo) => {
			return current.ld_file ? [resolvePath(current.fsPath, current.ld_file)] : [];
		});
	}

	private findAllIncludes(parent: ICompileInfo) {
		this.walkConcatTree(parent, 'treeIncludes', (current: ICompileInfo) => {
			if (current.hasOwnProperty('include') && (current as ILibraryProject).include) {
				current.absoluteIncludes = (current as ILibraryProject).include.map((file) => {
					return resolvePath(current.fsPath, file);
				});
			} else {
				current.absoluteIncludes = [];
			}
			return current.absoluteIncludes.slice();
		});
	}

	private findAllConstants(parent: ICompileInfo) {
		this.definitionsRegistry = new Map();
		return this.walkConcatTree(parent, null, (current: ICompileInfo) => {
			current.definitionsWanted = [];
			if (!current.definitions) {
				return;
			}
			for (const k of Object.keys(current.definitions)) {
				const id = k.replace(/:RAW$/, '');
				if (!this.definitionsRegistry.has(id)) {
					this.definitionsRegistry.set(id, {
						id,
						config: k,
						value: null,
					});
				}
				const bundle = this.definitionsRegistry.get(id);
				if (k.endsWith(':RAW')) {
					bundle.value = '' + current.definitions[k];
				} else {
					bundle.value = JSON.stringify(current.definitions[k]);
				}
				current.definitionsWanted.push(bundle);
			}
		}, true);
	}

	public async prepareConfigure() {
		await this.readBlockFiles();
		await this.readDependenceTree();
		console.log('[cmake] Tree: ', this.tree);

		if (this.isDebugMode) {
			this.logger.info('=============================================');
			this.logger.info('  Source tree loaded\n', this.tree);
			this.logger.info('=============================================');
		}

		this.logger.info('resolving includes...');
		this.findAllIncludes(this.tree);
		this.logger.info('resolving linker scripts...');
		this.findAllLinkerScripts(this.tree);
		this.logger.info('resolving constant definitions...');
		this.findAllConstants(this.tree);

		for (const item of this.walkList()) {
			this.logger.info('resolving user custom cmake files...');
			if (item.extraList) {
				item.extraListData = await this.nodeFileSystemService.readFile(resolve(item.fsPath, item.extraList));
			} else {
				item.extraListData = '';
			}
		}

		for (const item of this.walkList()) {
			this.logger.info('generating CMakeLists.txt in %s...', item.fsPath);
			await this.generateSingle(item);
		}

		this.logger.info('Done.');
	}

	private generateSingle(current: ICompileInfo) {
		const isRoot = !current.parent;

		const content = this.prepare(current);
		if (isRoot) {
			content.push(...this.init());
		}
		content.push(...this.flags(current));
		content.push(...this.project());

		content.push(...this.includeDirs(current));
		content.push(...this.sourceFiles(current));

		if (isRoot) {
			content.push(...this.addSubProjects());
		}

		content.push(...this.extraList(current));

		content.push(...this.createTarget(current));

		if (this.isDebugMode) {
			content.push(
				'set_property(GLOBAL PROPERTY JOB_POOLS single_debug=1)',
				'set_property(TARGET ${PROJECT_NAME} PROPERTY JOB_POOL_COMPILE single_debug)',
				'set_property(TARGET ${PROJECT_NAME} PROPERTY JOB_POOL_LINK single_debug)',
			);
		}

		content.push(...this.setProperties(current));

		content.push(...this.linkSystemBase());
		if (isRoot) {
			content.push(...this.linkSubProjects());
		}

		content.push(...this.finish());

		if (isRoot) {
			content.push(...this.flashable(current));
		}

		content.push(this.readed.dumpConfig);
		if (this.isDebugMode) {
			content.push('message("")');
			content.push('message("  ${PROJECT_NAME} :: SOURCE_FILES=${SOURCE_FILES}")');
		}

		return this.nodeFileSystemService.writeFileIfChanged(
			resolvePath(current.fsPath, 'CMakeLists.txt'),
			content.join('\n').trim() + '\n',
		);
	}

	private resolveAll(relateTo: string, arr: string[]) {
		return arr.map((path) => {
			return relativePath(relateTo, path);
		});
	}

	private spaceArray(arr: string[]) {
		return arr.map(e => JSON.stringify(CMAKE_CWD + e)).join('\n  ');
	}

	private prepare(current: ICompileInfo) {
		return [
			CMAKE_LIST_GENERATED_WARNING,
			this.readed.reset,
			'cmake_minimum_required(VERSION 3.0.0)',
			`set(PROJECT_NAME ${JSON.stringify(current.name)})`,
		];
	}

	private init() {
		return [
			this.readed.macros,
			this.readed.ideSettings,
			this.readed.toolchain,
		];
	}

	private flags(current: ICompileInfo) {
		const content: string[] = [];
		const add_compile_flags_map = [
			['c_flags', 'C'],
			['cpp_flags', 'CXX'],
			['c_cpp_flags', 'BOTH'],
			['link_flags', 'LD'],
		];
		content.push('');
		content.push('##### flags from config json #####');
		for (const [from, to] of add_compile_flags_map) {
			const arr = normalizeArray<string>(current[from]);
			if (arr.length === 0) {
				continue;
			}

			content.push(`add_compile_flags(${to}`);
			for (const item of arr) {
				content.push(`  ${JSON.stringify(item)}`);
			}
			content.push(`)`);
		}
		content.push('##### internal flags #####');
		content.push(this.readed.coreFlags);

		if (current.linkerScripts.length) {
			content.push(`add_compile_flags(LD`);
			for (const file of this.resolveAll(current.fsPath, current.linkerScripts)) {
				content.push(`  -T ${JSON.stringify(CMAKE_CWD + file)}`);
			}
			content.push(`)`);
		}
		return content;
	}

	private project() {
		const ret = [
			this.readed.fix9985,
			'##### Main Section #####',
			'message("======== PROJECT ========")',
			'project(${PROJECT_NAME})',
		];
		if (this.isDebugMode) {
			ret.push('set(CMAKE_VERBOSE_MAKEFILE TRUE)');
		}
		return ret;
	}

	private includeDirs(current: ICompileInfo) {
		const ret: string[] = [];
		if (current.treeIncludes.length > 0) {
			ret.push(
				'## add include from self and dependency',
				`include_directories(\n  ${this.spaceArray(this.resolveAll(current.fsPath, current.treeIncludes))}\n)`,
			);
		} else {
			ret.push('## there is no dependency include dirs');
		}

		if (current.header) {
			ret.push(
				'## add headers from self',
				`include_directories(\n  ${this.spaceArray(this.resolveAll(current.fsPath, current.header))}\n)`,
			);
		} else {
			ret.push('## there is no headers');
		}
		return ret;
	}

	private sourceFiles(current: ICompileInfo) {
		const internalSource = [
			'config/fpioa-config.c',
			'config/fpioa-config.h',
		];
		const content = [
			'## add source from config json',
			`add_source_files(\n  ${this.spaceArray(internalSource)}\n)`,
		];
		if (current.source && current.source.length > 0) {
			content.push(`add_source_files(\n  ${this.spaceArray(current.source)}\n)`);
		}
		return content;
	}

	private addSubProjects() {
		return this.walkSubList().map(({ name }) => {
			const dir = CMAKE_CWD + CMAKE_LIBRARY_FOLDER_NAME + '/' + name;
			return `add_subdirectory(${JSON.stringify(dir)} ${JSON.stringify(name)})`;
		});
	}

	private linkSystemBase() {
		return ['target_link_libraries(${PROJECT_NAME} -Wl,--start-group gcc m c -Wl,--end-group)'];
	}

	private linkSubProjects() {
		const names = this.walkSubList().map((item) => {
			return '    ' + JSON.stringify(item.name);
		});
		return [
			'## dependencies link',
			'target_link_libraries(${PROJECT_NAME}',
			'  -Wl,--start-group',
			...names,
			'  -Wl,--end-group',
			')',
		];
	}

	private extraList(current: ICompileInfo) {
		if (current.extraList) {
			return [
				`##### include(${current.extraList}) #####`,
				current.extraListData,
				`##### include(${current.extraList}) END #####`,
			];
		} else {
			return [
				`## No extra list`,
			];
		}
	}

	private createTarget(current: ICompileInfo) {
		const verb = current.type === CMakeProjectTypes.library ? 'add_library' : 'add_executable';
		return [
			'## final create executable or library',
			verb + '(${PROJECT_NAME} ${SOURCE_FILES})',
		];
	}

	private setProperties(current: ICompileInfo) {
		const content = [];
		if (current.properties) {
			content.push('## set properties');
			for (const [key, value] of Object.entries(current.properties)) {
				content.push(`set_target_properties($\{PROJECT_NAME} PROPERTIES ${key} ${JSON.stringify(value)})`);
			}
		} else {
			content.push('## no properties');
		}
		if (current.definitionsWanted.length) {
			content.push('## set definitions');
			for (const { id, value } of current.definitionsWanted) {
				content.push(`add_compile_definitions(${id}${value ? '=' + value : ''})`);
			}
		} else {
			content.push('## no definitions');
		}
		return content;
	}

	private finish() {
		return [
			this.readed.afterProject,
			this.readed.fix9985,
		];
	}

	private flashable(current: ICompileInfo) {
		if (current.type !== CMakeProjectTypes.library) {
			return [this.readed.flash];
		} else {
			return [];
		}
	}
}
