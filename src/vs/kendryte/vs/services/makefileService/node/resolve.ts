import { DefineValue, IProjectInfo } from 'vs/kendryte/vs/services/makefileService/common/type';
import { missingJsonField, missingOrInvalidProject } from 'vs/kendryte/vs/base/common/messages';
import { CMakeProjectTypes, ILibraryProject } from 'vs/kendryte/vs/base/common/jsonSchemas/cmakeConfigSchema';
import { resolvePath } from 'vs/kendryte/vs/base/common/resolvePath';
import { CMAKE_LIBRARY_FOLDER_NAME } from 'vs/kendryte/vs/base/common/constants/wellknownFiles';
import { ExtendMap } from 'vs/kendryte/vs/base/common/extendMap';
import { ignorePattern } from 'vs/kendryte/vs/platform/fileDialog/common/globalIgnore';
import { async as fastGlobAsync, EntryItem } from 'fast-glob';
import { localize } from 'vs/nls';
import { ILogService } from 'vs/platform/log/common/log';
import { IKendryteWorkspaceService } from 'vs/kendryte/vs/services/workspace/common/type';
import { INodeFileSystemService } from 'vs/kendryte/vs/services/fileSystem/common/type';
import { isSameDrive } from 'vs/kendryte/vs/base/common/fs/isSameDrive';
import { PathAttachedError } from 'vs/kendryte/vs/platform/marker/common/errorWithPath';
import { exists } from 'vs/base/node/pfs';
import { basename } from 'vs/base/common/path';
import { DeepReadonlyArray } from 'vs/kendryte/vs/base/common/type/deepReadonly';
import { arrayRemoveDuplicate } from 'vs/kendryte/vs/base/common/arrayUnique';

const DefineType = /:(raw|str)$/i;

interface IResolvedData {
	includeFolders: string[];
	linkerScripts: string[];
	extraListContent: string;
	extraList2Content: string;
	sourceFiles: string[];
	linkLibs: string[];
}

export interface IProjectInfoResolved extends IProjectInfo {
	resolved: IResolvedData;
}

export class MakefileServiceResolve {
	private readonly projectList: IProjectInfo[] = [];
	private readonly finalProjectList: IProjectInfoResolved[] = [];
	private readonly definitionsRegistry = new ExtendMap<string, DefineValue>();

	constructor(
		private readonly pathToGenerate: string,
		private readonly _projectNameMap: Map<string/* projectName */, string/* project absolute path */>,
		private readonly logger: ILogService,
		@IKendryteWorkspaceService private readonly kendryteWorkspaceService: IKendryteWorkspaceService,
		@INodeFileSystemService private readonly nodeFileSystemService: INodeFileSystemService,
	) {
	}

	public async readProjectJsonList() {
		await this._readProjectJsonList(this.pathToGenerate);
		this.detectDependencyLoop();
		return this.projectList;
	}

	private async _loadSimpleFolderDependency(name: string, folderPath: string): Promise<IProjectInfo> {
		this.logger.info('Adding simple folder: ' + folderPath);
		const loaded = this.projectList.find((project) => project.path === folderPath);
		if (loaded) {
			return loaded;
		}

		const json: Partial<ILibraryProject> = {
			name,
			type: CMakeProjectTypes.library,
		};
		const project: IProjectInfo = {
			json,
			path: folderPath,
			isWorkspaceProject: false,
			isRoot: false,
			shouldHaveSourceCode: true,
			isSimpleFolder: true,
			directDependency: [],
		};

		this.projectList.push(project);

		return project;
	}

