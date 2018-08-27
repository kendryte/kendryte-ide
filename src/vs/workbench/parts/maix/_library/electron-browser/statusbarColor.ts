import { LifecyclePhase } from 'vs/platform/lifecycle/common/lifecycle';
import { Extensions as WorkbenchExtensions, IWorkbenchContribution, IWorkbenchContributionsRegistry } from 'vs/workbench/common/contributions';
import { Registry } from 'vs/platform/registry/common/platform';
import {
	STATUS_BAR_BACKGROUND,
	STATUS_BAR_BORDER,
	STATUS_BAR_FOREGROUND,
	STATUS_BAR_NO_FOLDER_BACKGROUND,
	STATUS_BAR_NO_FOLDER_BORDER,
	STATUS_BAR_NO_FOLDER_FOREGROUND,
	Themable,
} from 'vs/workbench/common/theme';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { isStatusbarInDebugMode, } from 'vs/workbench/parts/debug/browser/statusbarColorProvider';
import { contrastBorder, registerColor } from 'vs/platform/theme/common/colorRegistry';
import { addClass, createStyleSheet, removeClass } from 'vs/base/browser/dom';
import { IPartService, Parts } from 'vs/workbench/services/part/common/partService';
import { IWorkspaceContextService, WorkbenchState } from 'vs/platform/workspace/common/workspace';
import { IPackagesUpdateService } from 'vs/workbench/parts/maix/_library/node/packagesUpdateService';
import { IDebugService } from 'vs/workbench/parts/debug/common/debug';
import { localize } from 'vs/nls';

export const STATUS_BAR_HAS_ERROR_BACKGROUND = registerColor('statusBar.errorBackground', {
	dark: '#f20041',
	light: '#f20041',
	hc: '#f20041',
}, localize('statusBarErrorBackground', 'Status bar background color when something went wrong. The status bar is shown in the bottom of the window'));

export const STATUS_BAR_HAS_ERROR_FOREGROUND = registerColor('statusBar.errorForeground', {
	dark: STATUS_BAR_FOREGROUND,
	light: STATUS_BAR_FOREGROUND,
	hc: STATUS_BAR_FOREGROUND,
}, localize('statusBarErrorForeground', 'Status bar foreground color when something went wrong. The status bar is shown in the bottom of the window'));

export const STATUS_BAR_HAS_ERROR_BORDER = registerColor('statusBar.errorBorder', {
	dark: STATUS_BAR_BORDER,
	light: STATUS_BAR_BORDER,
	hc: STATUS_BAR_BORDER,
}, localize('statusBarErrorBorder', 'Status bar border color separating to the sidebar and editor when something went wrong. The status bar is shown in the bottom of the window'));

const colorSet = {
	normal: [STATUS_BAR_NO_FOLDER_BACKGROUND, STATUS_BAR_NO_FOLDER_FOREGROUND, STATUS_BAR_NO_FOLDER_BORDER],
	empty: [STATUS_BAR_BACKGROUND, STATUS_BAR_FOREGROUND, STATUS_BAR_NO_FOLDER_BORDER],
	error: [STATUS_BAR_HAS_ERROR_BACKGROUND, STATUS_BAR_HAS_ERROR_FOREGROUND, STATUS_BAR_HAS_ERROR_BORDER],
};

export class StatusBarColorProvider extends Themable implements IWorkbenchContribution {
	private styleElement: HTMLStyleElement;

	constructor(
		@IThemeService themeService: IThemeService,
		@IDebugService private debugService: IDebugService,
		@IPackagesUpdateService private packagesUpdateService: IPackagesUpdateService,
		@IWorkspaceContextService private contextService: IWorkspaceContextService,
		@IPartService private partService: IPartService,
	) {
		super(themeService);

		this.registerListeners();
		this.updateStyles();
	}

	private registerListeners(): void {
		this._register(this.packagesUpdateService.onDidChangeState(state => this.updateStyles()));
		this._register(this.contextService.onDidChangeWorkbenchState(state => this.updateStyles()));
	}

	protected updateStyles(): void {
		debugger;
		if (isStatusbarInDebugMode(this.debugService)) {
			if (this.styleElement) {
				this.styleElement.innerHTML = '';
			}
			return;
		}

		super.updateStyles();

		const container = this.partService.getContainer(Parts.STATUSBAR_PART);
		let colors: string[];
		if (this.packagesUpdateService.hasError) {
			addClass(container, 'has-error');
			colors = colorSet.error;
		} else {
			removeClass(container, 'has-error');
			if (this.contextService.getWorkbenchState() === WorkbenchState.EMPTY) {
				colors = colorSet.empty;
			} else {
				colors = colorSet.normal;
			}
		}

		// Container Colors
		const backgroundColor = this.getColor(colors[0]);
		container.style.backgroundColor = backgroundColor;
		container.style.color = this.getColor(colors[1]);

		// Border Color
		const borderColor = this.getColor(colors[3]) || this.getColor(contrastBorder);
		container.style.borderTopWidth = borderColor ? '1px' : null;
		container.style.borderTopStyle = borderColor ? 'solid' : null;
		container.style.borderTopColor = borderColor;

		// Notification Beak
		if (!this.styleElement) {
			this.styleElement = createStyleSheet(container);
		}

		this.styleElement.innerHTML = `.monaco-workbench > .part.statusbar > .statusbar-item.has-beak:before { border-bottom-color: ${backgroundColor} !important; }`;
	}
}

Registry.as<IWorkbenchContributionsRegistry>(WorkbenchExtensions.Workbench).registerWorkbenchContribution(StatusBarColorProvider, LifecyclePhase.Running);

