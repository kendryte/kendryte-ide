import { IContextKey, IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { SerialReplHistory } from 'vs/kendryte/vs/workbench/serialPort/electron-browser/serialReplHistory';
import { createAndBindHistoryNavigationWidgetScopedContextKeyService } from 'vs/platform/widget/browser/contextScopedHistoryWidget';
import { ServiceCollection } from 'vs/platform/instantiation/common/serviceCollection';
import { CONTEXT_IN_SERIAL_PORT_REPL, ISerialPrivateReplService } from 'vs/kendryte/vs/workbench/serialPort/common/type';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { Disposable } from 'vs/base/common/lifecycle';
import { ITextModel } from 'vs/editor/common/model';
import { URI as uri } from 'vs/base/common/uri';
import { IModelService } from 'vs/editor/common/services/modelService';

export class SerialScope extends Disposable implements ISerialPrivateReplService {
	_serviceBrand: any;

	public readonly enablement: IContextKey<boolean>; // historyNavigationEnablement
	public readonly instantiationService: IInstantiationService;
	public readonly history: SerialReplHistory;

	public readonly model: ITextModel;

	constructor(
		replInputDom: HTMLElement,
		@IInstantiationService private readonly __instantiationService: IInstantiationService,
		@IContextKeyService private contextKeyService: IContextKeyService,
		@IModelService modelService: IModelService,
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
	}

	public acceptReplInput(): void {
		console.log('acceptReplInput!!!');
		this.history.add(this.model.getValue());
	}

	public getVisibleContent(): string {
		console.log('getVisibleContent???');
		return '';
	}
}