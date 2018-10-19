import { IContextKey, IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { SerialReplHistory } from 'vs/kendryte/vs/workbench/serialPort/electron-browser/serialReplHistory';
import { createAndBindHistoryNavigationWidgetScopedContextKeyService } from 'vs/platform/widget/browser/contextScopedHistoryWidget';
import { ServiceCollection } from 'vs/platform/instantiation/common/serviceCollection';
import { CONTEXT_IN_SERIAL_PORT_REPL } from 'vs/kendryte/vs/workbench/serialPort/common/type';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { Disposable } from 'vs/base/common/lifecycle';
import { ITextModel } from 'vs/editor/common/model';
import { URI as uri } from 'vs/base/common/uri';
import { IModelService } from 'vs/editor/common/services/modelService';
import { ISerialPrivateReplService } from 'vs/kendryte/vs/workbench/serialPort/electron-browser/serialPrivateReplService';
import { Transform } from 'stream';
import { ILocalOptions, SerialPortBaseBinding, serialPortEOL } from 'vs/kendryte/vs/workbench/serialPort/node/serialPortType';
import { OutputXTerminal } from 'vs/kendryte/vs/workbench/serialPort/electron-browser/outputWindow';
import { ISerialMonitorControlService } from 'vs/kendryte/vs/workbench/serialPort/electron-browser/outputWindowControlService';
import { ILogService } from 'vs/platform/log/common/log';
import { IDebugSession } from 'vs/workbench/parts/debug/common/debug';

export class SerialScope extends Disposable implements ISerialPrivateReplService {
	_serviceBrand: any;

	public readonly enablement: IContextKey<boolean>; // historyNavigationEnablement
	public readonly instantiationService: IInstantiationService;
	public readonly history: SerialReplHistory;

	public readonly model: ITextModel;
	public readonly lineInputStream = new LineBuffer;

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
		this.logService.info('acceptReplInput');
		// console.log('accept input!');
		this.history.add(this.model.getValue());
		this.lineInputStream.write(this.model.getValue());
		this.model.setValue('');
	}

	public getVisibleContent(): string {
		console.log('getVisibleContent???');
		return '';
	}

	setOutput(xterm: OutputXTerminal) {
		this.logService.info('setOutput()');
		this.serialMonitorControlService.setSingleton(xterm);
	}

	public selectSession(session: IDebugSession): void {
		this.logService.info('selectSession');
	}

	public clearRepl(): void {
		this.logService.info('clearRepl');
		this.model.setValue('');
	}
}

const escapeMap: { [id: string]: string } = {
	/// https://en.wikipedia.org/wiki/Escape_sequences_in_C#Table_of_escape_sequences
	'a': Buffer.from('07', 'hex').toString('latin1'),
	'b': Buffer.from('08', 'hex').toString('latin1'),
	'f': Buffer.from('0C', 'hex').toString('latin1'),
	'n': Buffer.from('0A', 'hex').toString('latin1'),
	'r': Buffer.from('0D', 'hex').toString('latin1'),
	't': Buffer.from('09', 'hex').toString('latin1'),
	'v': Buffer.from('0B', 'hex').toString('latin1'),
	'\\': Buffer.from('5C', 'hex').toString('latin1'),
	'\'': Buffer.from('27', 'hex').toString('latin1'),
	'"': Buffer.from('22', 'hex').toString('latin1'),
	'?': Buffer.from('3F', 'hex').toString('latin1'),
	'e': Buffer.from('1B', 'hex').toString('latin1'),
};

class LineBuffer extends Transform {
	private ending = '';
	private encoding: string = 'latin1';
	private escape: boolean;
	private term: OutputXTerminal;
	private echo: boolean;
	private instance: SerialPortBaseBinding;

	constructor() {
		super({ objectMode: true });
	}

	end() {
		// can not end
		console.warn('end');
	}

	_transform(data: string, encoding: string, callback: Function) {
		if (this.escape) {
			try {
				data = data.replace(/\\u([0-9a-fA-F]{4})/g, (m, code) => {
					return Buffer.from(code, 'hex').toString('latin1');
				}).replace(/\\U([0-9a-fA-F]{8})/ig, (m, code) => {
					return Buffer.from(code, 'hex').toString('latin1');
				}).replace(/\\x([0-9a-f]{2})/ig, (m, code) => {
					return Buffer.from(code, 'hex').toString('latin1');
				}).replace(/\\([eabfnrtv\\'"?])/ig, (m, code) => {
					return escapeMap[code];
				});
			} catch (e) {
				this.term.writeUser(this.instance, '\x1B[38;5;9m' + e.message + '\x1B[0m\r');
				return callback();
			}
		}

		if (this.echo) {
			this.term.writeUser(this.instance, data + '\r');
		}

		// console.log('transform: %s %s (%s)', data, Buffer.from(this.ending).toString('hex'), this.encoding);
		this.push(Buffer.from(data + this.ending, this.encoding));

		callback();
	}

	setOptions(options: ILocalOptions, terminal: OutputXTerminal) {
		this.encoding = options.charset || 'latin1';
		this.ending = serialPortEOL.get(options.lineEnding) || '';
		this.escape = options.escape || false;
		this.echo = options.echo || false;
		this.term = terminal;
	}

	doPipe(instance: SerialPortBaseBinding, localOptions: ILocalOptions = {} as any, terminal: OutputXTerminal) {
		this.unpipe();
		this.setOptions(localOptions, terminal);
		this.instance = instance;
		this.pipe(instance);
	}
}