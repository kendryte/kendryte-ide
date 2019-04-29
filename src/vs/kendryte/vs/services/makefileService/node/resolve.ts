import { DefineValue, IDependencyTree, IProjectInfo } from 'vs/kendryte/vs/services/makefileService/common/type';
import { missingOrInvalidProject } from 'vs/base/common/messages';
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
import { DeepReadonlyArray } from 'vs/kendryte/vs/base/common/type/deepReadonly';
import { isSameDrive } from 'vs/kendryte/vs/base/common/fs/isSameDrive';

const DefineType = /:(raw|str)$/i;

interface IResolvedData {
	includeFolders: string[];
	linkerScripts: string[];
	extraListContent: string;
	definitions: DefineValue[];
	sourceFiles: string[];
}

export interface IProjectInfoResolved extends IProjectInfo {
	resolved: IResolvedData;
}

export class MakefileServiceResolve {
	private readonly projectList: IProjectInfo[] = [];
	private readonly finalProjectList: IProjectInfoResolved[] = this.projectList as any;
	private readonly definitionsRegistry = new ExtendMap<string, DefineValue>();

	constructor(
		private readonly projectPath: string,
		private readonly _projectNameMap: Map<string/* projectName */, string/* project absolute path */>,
		private readonly logger: ILogService,
		@IKendryteWorkspaceService private readonly kendryteWorkspaceService: IKendryteWorkspaceService,
		@INodeFileSystemService private readonly nodeFileSystemService: INodeFileSystemService,
	) {
	}

	public readProjectJsonList() {
		return this._readProjectJsonList(this.projectPath);
	}

	private async _readProjectJsonList(projectPath: string) {
		const list = this.projectList;

		if (list.some((project) => project.path === projectPath)) {
			return list;
		}
		this.logger.info('Adding project: ' + projectPath);

		const projectJson = await this.kendryteWorkspaceService.readProjectSetting(projectPath);
		if (!projectJson) {
			throw new Error(missingOrInvalidProject(projectPath));
		}

		const isRoot = list.length === 0;
		const shouldHaveSourceCode = (projectJson.type === CMakeProjectTypes.executable) ||
		                             (projectJson.type === CMakeProjectTypes.library && !projectJson.prebuilt);

		const isWorkspaceProject = isRoot || this._projectNameMap.has(projectJson.name);

		const project = <IProjectInfo>{
			json: projectJson,
			path: projectPath,
			isWorkspaceProject,
			isRoot,
			shouldHaveSourceCode,
			directDependency: {},
		};

		list.push(project);

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
					const topRootPath = list[0].path;
					depPath = resolvePath(topRootPath, CMAKE_LIBRARY_FOLDER_NAME, depProjectName);
				}

				project.directDependency[depProjectName] = depPath;
				await this._readProjectJsonList(depPath);
			}
		}

		return list;
	}

	public async resolveDependencies(): Promise<DeepReadonlyArray<IProjectInfoResolved>> {
		const projectTree = await this.createDependencyTree();
		await this.resolveProjects(projectTree);
		return this.finalProjectList;
	}

	private async resolveProjects({ project, children }: IDependencyTree) {
		if (project.hasOwnProperty('resolved')) {
			return;
		}

		const currentDeps: IProjectInfoResolved[] = [];
		for (const child of children) {
			await this.resolveProjects(child);
			currentDeps.push(child.project as IProjectInfoResolved);
		}

		const extended = Object.assign(project, {
			resolved: await this.resolveTree(project, currentDeps, this.definitionsRegistry),
		});
		this.finalProjectList.push(extended);
	}

	private async resolveTree(
		project: IProjectInfo,
		children: IProjectInfoResolved[],
		definitionsRegistry: ExtendMap<string, DefineValue>,
	) {
		const libProject = project.json as ILibraryProject;
		const ret = <IResolvedData>{
			includeFolders: [],
			linkerScripts: [],
			extraListContent: '',
			definitions: [],
			sourceFiles: [],
		};

		if (libProject.header) {
			ret.includeFolders.push(...libProject.header.map((path) => {
				return resolvePath(project.path, path);
			}));
		}
		if (libProject.include) {
			ret.includeFolders.push(...libProject.include.map((path) => {
				return resolvePath(project.path, path);
			}));
		}

		if (libProject.ld_file) {
			ret.linkerScripts.push(resolvePath(project.path, libProject.ld_file));
		}

		for (const dep of children) {
			ret.includeFolders.push(...dep.resolved.includeFolders);
			ret.linkerScripts.push(...dep.resolved.linkerScripts);
		}

		if (project.json.extraList) {
			const extraListAbsolute = resolvePath(project.path, libProject.extraList);
			ret.extraListContent = await this.nodeFileSystemService.readFile(extraListAbsolute);
		}

		/// source file part below
		if (!project.shouldHaveSourceCode) {
			return ret;
		}

		if (libProject.definitions) {
			for (const k of Object.keys(libProject.definitions)) {
				const type = DefineType.exec(k);
				const id = k.replace(DefineType, '');

				const bundle = definitionsRegistry.entry(id, () => {
					return {
						id,
						config: k,
						value: '',
					};
				});
				if (type && type[1].toLowerCase() === 'raw') {
					bundle.value = '' + libProject.definitions[k];
				} else {
					bundle.value = JSON.stringify(libProject.definitions[k]);
				}
				ret.definitions.push(bundle);
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

	private createDependencyTree(): IDependencyTree {
		const list = this.projectList;

		const nameProjectMap = new Map<string, IProjectInfo>();
		for (const project of list) {
			nameProjectMap.set(project.json.name, project);
		}

		const tree: IDependencyTree = {
			project: list[0],
			children: [],
		};

		inner(tree, [list[0]]);

		return tree;

		function preventLoop(stack: IProjectInfo[], name: string) {
			if (stack.some(project => project.json.name === name)) {
				const nameStack = stack.map((project) => {
					return project.json.name;
				});
				const nameStr = nameStack.concat(name).join(' -> ');

				throw new Error(localize('loopDetected', 'Loop detected in: {0}', nameStr));
			}
		}

		function inner(leaf: IDependencyTree, stack: IProjectInfo[]) {
			for (const depName of Object.keys(leaf.project.directDependency)) {
				preventLoop(stack, depName);

				const depProject = nameProjectMap.get(depName)! as IProjectInfo<ILibraryProject>;

				const tree: IDependencyTree<ILibraryProject> = {
					project: depProject,
					children: [],
				};
				leaf.children.push(tree);

				inner(tree, [...stack, depProject]);
			}
		}
	}
}
