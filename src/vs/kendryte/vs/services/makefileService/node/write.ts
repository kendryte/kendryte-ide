import { IProjectInfoResolved } from 'vs/kendryte/vs/services/makefileService/node/resolve';
import { DeepReadonly, DeepReadonlyArray } from 'vs/kendryte/vs/base/common/type/deepReadonly';
import { ILogService } from 'vs/platform/log/common/log';
import { INodeFileSystemService } from 'vs/kendryte/vs/services/fileSystem/common/type';
import { INodePathService } from 'vs/kendryte/vs/services/path/common/type';
import { relativePath, resolvePath } from 'vs/kendryte/vs/base/common/resolvePath';
import { normalizeArray } from 'vs/kendryte/vs/base/common/normalizeArray';
import { CMAKE_CONFIG_FILE_NAME, PROJECT_CONFIG_FOLDER_NAME } from 'vs/kendryte/vs/base/common/constants/wellknownFiles';
import { CMAKE_LIST_GENERATED_WARNING, CMakeProjectTypes } from 'vs/kendryte/vs/base/common/jsonSchemas/cmakeConfigSchema';
import { DefineValue } from 'vs/kendryte/vs/services/makefileService/common/type';
import { PathAttachedError } from 'vs/kendryte/vs/platform/marker/common/errorWithPath';
import { missingJsonField } from 'vs/kendryte/vs/base/common/messages';

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
		private readonly project: DeepReadonly<IProjectInfoResolved>,
		private readonly projectList: DeepReadonlyArray<IProjectInfoResolved>,
		private readonly isDebugMode: boolean,
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
		if (this.project.isSimpleFolder) {
			return;
		}

		await this.readBlockFiles();

		this.logger.debug('=============================================');
		this.logger.debug('  Project configuration:', this.project);
		this.logger.debug('=============================================');

		const content = `
${CMAKE_LIST_GENERATED_WARNING}

# [section] Head
${this.readed.reset}
cmake_minimum_required(VERSION 3.0.0)
set(PROJECT_NAME ${JSON.stringify(this.project.json.name)})
# [/section] Head

# [section] Init
${this.project.isRoot ? this.rootInitSection : '# not need in sub project'}
${this.project.isRoot ? this.debugModeProperty() : ''}
# [/section] Init

# [section] C/C++ compiler flags
${this.flags()}
# [/section] C/C++ compiler flags

# [section] Project
${this.readed.fix9985}
message("======== PROJECT:\${PROJECT_NAME} ========")
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
${this.project.resolved.extraListContent}
# [/section] Custom

# [section] Target
${this.createTarget()}
### [section] Custom2
${this.project.resolved.extraList2Content}
### [/section] Custom2
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
${this.isDebugMode ? 'message("\n  ${PROJECT_NAME} :: SOURCE_FILES=${SOURCE_FILES}")' : ''}
# [/section] Dump Setting
`;

		await this.nodeFileSystemService.writeFileIfChanged(
			resolvePath(this.project.path, 'CMakeLists.txt'),
			content,
		);
	}

	debugModeProperty() {
		if (!this.isDebugMode) {
			return '# debug mode disabled';
		}
		return `# debug mode enabled
set(-DCMAKE_VERBOSE_MAKEFILE TRUE)
set_property(GLOBAL PROPERTY JOB_POOLS single_debug=1)`;
	}

	debugModeValue() {
		if (!this.isDebugMode || this.project.isSimpleFolder) {
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
			const arr = normalizeArray<string>(this.project.json[from]);
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

		if (this.project.resolved.linkerScripts.length) {
			content.push(`add_compile_flags(LD`);
			for (const file of this.resolveAll(this.project.resolved.linkerScripts)) {
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

		if (this.project.resolved.includeFolders.length) {
			return ideHeaders + `include_directories(
  ${this.spaceArray(this.resolveAll(this.project.resolved.includeFolders))}
)`;
		} else {
			return ideHeaders + '## no headers';
		}
	}

	private sourceFiles() {
		if (this.project.shouldHaveSourceCode) {
			const addSource = this.project.resolved.sourceFiles.map((file) => {
				return `add_source_file(${file})`;
			});
			return `## add source from config json (${this.project.resolved.sourceFiles.length} files matched)
${addSource.join('\n')}`;
		} else {
			return '### project have no source code (and should not have)';
		}
	}

	private addSubProjects() {
		if (!this.project.isRoot) {
			return '';
		}

		const lines = ['cmake_policy(SET CMP0079 NEW)'];
		this.projectList.forEach(({ json, path }) => {
			if (json.name === this.project.json.name!) {
				return;
			}
			const rel = relativePath(this.project.path, path);
			const dir = CMAKE_CWD + '/' + rel;
			lines.push(`add_subdirectory(${JSON.stringify(dir)} ${JSON.stringify(json.name)})`);
		});

		return lines.join('\n');
	}

	private linkSystemBase() {
		if (this.project.json.systemLibrary && this.project.json.systemLibrary.length) {
			return `target_link_libraries($\{PROJECT_NAME} PUBLIC -Wl,--start-group ${this.project.json.systemLibrary.join(' ')} -Wl,--end-group)`;
		} else {
			return '';
		}
	}

	private linkSubProjects() {
		if (!this.project.isRoot) {
			return '# not root project, no more link';
		}
		const names: string[] = [];
		for (const { json, isSimpleFolder } of this.projectList) {
			if (isSimpleFolder || json.name === this.project.json.name) {
				continue;
			}
			names.push(JSON.stringify(name));
		}

		return `## dependencies link
target_link_libraries(\${PROJECT_NAME} PUBLIC
	-Wl,--start-group
	${names.join('\n\t')}
	-Wl,--end-group
)`;
	}

	private createTarget() {
		const ret: string[] = [];
		if (this.project.json.type === CMakeProjectTypes.library) {
			ret.push(`## final create ${this.project.json.name} library`);
			if (this.project.isSimpleFolder) {
				ret.push('### this is a dummy target.');
			} else if (this.project.shouldHaveSourceCode) {
				ret.push('add_library(${PROJECT_NAME} SHARED STATIC ${SOURCE_FILES})');
				ret.push(`target_compile_definitions(\${PROJECT_NAME} PRIVATE "PROJECT_PATH=${CMAKE_CWD}")`);
			} else {
				ret.push('add_library(${PROJECT_NAME} SHARED STATIC IMPORTED GLOBAL)');
				ret.push('set_property(TARGET ${PROJECT_NAME} PROPERTY IMPORTED_LOCATION');
				if (!this.project.json.prebuilt) {
					throw new PathAttachedError(resolvePath(this.project.path, CMAKE_CONFIG_FILE_NAME), missingJsonField('prebuilt'));
				}
				ret.push('    ' + CMAKE_CWD + this.localResolve(this.project.json.prebuilt));
				ret.push(')');
			}
		} else {
			ret.push(`## final create ${this.project.json.name} executable`);
			ret.push('add_executable(${PROJECT_NAME} ${SOURCE_FILES})');
			ret.push(`target_compile_definitions(\${PROJECT_NAME} PRIVATE "PROJECT_PATH=${CMAKE_CWD}")`);
		}
		return ret.join('\n');
	}

	private setProperties() {
		const content = [];
		if (this.project.json.properties) {
			content.push('## set properties');
			for (const [key, value] of Object.entries(this.project.json.properties)) {
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
		if (this.project.isRoot && this.project.json.type !== CMakeProjectTypes.library) {
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
		return relativePath(this.project.path, path);
	}
}
