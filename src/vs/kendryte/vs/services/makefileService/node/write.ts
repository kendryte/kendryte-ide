import { IProjectInfoResolved } from 'vs/kendryte/vs/services/makefileService/node/resolve';
import { DeepReadonly } from 'vs/kendryte/vs/base/common/type/deepReadonly';
import { ILogService } from 'vs/platform/log/common/log';
import { INodeFileSystemService } from 'vs/kendryte/vs/services/fileSystem/common/type';
import { INodePathService } from 'vs/kendryte/vs/services/path/common/type';
import { relativePath, resolvePath } from 'vs/kendryte/vs/base/common/resolvePath';
import { normalizeArray } from 'vs/kendryte/vs/base/common/normalizeArray';
import { PROJECT_CONFIG_FOLDER_NAME } from 'vs/kendryte/vs/base/common/constants/wellknownFiles';
import { CMAKE_LIST_GENERATED_WARNING, CMakeProjectTypes } from 'vs/kendryte/vs/base/common/jsonSchemas/cmakeConfigSchema';
import { DefineValue } from 'vs/kendryte/vs/services/makefileService/common/type';

const CMAKE_CWD = '${CMAKE_CURRENT_LIST_DIR}/';

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

export class MakefileServiceWritter {
	private readonly readed: KnownFiles = {} as any;
	private rootInitSection: string;
	private finishSection: string;

	constructor(
		private readonly _project: DeepReadonly<IProjectInfoResolved>,
		private readonly _isDebugMode: boolean,
		private readonly allLinkProjects: ReadonlyArray<string>,
		private readonly definitions: IterableIterator<DefineValue>,
		private readonly logger: ILogService,
		@INodeFileSystemService private readonly nodeFileSystemService: INodeFileSystemService,
		@INodePathService private readonly nodePathService: INodePathService,
	) {
		this.localResolve = this.localResolve.bind(this);
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

		this.rootInitSection = [
			this.readed.macros,
			this.readed.ideSettings,
			this.readed.toolchain,
		].join('\n');

		this.finishSection = [
			this.readed.afterProject,
			this.readed.fix9985,
		].join('\n');
	}

	public async write() {
		await this.readBlockFiles();

		this.logger.debug('=============================================');
		this.logger.debug('  Project configuration:', this._project);
		this.logger.debug('=============================================');

		const content = `
${CMAKE_LIST_GENERATED_WARNING}

# [section] Head
${this.readed.reset}
cmake_minimum_required(VERSION 3.0.0)
set(PROJECT_NAME ${JSON.stringify(this._project.json.name)})
# [/section] Head

# [section] Init
${this._project.isRoot ? this.rootInitSection : '# not need in sub project'}
${this._project.isRoot ? this.debugModeProperty() : ''}
# [/section] Init

# [section] C/C++ compiler flags
${this.flags()}
# [/section] C/C++ compiler flags

# [section] Project
${this.readed.fix9985}
message("======== PROJECT ========")
project(\${PROJECT_NAME})

## [section] Header
${this.includeDirs()}
## [/section] Header
## [section] Source
${this.sourceFiles()}
## [/section] Source

# [/section] Project

# [section] Dependency
${this.addSubProjects()}
# [/section] Dependency

# [section] Custom
${this._project.resolved.extraListContent}
# [/section] Custom

# [section] Target
${this.createTarget()}
${this.debugModeValue()}
${this.setProperties()}
${this.linkSystemBase()}
${this.linkSubProjects()}
# [/section] Target

# [section] Finish
${this.finishSection}
${this.flashable()}
# [/section] Finish

# [section] Dump Setting
${this.readed.dumpConfig}
${this._isDebugMode ? 'message("\n  ${PROJECT_NAME} :: SOURCE_FILES=${SOURCE_FILES}")' : ''}
# [/section] Dump Setting
`;

		await this.nodeFileSystemService.writeFileIfChanged(
			resolvePath(this._project.path, 'CMakeLists.txt'),
			content,
		);
	}

	debugModeProperty() {
		if (!this._isDebugMode) {
			return '# debug mode disabled';
		}
		return `# debug mode enabled
set(-DCMAKE_VERBOSE_MAKEFILE TRUE)
set_property(GLOBAL PROPERTY JOB_POOLS single_debug=1)`;
	}

	debugModeValue() {
		if (!this._isDebugMode) {
			return '# debug mode disabled';
		}
		return `# debug mode enabled
set_property(TARGET \${PROJECT_NAME} PROPERTY JOB_POOL_COMPILE single_debug)
set_property(TARGET \${PROJECT_NAME} PROPERTY JOB_POOL_LINK single_debug)`;
	}

