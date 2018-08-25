import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ILifecycleService, LifecyclePhase } from 'vs/platform/lifecycle/common/lifecycle';
import { IMaixBuildSystemService } from 'vs/workbench/parts/maix/cmake/common/type';
import { EnablementState, IExtensionEnablementService, IExtensionGalleryService, IExtensionManagementService } from 'vs/platform/extensionManagement/common/extensionManagement';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { TPromise } from 'vs/base/common/winjs.base';
import { IProgressService2, IProgressStep, ProgressLocation } from 'vs/workbench/services/progress/common/progress';
import { CMakeInstaller } from 'vs/workbench/parts/maix/cmake/node/cmakeInstaller';
import { IWindowService, IWindowsService } from 'vs/platform/windows/common/windows';
import { IProgress } from 'vs/platform/progress/common/progress';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { IOutputService } from 'vs/workbench/parts/output/common/output';
import { IDebugService } from 'vs/workbench/parts/debug/common/debug';
import { IWorkspaceConfigurationService } from 'vs/workbench/services/configuration/common/configuration';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';

export class MaixBuildSystemService implements IMaixBuildSystemService {
	_serviceBrand: any;
	protected cmakeInstaller: CMakeInstaller;

	constructor(
		@IInstantiationService protected instantiationService: IInstantiationService,
		@ILifecycleService lifecycleService: ILifecycleService,
		@IExtensionManagementService protected extensionManagementService: IExtensionManagementService,
		@IExtensionGalleryService protected extensionGalleryService: IExtensionGalleryService,
		@IExtensionEnablementService protected extensionEnablementService: IExtensionEnablementService,
		@INotificationService protected notifyService: INotificationService,
		@IProgressService2 protected progressService: IProgressService2,
		@IWindowsService protected windowsService: IWindowsService,
		@IWindowService protected windowService: IWindowService,
		@IEnvironmentService protected environmentService: IEnvironmentService,
		@IWorkspaceContextService protected workspaceContextService: IWorkspaceContextService,
		@IDebugService protected debugService: IDebugService,
		@IWorkspaceConfigurationService protected configurationService: IWorkspaceConfigurationService,
		@IOutputService outputService: IOutputService,
	) {
		this.cmakeInstaller = instantiationService.createInstance(CMakeInstaller);
		lifecycleService.when(LifecyclePhase.Running).then(_ => this.init());

		// this.workspaceContextService.onDidChangeWorkspaceFolders(_ => {
		// 	this.setDebugConfig();
		// });
		// this.setDebugConfig();
	}

	public getCmakeToRun() {
		return this.cmakeInstaller.getCurrentByCMakePath();
	}

	private init() {
		this.installExtension(
			'twxs.cmake',
			'ms-vscode.cpptools',
			'webfreak.debug',
			'ms-ceintl.vscode-language-pack-zh-hans',
		).then((changed) => {
			if (changed.indexOf('ms-ceintl.vscode-language-pack-zh-hans') !== -1) {
				if (this.environmentService.isBuilt) {
					this.windowsService.relaunch({});
				} else {
					this.windowService.reloadWindow();
				}
			} else if (changed.length) {
				this.windowService.reloadWindow();
			}
		}, (e) => { // error already notify
			console.log(e.message);
		});

		this.cmakeInstaller.installAtLeastOneCmake().then((path) => {
			this.cmakeInstaller.setCurrentByCMakePath(path);
		}, (err) => {
			this.notifyService.error(err);
		});
	}

	private async _installExtension(id: string, reporter: IProgress<IProgressStep>): TPromise<boolean> {
		console.log('install extension %s', id);
		reporter.report({ message: id });
		return this.extensionGalleryService.query({ names: [id], source: 'install-recommendation', pageSize: 1 }).then(pager => {
			if (pager && pager.firstPage && pager.firstPage.length) {
				reporter.report({ message: id });
				return this.extensionManagementService.installFromGallery(pager.firstPage[0]);
			}
			return TPromise.wrapError(new Error('Not Found'));
		}).then(() => {
			return true;
		}, (e) => {
			this.notifyService.error(`Cannot install extension [${id}]: ${e.message}`);
			return false;
		});
	}

	async installExtension(...ids: string[]): TPromise<string[]> {
		let changed: string[] = [];
		const list = await this.extensionManagementService.getInstalled();

		for (const item of list) {
			const alreadyExists = ids.indexOf(item.galleryIdentifier.id);
			if (alreadyExists !== -1) {
				ids.splice(alreadyExists, 1);
				if (this.extensionEnablementService.isEnabled(item)) {
					console.log('extension is already install and enabled: %s', item.identifier.id);
				} else {
					console.log('set extension enabled: %s', item.identifier.id);
					const enableSuccess = await this.extensionEnablementService.setEnablement(item, EnablementState.Enabled);
					if (enableSuccess) {
						changed.push(item.galleryIdentifier.id);
					} else {
						this.notifyService.error(`Cannot enable extension: ${alreadyExists}`);
					}
				}
			}
		}

		if (ids.length) {
			await this.progressService.withProgress({
				location: ProgressLocation.Notification,
				title: 'Installing Extension',
				cancellable: false,
			}, async (progress) => {
				for (const id of ids) {
					const ok = await this._installExtension(id, progress);
					if (ok) {
						changed.push(id);
					}
				}
			});
		}

		return changed;
	}

	// private setDebugConfig() {
	// 	if (!this.workspaceContextService.getWorkspace().folders.length) {
	// 		return;
	// 	}
	// 	const resource = this.workspaceContextService.getWorkspace().folders[0].toResource('.vscode/launch.json');
	//
	// 	const launchJson = this.configurationService.getValue<IGlobalConfig>('launch', {
	// 		resource,
	// 	});
	//
	// 	const exists = launchJson.configurations.findIndex((item) => {
	// 		return item.hasOwnProperty('maix');
	// 	});
	//
	// 	// todo: insert startup config?
	//
	// 	if (exists === -1) {
	// 		this.configurationService.updateValue('configurations', {
	// 			resource,
	// 		}, ConfigurationTarget.WORKSPACE);
	// 	}
	// }
}
