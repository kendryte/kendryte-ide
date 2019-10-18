import { IContextKey, IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { SerialReplHistory } from 'vs/kendryte/vs/workbench/serialMonitor/electron-browser/serialReplHistory';
import { createAndBindHistoryNavigationWidgetScopedContextKeyService } from 'vs/platform/browser/contextScopedHistoryWidget';
import { ServiceCollection } from 'vs/platform/instantiation/common/serviceCollection';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { Disposable } from 'vs/base/common/lifecycle';
import { ITextModel } from 'vs/editor/common/model';
import { URI as uri } from 'vs/base/common/uri';
import { IModelService } from 'vs/editor/common/services/modelService';
import { ISerialPrivateReplService } from 'vs/kendryte/vs/workbench/serialMonitor/electron-browser/serialPrivateReplService';
import { OutputXTerminal } from 'vs/kendryte/vs/workbench/serialMonitor/electron-browser/outputWindow';
import { ISerialMonitorControlService } from 'vs/kendryte/vs/workbench/serialMonitor/electron-browser/outputWindowControlService';
import { ILogService } from 'vs/platform/log/common/log';
import { IDebugSession } from 'vs/workbench/contrib/debug/common/debug';
import { UserLineInputStream, UserTypeInputStream } from 'vs/kendryte/vs/workbench/serialMonitor/electron-browser/iobuffers/input';
import { CONTEXT_IN_SERIAL_PORT_REPL } from 'vs/kendryte/vs/workbench/serialMonitor/common/actionId';

export class SerialScope extends Disposable implements ISerialPrivateReplService {
	_serviceBrand: any;

	public readonly enablement: IContextKey<boolean>; // historyNavigationEnablement
	public readonly instantiationService: IInstantiationService;
	public readonly history: SerialReplHistory;

	public readonly model: ITextModel;
	public readonly lineInputStream = new UserLineInputStream;
	public readonly typeInputStream = new UserTypeInputStream;

	constructor(
		private readonly replInputDom: HTMLElement,
		@IInstantiationService private readonly __instantiationService: IInstantiationService,
		@IContextKeyService private contextKeyService: IContextKeyService,
		@IModelService modelService: IModelService,
		@ISerialMonitorControlService private readonly serialMonitorControlService: ISerialMonitorControlService,
		@ILogService protected readonly logService: ILogService,
	) {
		super();

		this.model = modelService.createModel('', null, uri.parse(`serial-port:replinput`), true);
		this._register(this.model);

		const historyNav = this.history = this.__instantiationService.createInstance(SerialReplHistory);
		this._register(historyNav);

		const { scopedContextKeyService, historyNavigationEnablement } = createAndBindHistoryNavigationWidgetScopedContextKeyService(this.contextKeyService, {
			target: replInputDom,
			historyNavigator: historyNav,
		});

		this.enablement = historyNavigationEnablement;

		this._register(scopedContextKeyService);
		CONTEXT_IN_SERIAL_PORT_REPL.bindTo(scopedContextKeyService).set(true);

		this.instantiationService = __instantiationService.createChild(new ServiceCollection(
			[IContextKeyService, scopedContextKeyService],
			[ISerialPrivateReplService, this],
		));

		this.logService.info('created child instantiation service');
	}

	public acceptReplInput(): void {
		const data = this.model.getValue();
		// console.log('accept input!', data);
		this.history.add(data);
		this.lineInputStream.write(data);
		this.model.setValue('');
	}

	public acceptTypeInput(data: string): void {
		// console.log('accept input!');
		this.typeInputStream.write(data);
	}

	public getVisibleContent(): string {
		console.log('getVisibleContent???');
		return '';
	}

	setOutput(xterm: OutputXTerminal) {
		this.logService.debug('setOutput()');
		this.serialMonitorControlService.setSingleton(xterm);
		this.lineInputStream.setTerminal(xterm);
		this._register(xterm.onXTermInputData((data: string) => {
			this.acceptTypeInput(data);
		}));
	}

	public async selectSession(session: IDebugSession) {
		this.logService.debug('selectSession');
	}

	public async clearRepl() {
		this.logService.debug('clearRepl');
		this.model.setValue('');
	}

	public focusRepl(): void {
		this.replInputDom.focus();
	}
}
