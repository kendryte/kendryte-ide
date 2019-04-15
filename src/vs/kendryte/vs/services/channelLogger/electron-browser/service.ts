import { Disposable } from 'vs/base/common/lifecycle';
import { Extensions, IOutputChannel, IOutputChannelRegistry, IOutputService } from 'vs/workbench/contrib/output/common/output';
import { IChannelLogger, IChannelLogService } from 'vs/kendryte/vs/services/channelLogger/common/type';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { ChannelLogger } from 'vs/kendryte/vs/services/channelLogger/common/logger';
import { Registry } from 'vs/platform/registry/common/platform';
import { IWindowService } from 'vs/platform/windows/common/windows';
import { URI } from 'vs/base/common/uri';
import { ILifecycleService } from 'vs/platform/lifecycle/common/lifecycle';

const registry = Registry.as<IOutputChannelRegistry>(Extensions.OutputChannels);

class ChannelLogService extends Disposable implements IChannelLogService {
	_serviceBrand: any;

	private readonly map: Map<string, IChannelLogger>;

	constructor(
		@IOutputService private outputService: IOutputService,
		@IWindowService private windowService: IWindowService,
		@ILifecycleService lifecycleService: ILifecycleService,
	) {
		super();

		this.map = new Map;

		lifecycleService.onShutdown(() => {
			this.dispose();
		});
	}

	closeChannel(channel: string) {
		const exists = this.map.get(channel);
		if (exists) {
			exists.dispose();
		}
	}

	public createChannel(name: string, id: string = name, log: boolean = false, file?: URI): IChannelLogger {
		registry.registerChannel({
			id,
			label: name,
			log,
			file,
		});
		const newItem = new ChannelLogger(this.windowService.windowId, this.outputService.getChannel(id) as IOutputChannel);
		this._register(newItem);

		this.map.set(id, newItem);
		newItem.onDispose(() => {
			this.map.delete(id);
		});

		return newItem;
	}

	show(channel: string, preserveFocus: boolean = false) {
		return this.outputService.showChannel(channel, preserveFocus);
	}
}

registerSingleton(IChannelLogService, ChannelLogService);