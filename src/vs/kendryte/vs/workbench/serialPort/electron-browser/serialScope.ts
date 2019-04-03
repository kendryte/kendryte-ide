import { IContextKey, IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { SerialReplHistory } from 'vs/kendryte/vs/workbench/serialPort/electron-browser/serialReplHistory';
import { createAndBindHistoryNavigationWidgetScopedContextKeyService } from 'vs/platform/browser/contextScopedHistoryWidget';
import { ServiceCollection } from 'vs/platform/instantiation/common/serviceCollection';
import { CONTEXT_IN_SERIAL_PORT_REPL } from 'vs/kendryte/vs/workbench/serialPort/common/type';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { Disposable } from 'vs/base/common/lifecycle';
import { ITextModel } from 'vs/editor/common/model';
import { URI as uri } from 'vs/base/common/uri';
import { IModelService } from 'vs/editor/common/services/modelService';
import { ISerialPrivateReplService } from 'vs/kendryte/vs/workbench/serialPort/electron-browser/serialPrivateReplService';
import { OutputXTerminal } from 'vs/kendryte/vs/workbench/serialPort/electron-browser/outputWindow';
import { ISerialMonitorControlService } from 'vs/kendryte/vs/workbench/serialPort/electron-browser/outputWindowControlService';
import { ILogService } from 'vs/platform/log/common/log';
import { IDebugSession } from 'vs/workbench/contrib/debug/common/debug';
import { UserLineInputStream, UserTypeInputStream } from 'vs/kendryte/vs/workbench/serialPort/electron-browser/iobuffers/input';

export class SerialScope extends Disposable implements ISerialPrivateReplService {
	_serviceBrand: any;

	public readonly enablement: IContextKey<boolean>; // historyNavigationEnablement
	public readonly instantiationService: IInstantiationService;
	public readonly history: SerialReplHistory;

	public readonly model: ITextModel;
	public readonly lineInputStream = new UserLineInputStream;
	public readonly typeInputStream = new UserTypeInputStream;

	constructor(
		replInputDom: HTMLElement,
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
		// console.log('accept input!');
		this.history.add(this.model.getValue());
		this.lineInputStream.write(this.model.getValue());
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
		this.logService.info('setOutput()');
		this.serialMonitorControlService.setSingleton(xterm);
		this.lineInputStream.setTerminal(xterm);
		this._register(xterm.onData((data: string) => {
			this.acceptTypeInput(data);
		}));
	}

	public selectSession(session: IDebugSession): void {
		this.logService.info('selectSession');
	}

	public clearRepl(): void {
		this.logService.info('clearRepl');
		this.model.setValue('');
	}
}