	private async _readProjectJsonList(projectPath: string): Promise<IProjectInfo> {
		const loaded = this.projectList.find((project) => project.path === projectPath);
		if (loaded) {
			return loaded;
		}

		this.logger.info('Adding project: ' + projectPath);

		const projectJson = await this.kendryteWorkspaceService.readProjectSetting(projectPath);
		if (!projectJson) {
			throw new Error(missingOrInvalidProject(projectPath));
		}

		const isRoot = this.projectList.length === 0;
		const shouldHaveSourceCode = (!projectJson.type) || (projectJson.type === CMakeProjectTypes.executable) ||
		                             (projectJson.type === CMakeProjectTypes.library && !projectJson.prebuilt);

		const isWorkspaceProject = isRoot || this._projectNameMap.has(projectJson.name);

		const directDependency: IProjectInfo<any>[] = [];
		const project: IProjectInfo = {
			json: projectJson,
			path: projectPath,
			isWorkspaceProject,
			isRoot,
			shouldHaveSourceCode,
			isSimpleFolder: false,
			directDependency,
		};

		this.projectList.push(project);

		const handleErr = (e: Error) => {
			if (e instanceof PathAttachedError) {
				throw e;
			}
			const ee = new PathAttachedError(this.kendryteWorkspaceService.getProjectSetting(projectPath), e.message);
			ee.stack = e.stack;
			throw ee;
		};

		this.logger.info('Dependency:');
		if (projectJson.dependency && Object.keys(projectJson.dependency).length > 0) {
			for (const depProjectName of Object.keys(projectJson.dependency)) {
				const workspaceOverride = this._projectNameMap.get(depProjectName);
				let depPath = '';
				if (workspaceOverride) {
					depPath = workspaceOverride;
					if (!isSameDrive(depPath, projectPath)) {
						throw new Error(`project ${project.json.name} and its dependency ${depProjectName} does not locate on the same disk. that is not supported.`);
					}
				} else {
					const topRootPath = this.projectList[0].path;
					depPath = resolvePath(topRootPath, CMAKE_LIBRARY_FOLDER_NAME, depProjectName);
				}

				const childProject = await this._readProjectJsonList(depPath).catch(handleErr);
				directDependency.push(childProject);
			}
		} else {
			this.logger.info('   No project dependency');
		}

		if (projectJson.localDependency && projectJson.localDependency.length > 0) {
			for (const relPath of projectJson.localDependency) {
				const absolutePath = resolvePath(projectPath, relPath);

				let p: Promise<IProjectInfo>;
				if (await exists(this.kendryteWorkspaceService.getProjectSetting(absolutePath))) {
					p = this._readProjectJsonList(absolutePath);
				} else if (await exists(resolvePath(absolutePath, 'CMakeLists.txt'))) {
					const name = (basename(projectPath) + '_' + relPath).replace(/[ .\\/]/, '_');
					p = this._loadSimpleFolderDependency(name, absolutePath);
				} else {
					throw new Error(missingOrInvalidProject(absolutePath));
				}

				await p.then((subProject) => {
					if (!subProject.json.name) {
						throw new PathAttachedError(subProject.path, missingJsonField('name'));
					}
					directDependency.push(subProject);
					return subProject;
				}, handleErr);
			}
		} else {
			this.logger.info('   No folder dependency');
		}
		return project;
	}

	public async resolveDependencies(): Promise<DeepReadonlyArray<IProjectInfoResolved>> {
		const projectTree = this.projectList[0];
		await this.resolveProjects(projectTree);

		this.logger.info('All defined constants:');
		for (const item of this.definitionsRegistry.values()) {
			this.logger.info(' - %s = %s', item.id, item.value);
		}

		return this.finalProjectList;
	}

	getDefinitions() {
		return this.definitionsRegistry.values();
	}

	private async resolveProjects(parentProject: IProjectInfo) {
		if (parentProject.hasOwnProperty('resolved')) {
			return;
		}

		const children: IProjectInfoResolved[] = [];
		for (const child of parentProject.directDependency) {
			await this.resolveProjects(child);
			children.push(child as IProjectInfoResolved);
		}

		const extended = Object.assign(parentProject, {
			resolved: await this.resolveTree(parentProject, children),
		});
		this.finalProjectList.push(extended);
	}

