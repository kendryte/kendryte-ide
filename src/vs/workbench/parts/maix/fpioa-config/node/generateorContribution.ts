import { Action } from 'vs/base/common/actions';
import { localize } from 'vs/nls';
import { TPromise } from 'vs/base/common/winjs.base';
import { IFuncIOMap, ISavedJson } from 'vs/workbench/parts/maix/fpioa-config/common/types';
import { getChipPackaging } from 'vs/workbench/parts/maix/fpioa-config/common/packagingRegistry';
import { IChipGeneratorConfig } from 'vs/workbench/parts/maix/fpioa-config/common/packagingTypes';
import { HeaderGenerator, SourceGenerator } from 'vs/workbench/parts/maix/fpioa-config/node/cGenerator';
import { IFileService } from 'vs/platform/files/common/files';
import { URI } from 'vs/base/common/uri';
import { ILifecycleService, LifecyclePhase } from 'vs/platform/lifecycle/common/lifecycle';
import { IInstantiationService, ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
import { SyncActionDescriptor } from 'vs/platform/actions/common/actions';
import { CommandsRegistry } from 'vs/platform/commands/common/commands';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { resolvePath } from 'vs/workbench/parts/maix/_library/node/resolvePath';

// const category = localize('kendryte', 'Kendryte');

export interface IGenerator {
	readonly filename: string;

	generate(config: IChipGeneratorConfig, funcPinMap: IFuncIOMap): string;
}

export class GenerateFpioaFilesAction extends Action {
	public static readonly ID = 'maix.fpioa.generate';
	public static readonly LABEL = localize('KendryteIOGenerate', 'Generate Kendryte IO code');

	private generators: IGenerator[] = [];

	constructor(
		id: string,
		label: string,
		@IFileService private fileService: IFileService,
	) {
		super(id, label);

		this.generators.push(new SourceGenerator());
		this.generators.push(new HeaderGenerator());
	}

	async run(event, { selectedChip, funcPinMap, configFile }: ISavedJson & { configFile: string }): TPromise<void> {
		const { generator, geometry } = getChipPackaging(selectedChip);

		const mapper: IFuncIOMap = new Map();
		for (const funcId of Object.keys(funcPinMap)) {
			const pinLoc = funcPinMap[funcId];
			if (funcId !== undefined) {
				mapper.set(funcId, geometry.IOPinPlacement[pinLoc]);
			}
		}

		for (const g of this.generators) {
			const content = g.generate(generator, mapper);
			await this.fileService.createFile(URI.file(resolvePath(configFile, '..', g.filename)), content, { overwrite: true });
		}
	}
}

const descriptor = new SyncActionDescriptor(GenerateFpioaFilesAction, GenerateFpioaFilesAction.ID, GenerateFpioaFilesAction.LABEL);
CommandsRegistry.registerCommand({
	id: GenerateFpioaFilesAction.ID,
	handler: (accessor: ServicesAccessor, ...args: any[]) => {
		const instantiationService = accessor.get(IInstantiationService);
		const notificationService = accessor.get(INotificationService);
		return accessor.get(ILifecycleService).when(LifecyclePhase.Running).then(() => {
			const actionInstance = instantiationService.createInstance(descriptor.syncDescriptor);
			try {
				actionInstance.label = descriptor.label || actionInstance.label;

				// don't run the action when not enabled
				if (!actionInstance.enabled) {
					actionInstance.dispose();
					return void 0;
				}

				return TPromise.as(actionInstance.run(undefined, ...args)).then(() => {
					actionInstance.dispose();
				}, (err) => {
					actionInstance.dispose();
					return TPromise.wrapError(err);
				});
			} catch (err) {
				actionInstance.dispose();
				return TPromise.wrapError(err);
			}
		}).then(undefined, (e) => {
			notificationService.error(e);
			throw e;
		});
	},
});