	private flags() {
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
			const arr = normalizeArray<string>(this._project.json[from]);
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

		if (this._project.resolved.linkerScripts.length) {
			content.push(`add_compile_flags(LD`);
			for (const file of this.resolveAll(this._project.resolved.linkerScripts)) {
				content.push(`  -T ${JSON.stringify(CMAKE_CWD + file)}`);
			}
			content.push(`)`);
		}
		return content.join('\n');
	}

	private includeDirs() {
		const ideHeaders = `## from ide
include_directories("${CMAKE_CWD}${PROJECT_CONFIG_FOLDER_NAME}")
## from project
`;

		if (this._project.resolved.includeFolders.length) {
			return ideHeaders + `include_directories(
  ${this.spaceArray(this.resolveAll(this._project.resolved.includeFolders))}
)`;
		} else {
			return ideHeaders + '## no headers';
		}
	}

	private sourceFiles() {
		if (this._project.shouldHaveSourceCode) {
			const addSource = this._project.resolved.sourceFiles.map((file) => {
				return `add_source_file(${file})`;
			});
			return `## add source from config json (${this._project.resolved.sourceFiles.length} files matched)
${addSource.join('\n')}`;
		} else {
			return '### project have no source code (and should not have)';
		}
	}

	private addSubProjects() {
		if (!this._project.isRoot) {
			return '# child project do not set dependency';
		}
		return Object.entries(this._project.directDependency).map(([name, path]) => {
			const rel = relativePath(this._project.path, path);
			const dir = CMAKE_CWD + '/' + rel;
			return `add_subdirectory(${JSON.stringify(dir)} ${JSON.stringify(name)})`;
		}).join('\n');
	}

	private linkSystemBase() {
		if (this._project.shouldHaveSourceCode) {
			return 'target_link_libraries(${PROJECT_NAME} PUBLIC -Wl,--start-group gcc m c -Wl,--end-group)';
		} else {
			return '';
		}
	}

	private linkSubProjects() {
		if (!this._project.isRoot) {
			return '# not root project, no more link';
		}
		const names = this.allLinkProjects.map((name) => {
			if (name === this._project.json.name) {
				return '';
			}
			return '\t' + JSON.stringify(name);
		}).filter(e => e.length > 0);
		return `## dependencies link
target_link_libraries(\${PROJECT_NAME} PUBLIC
	-Wl,--start-group
	${names.join('\n')}
	-Wl,--end-group
)`;
	}

	private createTarget() {
		const ret: string[] = [];
		if (this._project.json.type === CMakeProjectTypes.library) {
			ret.push(`## final create ${this._project.json.name} library`);
			if (this._project.shouldHaveSourceCode) {
				ret.push('add_library(${PROJECT_NAME} SHARED STATIC ${SOURCE_FILES})');
				ret.push(`target_compile_definitions(\${PROJECT_NAME} PRIVATE "PROJECT_PATH=${CMAKE_CWD}")`);
			} else {
				ret.push('add_library(${PROJECT_NAME} SHARED STATIC IMPORTED GLOBAL)');
				ret.push('set_property(TARGET ${PROJECT_NAME} PROPERTY IMPORTED_LOCATION');
				ret.push('    ' + CMAKE_CWD + this.localResolve(this._project.json.prebuilt));
				ret.push(')');
			}
		} else {
			ret.push(`## final create ${this._project.json.name} executable`);
			ret.push('add_executable(${PROJECT_NAME} ${SOURCE_FILES})');
			ret.push(`target_compile_definitions(\${PROJECT_NAME} PRIVATE "PROJECT_PATH=${CMAKE_CWD}")`);
		}
		return ret.join('\n');
	}

	private setProperties() {
		const content = [];
		if (this._project.json.properties) {
			content.push('## set properties');
			for (const [key, value] of Object.entries(this._project.json.properties)) {
				content.push(`set_target_properties($\{PROJECT_NAME} PROPERTIES ${key} ${JSON.stringify(value)})`);
			}
		} else {
			content.push('## no properties');
		}
		content.push('## set definitions');
		for (const { id, value } of this.definitions) {
			content.push(`add_compile_definitions(${id}${value ? '=' + value : ''})`);
		}
		return content.join('\n');
	}

	private flashable() {
		if (this._project.isRoot && this._project.json.type !== CMakeProjectTypes.library) {
			return this.readed.flash;
		} else {
			return '';
		}
	}

	private resolveAll(arr: ReadonlyArray<string>) {
		return arr.map(this.localResolve);
	}

	private spaceArray(arr: ReadonlyArray<string>, sp: string = '\n  ') {
		return arr.map(e => JSON.stringify(CMAKE_CWD + e)).join(sp);
	}

	private localResolve(path: string) {
		return relativePath(this._project.path, path);
	}
}
