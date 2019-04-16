import {
	CMAKE_CONFIG_FILE_NAME,
	CMAKE_LIBRARY_FOLDER_NAME,
	CMakeProjectTypes,
	ICompileInfo as ICompileInfoBase,
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
import { async as fastGlobAsync, EntryItem } from 'fast-glob';
import { ExtendMap } from 'vs/kendryte/vs/base/common/extendMap';
import { localize } from 'vs/nls';
import { ignorePattern } from 'vs/kendryte/vs/platform/fileDialog/common/globalIgnore';

export const CMAKE_LIST_GENERATED_WARNING = '# [NEVER REMOVE THIS LINE] WARNING: this file is generated, please edit ' + CMAKE_CONFIG_FILE_NAME + ' file instead.';
const iternalSourceCodeFiles: string[] = [
	'config/fpioa-config.c',
	'config/fpioa-config.h',
];

interface DefineValue {
	id: string;
	config: string;
	value: string;
}

interface CreatorCachedData {
	absoluteIncludes: string[];
	treeIncludes: string[];
	linkerScripts: string[];
	absolutePrebuilt: string;
	hasSourceCode: boolean;
	extraListData: string;
	definitionsWanted: DefineValue[];
	matchingSourceFiles: string[];
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
	private definitionsRegistry: ExtendMap<string, DefineValue>;

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

	public walkList(): ICompileInfo[] {
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
			this.logger.error(e);
			throw new Error(localize('cmake.dependency', 'Failed to parse dependency, did you installed them?'));
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

	private walkChildren(current: ICompileInfo, cb: (children: ICompileInfo) => void) {
		if (current.children) {
			for (const child of current.children) {
				cb(child);
			}
		}
	}

	private walkConcatTree<K extends keyof CreatorCachedData, T extends CreatorCachedData[K] | void>(
		current: ICompileInfo,
		storeKey: K | null,
		sliceMap: (item: ICompileInfo) => T,
		rootToLeaf: boolean = false,
		concat: (a: T, b: T) => T = storeKey ? defaultConcat : (a) => a,
		walkCache: string[] = [],
	): T {
		if (storeKey && current[storeKey]) {
			return current[storeKey] as any;
		}

		walkCache.push(current.name);
		const results: T = sliceMap(current);
		this.walkChildren(current, (child) => {
			if (walkCache.includes(child.name)) {
				return;
			}
			walkCache.push(child.name);
			const result = this.walkConcatTree(child, storeKey, sliceMap, rootToLeaf, concat, walkCache);

			concat(results, result);
		});
		if (rootToLeaf) {
			concat(results, sliceMap(current));
		}

		if (storeKey) {
			current[storeKey] = results as any;
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
			const currentLib = (current as ILibraryProject);
			current.absoluteIncludes = [];
			if (currentLib.include) {
				for (const file of currentLib.include) {
					current.absoluteIncludes.push(resolvePath(current.fsPath, file));
				}
			}
			const exposed = current.absoluteIncludes.slice();
			if (currentLib.header) {
				for (const file of currentLib.header) {
					current.absoluteIncludes.push(resolvePath(current.fsPath, file));
				}
			}
			return exposed;
		});
	}

	private findAllConstants(parent: ICompileInfo) {
		this.definitionsRegistry = new ExtendMap();
		return this.walkConcatTree(parent, null, (current: ICompileInfo) => {
			current.definitionsWanted = [];
			if (!current.definitions) {
				return;
			}
			for (const k of Object.keys(current.definitions)) {
				const id = k.replace(/:RAW$/, '');
				const bundle = this.definitionsRegistry.entry(id, () => {
					return {
						id,
						config: k,
						value: '',
					};
				});
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
		// console.log('[cmake] Tree: ', this.tree);

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

		this.logger.info('resolving prebuilts...');
		for (const item of this.walkList()) {
			if (item.hasOwnProperty('prebuilt')) {
				item.absolutePrebuilt = resolvePath(item.fsPath, (item as ILibraryProject).prebuilt);
			} else {
				delete item.absolutePrebuilt;
			}
		}

		for (const item of this.walkList()) {
			this.logger.info('resolving user custom cmake files...');
			if (item.extraList) {
				item.extraListData = await this.nodeFileSystemService.readFile(resolve(item.fsPath, item.extraList));
			} else {
				item.extraListData = '';
			}
		}

		for (const item of this.walkList()) {
			item.hasSourceCode = item.source && item.source.length > 0;
			if (item.type === CMakeProjectTypes.library) {
				if (!item.hasSourceCode && !item.prebuilt) {
					this.logger.error('Library project has no source file or prebuilt file.');
					throw new Error(`Cannot build library: ${item.name} - no source file.`);
				}
				if (item.hasSourceCode && item.prebuilt) {
					this.logger.error('Library project has both source file or prebuilt file.');
					throw new Error(`Cannot build library: ${item.name} - source file confusing.`);
				}
			} else if (!item.hasSourceCode) {
				this.logger.error('Executable project has no source file.');
				throw new Error(`Cannot build executable: ${item.name} - no source file.`);
			}

			if (item.hasSourceCode) {
				await this.matchSourceCode(item);
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

		content.push(...this.linkSystemBase(current));
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

	private spaceArray(arr: string[], sp: string = '\n  ') {
		return arr.map(e => JSON.stringify(CMAKE_CWD + e)).join(sp);
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
		if (current.header) {
			ret.push(
				'## add headers from self',
				`include_directories(\n  ${this.spaceArray(this.resolveAll(current.fsPath, current.absoluteIncludes))}\n)`,
			);
		} else {
			ret.push('## there is no headers from self');
		}
		if (current.treeIncludes.length > 0) {
			ret.push(
				'## add include from self and dependency',
				`include_directories(\n  ${this.spaceArray(this.resolveAll(current.fsPath, current.treeIncludes))}\n)`,
			);
		} else {
			ret.push('## there is no dependency include dirs');
		}

		return ret;
	}

	private sourceFiles(current: ICompileInfo) {
		if (current.hasSourceCode) {
			return [
				`## add source from config json (${current.matchingSourceFiles.length} files matched)`,
				...current.matchingSourceFiles.map((file) => {
					return `add_source_file(${file})`;
				}),
			];
		} else {
			return ['### project have no source code (and should not have)'];
		}
	}

	private addSubProjects() {
		return this.walkSubList().map(({ name }) => {
			const dir = CMAKE_CWD + CMAKE_LIBRARY_FOLDER_NAME + '/' + name;
			return `add_subdirectory(${JSON.stringify(dir)} ${JSON.stringify(name)})`;
		});
	}

	private linkSystemBase(current: ICompileInfo) {
		if (current.hasSourceCode) {
			return ['target_link_libraries(${PROJECT_NAME} PUBLIC -Wl,--start-group gcc m c -Wl,--end-group)'];
		} else {
			return [];
		}
	}

	private linkSubProjects() {
		const names = this.walkSubList().map((item) => {
			return '    ' + JSON.stringify(item.name);
		});
		return [
			'## dependencies link',
			'target_link_libraries(${PROJECT_NAME} PUBLIC',
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
		const ret: string[] = [];
		if (current.type === CMakeProjectTypes.library) {
			ret.push(`## final create ${current.name} library`);
			if (current.hasSourceCode) {
				ret.push('add_library(${PROJECT_NAME} SHARED STATIC ${SOURCE_FILES})');
			} else {
				ret.push('add_library(${PROJECT_NAME} SHARED STATIC IMPORTED GLOBAL)');
				ret.push('set_property(TARGET ${PROJECT_NAME} PROPERTY IMPORTED_LOCATION');
				ret.push('    ' + CMAKE_CWD + relativePath(current.fsPath, current.absolutePrebuilt));
				ret.push(')');
			}
		} else {
			ret.push(`## final create ${current.name} executable`);
			ret.push('add_executable(${PROJECT_NAME} ${SOURCE_FILES})');
		}
		return ret;
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

	private async matchSourceCode(item: ICompileInfo) {
		const sourceToMatch = iternalSourceCodeFiles.concat(item.source)
			.map((fp) => {
				// remove absolute and empty entries
				return fp.replace(/^\.*[\/\\]*/, '').trim();
			}).filter(e => e.length > 0);

		this.logger.info(`Source to match ${sourceToMatch.length}:`);
		sourceToMatch.forEach((line) => {
			this.logger.info(` + ${line}`);
		});
		ignorePattern.forEach((line) => {
			this.logger.info(` - ${line}`);
		});
		this.logger.info(`from directory: ${item.fsPath}`);
		const allSourceFiles: EntryItem[] = await fastGlobAsync(sourceToMatch, {
			cwd: item.fsPath,
			ignore: ignorePattern,
		}).catch((e) => {
			this.logger.error('Failed to search files:');
			this.logger.error(e.message);
			return [];
		});
		this.logger.debug('file array: ', allSourceFiles);
		this.logger.info(`Matched source file count: ${allSourceFiles.length}.`);

		if (allSourceFiles.length === 0) {
			throw new Error('No source file matched for compile.');
		}

		item.matchingSourceFiles = allSourceFiles.map((item) => {
			return item.toString();
		});
		// console.log(item.matchingSourceFiles);
	}
}