	private async resolveTree(
		project: IProjectInfo,
		children: IProjectInfoResolved[],
	) {
		const libProject = project.json as ILibraryProject;
		const ret: IResolvedData = {
			includeFolders: [],
			linkerScripts: [],
			extraListContent: '',
			extraList2Content: '',
			sourceFiles: [],
			linkLibs: [],
		};

		if (libProject.header) {
			ret.includeFolders.unshift(...libProject.header.map((path) => {
				return resolvePath(project.path, path);
			}));
		}
		if (libProject.include) {
			ret.includeFolders.unshift(...libProject.include.map((path) => {
				return resolvePath(project.path, path);
			}));
		}

		if (libProject.ld_file) {
			ret.linkerScripts.unshift(resolvePath(project.path, libProject.ld_file));
		}

		if (Array.isArray(libProject.systemLibrary) && libProject.systemLibrary.length) {
			ret.linkLibs.unshift(...libProject.systemLibrary);
		}

		for (const dep of children) {
			ret.includeFolders.push(...dep.resolved.includeFolders);
			ret.linkerScripts.push(...dep.resolved.linkerScripts);
			ret.linkLibs.push(...dep.resolved.linkLibs);
		}
		arrayRemoveDuplicate(ret.includeFolders);
		arrayRemoveDuplicate(ret.linkerScripts);
		arrayRemoveDuplicate(ret.linkLibs);

		if (project.json.extraList) {
			const extraListAbsolute = resolvePath(project.path, libProject.extraList);
			ret.extraListContent = await this.nodeFileSystemService.readFile(extraListAbsolute);
		}
		if (project.json.extraList2) {
			const extraListAbsolute = resolvePath(project.path, libProject.extraList2);
			ret.extraList2Content = await this.nodeFileSystemService.readFile(extraListAbsolute);
		}

		/// source file part below
		if (!project.shouldHaveSourceCode || project.isSimpleFolder) {
			return ret;
		}

		if (libProject.definitions) {
			for (const k of Object.keys(libProject.definitions)) {
				const type = DefineType.exec(k);
				const id = k.replace(DefineType, '');

				const bundle = this.definitionsRegistry.entry(id, () => {
					return {
						id,
						config: k,
						value: '',
						source: libProject.name,
					};
				});
				if (bundle.source !== libProject.name) {
					this.logger.warn('Overriding definitions of %s of project %s', id, bundle.source);
				}

				if (type && type[1].toLowerCase() === 'raw') {
					bundle.value = '' + libProject.definitions[k];
				} else {
					bundle.value = JSON.stringify(libProject.definitions[k]);
				}
			}
		}

		ret.sourceFiles = await this.matchSourceCode(project.path, libProject.source);

		return ret;
	}

	private async matchSourceCode(fsPath: string, sourceFileGlobs: string[]) {
		const sourceToMatch = sourceFileGlobs
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
		this.logger.info(`from directory: ${fsPath}`);
		const allSourceFiles: EntryItem[] = await fastGlobAsync(sourceToMatch, {
			cwd: fsPath,
			ignore: ignorePattern,
		}).catch((e) => {
			this.logger.error('Failed to search files:');
			this.logger.error(e.message);
			return [];
		});

		allSourceFiles.forEach((f) => {
			this.logger.debug(`   * ${f}`);
		});
		this.logger.info(`Matched source file count: ${allSourceFiles.length}.`);

		if (allSourceFiles.length === 0) {
			throw new Error('No source file matched for compile.');
		}

		this.logger.debug('file array: ', allSourceFiles);

		return allSourceFiles.map((item) => {
			return item.toString();
		});
		// console.log(item.matchingSourceFiles);
	}

	private detectDependencyLoop(tree = this.projectList[0], stack: string[] = []) {
		if (stack.includes(tree.json.name!)) {
			throw new Error(localize('loopDetected', 'Dependency loop detected in: {0}', stack.concat(tree.json.name!).join(' -> ')));
		}
		stack.push(tree.json.name!);
		for (const child of tree.directDependency) {
			this.detectDependencyLoop(child, stack);
		}
		stack.pop();
	}
}
