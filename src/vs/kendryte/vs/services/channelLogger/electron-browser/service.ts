import { Disposable } from 'vs/base/common/lifecycle';
import { Extensions, IOutputChannelRegistry, IOutputService } from 'vs/workbench/parts/output/common/output';
import { IChannelLogger, IChannelLogService } from 'vs/kendryte/vs/services/channelLogger/common/type';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { ChannelLogger } from 'vs/kendryte/vs/services/channelLogger/electron-browser/logger';
import { Registry } from 'vs/platform/registry/common/platform';
import { IWindowService } from 'vs/platform/windows/common/windows';
import { URI } from 'vs/base/common/uri';

const registry = Registry.as<IOutputChannelRegistry>(Extensions.OutputChannels);

class ChannelLogService extends Disposable implements IChannelLogService {
	_serviceBrand: any;

	private readonly map: Map<string, IChannelLogger>;

	constructor(
		@IOutputService private outputService: IOutputService,
		@IWindowService private windowService: IWindowService,
	) {
		super();

		this.map = new Map;
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
		const newItem = new ChannelLogger(this.windowService.getCurrentWindowId(), this.outputService.getChannel(id));
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