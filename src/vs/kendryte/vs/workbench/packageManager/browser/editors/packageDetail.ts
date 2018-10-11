import { BaseEditor } from 'vs/workbench/browser/parts/editor/baseEditor';
import { Dimension } from 'vs/base/browser/dom';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';

export class PackageDetailEditor extends BaseEditor {
	static readonly ID: string = 'workbench.editor.package';

	constructor(
		@ITelemetryService telemetryService: ITelemetryService,
		@IThemeService protected themeService: IThemeService,
	) {
		super(PackageDetailEditor.ID, telemetryService, themeService);
	}

	protected createEditor(parent: HTMLElement): void {
		parent.innerText = 'BODY';
	}

	public layout(dimension: Dimension): void {
	}
}