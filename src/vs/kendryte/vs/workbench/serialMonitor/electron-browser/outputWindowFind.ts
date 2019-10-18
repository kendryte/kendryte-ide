import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { SimpleFindWidget } from 'vs/workbench/contrib/codeEditor/browser/find/simpleFindWidget';
import { FindReplaceState } from 'vs/editor/contrib/find/findState';
import { IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { IContextKey, IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { Terminal as XTermTerminal } from 'xterm';
import { CONTEXT_SERIAL_PORT_FIND_WIDGET_FOCUSED, CONTEXT_SERIAL_PORT_FIND_WIDGET_INPUT_FOCUSED } from 'vs/kendryte/vs/workbench/serialMonitor/common/actionId';
import { ITheme, IThemeService } from 'vs/platform/theme/common/themeService';
import { SearchAddon } from 'xterm-addon-search';

const FIND_FOCUS_CLASS = 'find-focused';

export class OutputWindowFind extends SimpleFindWidget {
	private readonly container: HTMLElement;
	public readonly findState: FindReplaceState;
	private readonly terminal: XTermTerminal;
	private readonly terminalSearch: SearchAddon;

	private readonly _findInputFocused: IContextKey<boolean>;
	private readonly _findWidgetFocused: IContextKey<boolean>;
	private readonly themeService: IThemeService;

	constructor(
		container: HTMLElement,
		terminal: XTermTerminal,
		terminalSearch: SearchAddon,
		@IContextViewService contextViewService: IContextViewService,
		@IContextKeyService contextKeyService: IContextKeyService,
		@IInstantiationService instantiationService: IInstantiationService,
		@IThemeService themeService: IThemeService,
	) {
		const findState = new FindReplaceState();

		super(contextViewService, contextKeyService, findState, true);

		this.findState = findState;
		this.container = container;
		this.terminal = terminal;
		this.terminalSearch = terminalSearch;
		this.themeService = themeService;

		this._findInputFocused = CONTEXT_SERIAL_PORT_FIND_WIDGET_INPUT_FOCUSED.bindTo(contextKeyService);
		this._findWidgetFocused = CONTEXT_SERIAL_PORT_FIND_WIDGET_FOCUSED.bindTo(contextKeyService);

		this._register(findState);

		this._register(this.focusTracker.onDidFocus(() => container.classList.add(FIND_FOCUS_CLASS)));
		this._register(this.focusTracker.onDidBlur(() => container.classList.remove(FIND_FOCUS_CLASS)));

		this.container.appendChild(this.getDomNode());

		this._register(themeService.onThemeChange(theme => this._updateTheme(theme)));
		this._updateTheme();
	}

	onInputChanged(): boolean {
		// Ignore input changes for now
		this.terminalSearch.findPrevious(this.inputValue, { regex: this._getRegexValue(), wholeWord: this._getWholeWordValue(), caseSensitive: this._getCaseSensitiveValue() });
		return false;
	}

	find(previous: boolean): void {
		if (previous) {
			this.terminalSearch.findPrevious(this.inputValue, { regex: this._getRegexValue(), wholeWord: this._getWholeWordValue(), caseSensitive: this._getCaseSensitiveValue() });
		} else {
			this.terminalSearch.findNext(this.inputValue, { regex: this._getRegexValue(), wholeWord: this._getWholeWordValue(), caseSensitive: this._getCaseSensitiveValue() });
		}
	}

	hide() {
		super.hide();
		this.terminal.focus();
	}

	onFocusTrackerFocus(): void {
		// this.terminal.notifyFindWidgetFocusChanged(true);
		this._findWidgetFocused.set(true);
	}

	onFocusTrackerBlur(): void {
		// this.terminal.notifyFindWidgetFocusChanged(false);
		this._findWidgetFocused.reset();
	}

	onFindInputFocusTrackerFocus(): void {
		this._findInputFocused.set(true);
	}

	onFindInputFocusTrackerBlur(): void {
		this._findInputFocused.reset();
	}

	private _updateTheme(theme?: ITheme): void {
		if (!theme) {
			theme = this.themeService.getTheme();
		}

		this.updateTheme(theme);
	}

	protected findFirst(): void {
		console.log('find first');
		this.find(false);
	}
}
