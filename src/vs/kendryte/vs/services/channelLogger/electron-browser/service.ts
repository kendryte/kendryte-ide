import { Disposable } from 'vs/base/common/lifecycle';
import { Extensions, IOutputChannel, IOutputChannelRegistry, IOutputService } from 'vs/workbench/contrib/output/common/output';
import { IChannelLogger, IChannelLogService, OPEN_RESOURCE_SCHEME } from 'vs/kendryte/vs/services/channelLogger/common/type';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { ChannelLogger } from 'vs/kendryte/vs/services/channelLogger/common/logger';
import { Registry } from 'vs/platform/registry/common/platform';
import { IElectronEnvironmentService } from 'vs/workbench/services/electron/electron-browser/electronEnvironmentService';
import { URI } from 'vs/base/common/uri';
import { ILifecycleService } from 'vs/platform/lifecycle/common/lifecycle';
import { IEditorService, IOpenEditorOverride } from 'vs/workbench/services/editor/common/editorService';
import { IEditorInput } from 'vs/workbench/common/editor';
import { IEditorOptions, ITextEditorOptions } from 'vs/platform/editor/common/editor';
import { IEditorGroup } from 'vs/workbench/services/editor/common/editorGroupsService';

const registry = Registry.as<IOutputChannelRegistry>(Extensions.OutputChannels);

class ChannelLogService extends Disposable implements IChannelLogService {
	_serviceBrand: any;

	private readonly map: Map<string, IChannelLogger>;

	constructor(
		@IOutputService private outputService: IOutputService,
		@IElectronEnvironmentService private readonly electronEnvironmentService: IElectronEnvironmentService,
		@IEditorService private readonly editorService: IEditorService,
		@ILifecycleService lifecycleService: ILifecycleService,
	) {
		super();

		this.map = new Map;

		lifecycleService.onShutdown(() => {
			this.dispose();
		});

		this._register(
			this.editorService.overrideOpenEditor(this.onEditorOpening.bind(this)),
		);
	}

	private onEditorOpening(editor: IEditorInput, options: IEditorOptions | ITextEditorOptions | undefined, group: IEditorGroup): IOpenEditorOverride | undefined {
		const res = editor.getResource();
		if (!res) {
			return;
		}

		if (res.scheme === OPEN_RESOURCE_SCHEME) {
			if (res.path.startsWith('/logger/')) {
				this.show(res.fragment);
				return { override: Promise.resolve(undefined) };
			}
		}
		return;
	}

	closeChannel(channel: string) {
		const exists = this.map.get(channel);
		if (exists) {
			exists.dispose();
		}
	}

	public createChannel(name: string, id: string = name, log: boolean = false, file?: URI): IChannelLogger {
		if (this.map.has(id)) {
			return this.map.get(id)!;
		}
		registry.registerChannel({
			id,
			label: name,
			log,
			file,
		});
		const newItem = new ChannelLogger(this.electronEnvironmentService.windowId, this.outputService.getChannel(id) as IOutputChannel);
		this._register(newItem);

		this.map.set(id, newItem);
		newItem.onDispose(() => {
			this.map.delete(id);
		});

		newItem.writeln('```');

		return newItem;
	}

	show(channel: string, preserveFocus: boolean = false) {
		return this.outputService.showChannel(channel, preserveFocus);
	}
}

registerSingleton(IChannelLogService, ChannelLogService);
