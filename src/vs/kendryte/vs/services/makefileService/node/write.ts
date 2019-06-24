import { ILinkArguments, IProjectInfoResolved } from 'vs/kendryte/vs/services/makefileService/node/resolve';
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
import { packageJsonArray, packageJsonObject } from 'vs/kendryte/vs/base/common/cmakeTypeHelper';

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
		private readonly linkArguments: ILinkArguments,
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
			this.readed.coreFlags,
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
set(PROJECT_NAME ${JSON.stringify(this.project.objectName)})
# [/section] Head

# [section] Init
${this.project.isRoot ? this.rootInitSection : '# not need in sub project'}
${this.debugModeProperty()}
# [/section] Init

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
# [/section] Target

# [section] Dependency
${this.addSubProjects()}
# [/section] Dependency


# [section] C/C++ compiler flags
${this.flags()}
${this.linkSubProjects()}
# [/section] C/C++ compiler flags

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
		const map = (...from: (ReadonlyArray<string> | undefined)[]) => {
			const args: string[] = [''].concat(...from.map(a => a ? a.slice() : [])).filter(e => !!e);
			const arr = normalizeArray<string>(args);
			if (arr.length === 0) {
				return '';
			}

			return arr.map(item => `  ${JSON.stringify(item)}`).join('\n');
		};
		const append = (str: string, varName: string) => {
			if (str) {
				content.push(`set(FLAGS_FOR_${varName}\n${str}\n)`);
			}
			return !!str;
		};

		const content: string[] = [];
		content.push('');
		content.push('##### flags from config json #####');
		content.push('message("config flags for ${PROJECT_NAME}")');

		const c_flags = packageJsonArray(this.project.json, 'c_flags');
		const cpp_flags = packageJsonArray(this.project.json, 'cpp_flags');
		const c_cpp_flags = packageJsonArray(this.project.json, 'c_cpp_flags');

		const editCFlags = append(map(c_flags, c_cpp_flags), 'C');
		const editCXXFlags = append(map(cpp_flags, c_cpp_flags), 'CXX');
		if (editCFlags || editCXXFlags) {
			content.push(`target_compile_options(\${PROJECT_NAME} PRIVATE`);
			if (editCFlags) {
				content.push(`\t$<$<COMPILE_LANGUAGE:C>:\${FLAGS_FOR_C}>`);
			}
			if (editCXXFlags) {
				content.push(`\t$<$<COMPILE_LANGUAGE:CXX>:\${FLAGS_FOR_CXX}>`);
			}
			content.push(')');
		}

		return content.join('\n');
	}

	private includeDirs() {
		let localHeaders = '### from project local\n';
		const header = packageJsonArray(this.project.json, 'header');
		if (header && header.length) {
			localHeaders += `include_directories(
  ${this.spaceArray(header)}
)`;
		}
		const ideHeaders = `### from ide
include_directories("${CMAKE_CWD}${PROJECT_CONFIG_FOLDER_NAME}")
`;
		let sharedHeaders = '## from project public\n';
		if (this.project.resolved.includeFolders.length) {
			sharedHeaders += `include_directories(
  ${this.spaceArray(this.resolveAll(this.project.resolved.includeFolders))}
)`;
		} else {
			sharedHeaders += '## no headers';
		}
		return localHeaders + ideHeaders + sharedHeaders;
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
		const lines = ['cmake_policy(SET CMP0079 NEW)'];
		if (this.project.isRoot) {
			lines.push('## root project will include all dependency');
			this.projectList.forEach(({ objectName, path, isSimpleFolder }) => {
				if (objectName === this.project.objectName! || isSimpleFolder) {
					return;
				}
				const rel = relativePath(this.project.path, path);
				const dir = CMAKE_CWD + '/' + rel;
				lines.push(`add_subdirectory(${JSON.stringify(dir)} ${JSON.stringify(objectName)})`);
			});
		}

		if (this.project.directDependency.length) {
			lines.push('## add simple folder dependency');
			for (const { objectName, path, isSimpleFolder } of this.project.directDependency) {
				if (!isSimpleFolder) {
					continue;
				}
				const rel = relativePath(this.project.path, path);
				const dir = CMAKE_CWD + '/' + rel;
				lines.push(`add_subdirectory(${JSON.stringify(dir)} ${JSON.stringify(objectName)})`);
			}
		}

		return lines.join('\n');
	}

	private linkSubProjects() {
		if (!this.project.isRoot) {
			return '';
		}
		const p1 = this.linkArguments.arguments.map(e => {
			if (e.startsWith('#')) {
				return e;
			} else {
				return JSON.stringify(e);
			}
		}).join('\n\t').trim();
		const p2 = this.linkArguments.objects.map(e => {
			if (e.startsWith('#')) {
				return e;
			} else {
				return JSON.stringify(e);
			}
		}).join('\n\t').trim();

		let ret = '';
		if (p1) {
			ret += `target_link_options(\${PROJECT_NAME} PUBLIC\n\t${p1}\n)\n`;
		}
		if (p2) {
			ret += `target_link_libraries(\${PROJECT_NAME} PUBLIC -Wl,--start-group\n\t${p2}\n-Wl,--end-group)\n`;
		}
		return ret;
	}

	private createTarget() {
		const ret: string[] = [];
		if (this.project.json.type === CMakeProjectTypes.library) {
			ret.push(`## final create ${this.project.objectName} library`);
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
			ret.push(`## final create ${this.project.objectName} executable`);
			ret.push('add_executable(${PROJECT_NAME} ${SOURCE_FILES})');
			ret.push(`target_compile_definitions(\${PROJECT_NAME} PRIVATE "PROJECT_PATH=${CMAKE_CWD}")`);
		}
		return ret.join('\n');
	}

	private setProperties() {
		const content = [];
		const properties = packageJsonObject<string>(this.project.json, 'properties');
		if (properties && Object.keys(properties).length) {
			content.push('## set properties');
			for (const [key, value] of Object.entries(properties)) {
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
