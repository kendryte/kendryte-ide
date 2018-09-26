/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { EDITOR_FONT_DEFAULTS, IEditorOptions } from 'vs/editor/common/config/editorOptions';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import {
	DEFAULT_LETTER_SPACING,
	DEFAULT_LINE_HEIGHT,
	ITerminalConfigHelper,
	ITerminalConfiguration,
	ITerminalFont,
	MINIMUM_LETTER_SPACING,
	TERMINAL_CONFIG_SECTION,
} from 'vs/kendryte/vs/workbench/serialPort/terminal/common/terminal';
import { isFedora } from 'vs/kendryte/vs/workbench/serialPort/terminal/node/terminal';
import { Terminal as XTermTerminal } from 'vscode-xterm';

const MINIMUM_FONT_SIZE = 6;
const MAXIMUM_FONT_SIZE = 25;

/**
 * Encapsulates terminal configuration logic, the primary purpose of this file is so that platform
 * specific test cases can be written.
 */
export class TerminalConfigHelper implements ITerminalConfigHelper {
	public panelContainer: HTMLElement;

	private _charMeasureElement: HTMLElement;
	private _lastFontMeasurement: ITerminalFont;
	public config: ITerminalConfiguration;

	public constructor(
		@IConfigurationService private readonly _configurationService: IConfigurationService,
	) {
		this._updateConfig();
		this._configurationService.onDidChangeConfiguration(e => {
			if (e.affectsConfiguration(TERMINAL_CONFIG_SECTION)) {
				this._updateConfig();
			}
		});
	}

	private _updateConfig(): void {
		this.config = this._configurationService.getValue<ITerminalConfiguration>(TERMINAL_CONFIG_SECTION);
	}

	public configFontIsMonospace(): boolean {
		this._createCharMeasureElementIfNecessary();
		const fontSize = 15;
		const fontFamily = this.config.fontFamily || this._configurationService.getValue<IEditorOptions>('editor').fontFamily;
		const i_rect = this._getBoundingRectFor('i', fontFamily, fontSize);
		const w_rect = this._getBoundingRectFor('w', fontFamily, fontSize);

		const invalidBounds = !i_rect.width || !w_rect.width;
		if (invalidBounds) {
			// There is no reason to believe the font is not Monospace.
			return true;
		}

		return i_rect.width === w_rect.width;
	}

	private _createCharMeasureElementIfNecessary() {
		// Create charMeasureElement if it hasn't been created or if it was orphaned by its parent
		if (!this._charMeasureElement || !this._charMeasureElement.parentElement) {
			this._charMeasureElement = document.createElement('div');
			this.panelContainer.appendChild(this._charMeasureElement);
		}
	}

	private _getBoundingRectFor(char: string, fontFamily: string, fontSize: number): ClientRect | DOMRect {
		const style = this._charMeasureElement.style;
		style.display = 'inline-block';
		style.fontFamily = fontFamily;
		style.fontSize = fontSize + 'px';
		style.lineHeight = 'normal';
		this._charMeasureElement.innerText = char;
		const rect = this._charMeasureElement.getBoundingClientRect();
		style.display = 'none';

		return rect;
	}

	private _measureFont(fontFamily: string, fontSize: number, letterSpacing: number, lineHeight: number): ITerminalFont {
		this._createCharMeasureElementIfNecessary();

		const rect = this._getBoundingRectFor('X', fontFamily, fontSize);

		// Bounding client rect was invalid, use last font measurement if available.
		if (this._lastFontMeasurement && !rect.width && !rect.height) {
			return this._lastFontMeasurement;
		}

		this._lastFontMeasurement = {
			fontFamily,
			fontSize,
			letterSpacing,
			lineHeight,
			charWidth: rect.width,
			charHeight: Math.ceil(rect.height),
		};
		return this._lastFontMeasurement;
	}

	/**
	 * Gets the font information based on the terminal.integrated.fontFamily
	 * terminal.integrated.fontSize, terminal.integrated.lineHeight configuration properties
	 */
	public getFont(xterm?: XTermTerminal, excludeDimensions?: boolean): ITerminalFont {
		const editorConfig = this._configurationService.getValue<IEditorOptions>('editor');

		let fontFamily = this.config.fontFamily || editorConfig.fontFamily;

		// Work around bad font on Fedora
		if (!this.config.fontFamily) {
			if (isFedora) {
				fontFamily = '\'DejaVu Sans Mono\'';
			}
		}

		const fontSize = this._toInteger(this.config.fontSize, MINIMUM_FONT_SIZE, MAXIMUM_FONT_SIZE, EDITOR_FONT_DEFAULTS.fontSize);
		const letterSpacing = this.config.letterSpacing ? Math.max(Math.floor(this.config.letterSpacing), MINIMUM_LETTER_SPACING) : DEFAULT_LETTER_SPACING;
		const lineHeight = this.config.lineHeight ? Math.max(this.config.lineHeight, 1) : DEFAULT_LINE_HEIGHT;

		if (excludeDimensions) {
			return {
				fontFamily,
				fontSize,
				letterSpacing,
				lineHeight,
			};
		}

		// Get the character dimensions from xterm if it's available
		if (xterm) {
			if (xterm._core.charMeasure && xterm._core.charMeasure.width && xterm._core.charMeasure.height) {
				return {
					fontFamily,
					fontSize,
					letterSpacing,
					lineHeight,
					charHeight: xterm._core.charMeasure.height,
					charWidth: xterm._core.charMeasure.width,
				};
			}
		}

		// Fall back to measuring the font ourselves
		return this._measureFont(fontFamily, fontSize, letterSpacing, lineHeight);
	}

	private _toInteger(source: any, minimum: number, maximum: number, fallback: number): number {
		let r = parseInt(source, 10);
		if (isNaN(r)) {
			return fallback;
		}
		if (typeof minimum === 'number') {
			r = Math.max(minimum, r);
		}
		if (typeof maximum === 'number') {
			r = Math.min(maximum, r);
		}
		return r;
	}
}
