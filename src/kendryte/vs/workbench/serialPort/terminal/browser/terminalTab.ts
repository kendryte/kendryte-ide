/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import {
	Direction,
	ISerialLaunchConfig,
	ISerialMonitorService,
	ISerialPortInstance,
	ISerialPortTab,
	ITerminalConfigHelper,
} from 'kendryte/vs/workbench/serialPort/terminal/common/terminal';
import { IContextKey } from 'vs/platform/contextkey/common/contextkey';
import { anyEvent, Emitter, Event } from 'vs/base/common/event';
import { Disposable, IDisposable } from 'vs/base/common/lifecycle';
import { IView, Orientation, Sizing, SplitView } from 'vs/base/browser/ui/splitview/splitview';
import { IPartService, Position } from 'vs/workbench/services/part/common/partService';

const SPLIT_PANE_MIN_SIZE = 120;

class SplitPaneContainer {
	private _height: number;
	private _width: number;
	private _splitView: SplitView;
	private _splitViewDisposables: IDisposable[];
	private _children: SplitPane[] = [];

	private _onDidChange: Event<number | undefined> = Event.None;
	public get onDidChange(): Event<number | undefined> { return this._onDidChange; }

	constructor(
		private _container: HTMLElement,
		public orientation: Orientation,
	) {
		this._width = this._container.offsetWidth;
		this._height = this._container.offsetHeight;
		this._createSplitView();
		this._splitView.layout(this.orientation === Orientation.HORIZONTAL ? this._width : this._height);
	}

	private _createSplitView(): void {
		this._splitView = new SplitView(this._container, { orientation: this.orientation });
		this._splitViewDisposables = [];
		this._splitViewDisposables.push(this._splitView.onDidSashReset(() => this._splitView.distributeViewSizes()));
	}

	public split(instance: ISerialPortInstance, index: number = this._children.length): void {
		this._addChild(instance, index);
	}

	public resizePane(index: number, direction: Direction, amount: number): void {
		// TODO: Should resize pane up/down resize the panel?

		// Only resize the correct dimension
		const isHorizontal = direction === Direction.Left || direction === Direction.Right;
		if (isHorizontal && this.orientation !== Orientation.HORIZONTAL ||
			!isHorizontal && this.orientation !== Orientation.VERTICAL) {
			return;
		}

		// Only resize when there is mor ethan one pane
		if (this._children.length <= 1) {
			return;
		}

		// Get sizes
		const sizes = [];
		for (let i = 0; i < this._splitView.length; i++) {
			sizes.push(this._splitView.getViewSize(i));
		}

		// Remove size from right pane, unless index is the last pane in which case use left pane
		const isSizingEndPane = index !== this._children.length - 1;
		const indexToChange = isSizingEndPane ? index + 1 : index - 1;
		if (isSizingEndPane && direction === Direction.Left) {
			amount *= -1;
		} else if (!isSizingEndPane && direction === Direction.Right) {
			amount *= -1;
		} else if (isSizingEndPane && direction === Direction.Up) {
			amount *= -1;
		} else if (!isSizingEndPane && direction === Direction.Down) {
			amount *= -1;
		}

		// Ensure the size is not reduced beyond the minimum, otherwise weird things can happen
		if (sizes[index] + amount < SPLIT_PANE_MIN_SIZE) {
			amount = SPLIT_PANE_MIN_SIZE - sizes[index];
		} else if (sizes[indexToChange] - amount < SPLIT_PANE_MIN_SIZE) {
			amount = sizes[indexToChange] - SPLIT_PANE_MIN_SIZE;
		}

		// Apply the size change
		sizes[index] += amount;
		sizes[indexToChange] -= amount;
		for (let i = 0; i < this._splitView.length - 1; i++) {
			this._splitView.resizeView(i, sizes[i]);
		}
	}

	private _addChild(instance: ISerialPortInstance, index: number): void {
		const child = new SplitPane(instance, this.orientation === Orientation.HORIZONTAL ? this._height : this._width);
		child.orientation = this.orientation;
		if (typeof index === 'number') {
			this._children.splice(index, 0, child);
		} else {
			this._children.push(child);
		}

		this._withDisabledLayout(() => this._splitView.addView(child, Sizing.Distribute, index));

		this._onDidChange = anyEvent(...this._children.map(c => c.onDidChange));
	}

	public remove(instance: ISerialPortInstance): void {
		let index = null;
		for (let i = 0; i < this._children.length; i++) {
			if (this._children[i].instance === instance) {
				index = i;
			}
		}
		if (index !== null) {
			this._children.splice(index, 1);
			this._splitView.removeView(index, Sizing.Distribute);
		}
	}

	public layout(width: number, height: number): void {
		this._width = width;
		this._height = height;
		if (this.orientation === Orientation.HORIZONTAL) {
			this._children.forEach(c => c.orthogonalLayout(height));
			this._splitView.layout(width);
		} else {
			this._children.forEach(c => c.orthogonalLayout(width));
			this._splitView.layout(height);
		}
	}

	public setOrientation(orientation: Orientation): void {
		if (this.orientation === orientation) {
			return;
		}
		this.orientation = orientation;

		// Remove old split view
		while (this._container.children.length > 0) {
			this._container.removeChild(this._container.children[0]);
		}
		this._splitViewDisposables.forEach(d => d.dispose());
		this._splitViewDisposables = [];
		this._splitView.dispose();

		// Create new split view with updated orientation
		this._createSplitView();
		this._withDisabledLayout(() => {
			this._children.forEach(child => {
				child.orientation = orientation;
				this._splitView.addView(child, 1);
			});
		});
	}

	private _withDisabledLayout(innerFunction: () => void): void {
		// Whenever manipulating views that are going to be changed immediately, disabling
		// layout/resize events in the terminal prevent bad dimensions going to the pty.
		this._children.forEach(c => c.instance.disableLayout = true);
		innerFunction();
		this._children.forEach(c => c.instance.disableLayout = false);
	}
}

class SplitPane implements IView {
	public minimumSize: number = SPLIT_PANE_MIN_SIZE;
	public maximumSize: number = Number.MAX_VALUE;

	public orientation: Orientation | undefined;
	protected _size: number;

	private _onDidChange: Event<number | undefined> = Event.None;
	public get onDidChange(): Event<number | undefined> { return this._onDidChange; }

	readonly element: HTMLElement;

	constructor(
		readonly instance: ISerialPortInstance,
		public orthogonalSize: number,
	) {
		this.element = document.createElement('div');
		this.element.className = 'terminal-split-pane';
		this.instance.attachToElement(this.element);
	}

	public layout(size: number): void {
		// Only layout when both sizes are known
		this._size = size;
		if (!this._size || !this.orthogonalSize) {
			return;
		}

		if (this.orientation === Orientation.VERTICAL) {
			this.instance.layout({ width: this.orthogonalSize, height: this._size });
		} else {
			this.instance.layout({ width: this._size, height: this.orthogonalSize });
		}
	}

	public orthogonalLayout(size: number): void {
		this.orthogonalSize = size;
	}
}

export class TerminalTab extends Disposable implements ISerialPortTab {
	private _terminalInstance: ISerialPortInstance;
	private _splitPaneContainer: SplitPaneContainer | undefined;
	private _tabElement: HTMLElement;
	private _panelPosition: Position = Position.BOTTOM;
	public readonly id: string;

	/** @deprecated */
	public get terminalInstances(): ISerialPortInstance[] { return [this._terminalInstance]; }

	private readonly _onDisposed: Emitter<ISerialPortTab>;
	public get onDisposed(): Event<ISerialPortTab> { return this._onDisposed.event; }

	private readonly _onInstancesChanged: Emitter<void>;
	public get onInstancesChanged(): Event<void> { return this._onInstancesChanged.event; }

	constructor(
		terminalFocusContextKey: IContextKey<boolean>,
		configHelper: ITerminalConfigHelper,
		private _container: HTMLElement,
		shellLaunchConfig: ISerialLaunchConfig,
		@ISerialMonitorService private readonly _terminalService: ISerialMonitorService,
		@IPartService private readonly _partService: IPartService,
	) {
		super();
		this._onDisposed = new Emitter<ISerialPortTab>();
		this._onInstancesChanged = new Emitter<void>();

		const instance = this._terminalService.createInstance(
			terminalFocusContextKey,
			configHelper,
			undefined,
			shellLaunchConfig,
			true,
		);
		this._terminalInstance = instance;
		this._initInstanceListeners(instance);

		if (this._container) {
			this.attachToElement(this._container);
		}

		this.id = shellLaunchConfig.serialDevice;
	}

	public dispose(): void {
		super.dispose();
		if (this._tabElement) {
			this._container.removeChild(this._tabElement);
			this._tabElement = null;
		}
		this._terminalInstance = null;
		this._onInstancesChanged.fire();
	}

	public get activeInstance(): ISerialPortInstance {
		if (!this._terminalInstance) {
			return null;
		}
		return this._terminalInstance;
	}

	private _initInstanceListeners(instance: ISerialPortInstance): void {
		instance.addDisposable(instance.onDisposed(instance => this._onInstanceDisposed(instance)));
		instance.addDisposable(instance.onFocused(instance => this._setActiveInstance(instance)));
	}

	private _onInstanceDisposed(instance: ISerialPortInstance): void {
		// Get the index of the instance and remove it from the list
		const isMe = this._terminalInstance === instance;
		if (isMe) {
			this._terminalInstance = null;
		}

		// Remove the instance from the split pane if it has been created
		if (this._splitPaneContainer) {
			this._splitPaneContainer.remove(instance);
		}

		// Fire events and dispose tab if it was the last instance
		this._onInstancesChanged.fire();
		this._onDisposed.fire(this);
		this.dispose();
	}

	public setActiveInstanceByIndex(index: number): void {
		this._onInstancesChanged.fire();
	}

	public attachToElement(element: HTMLElement): void {
		this._container = element;
		this._tabElement = document.createElement('div');
		this._tabElement.classList.add('terminal-tab');
		this._container.appendChild(this._tabElement);
		if (!this._splitPaneContainer) {
			this._panelPosition = this._partService.getPanelPosition();
			const orientation = this._panelPosition === Position.BOTTOM ? Orientation.HORIZONTAL : Orientation.VERTICAL;
			this._splitPaneContainer = new SplitPaneContainer(this._tabElement, orientation);
			this._splitPaneContainer.split(this._terminalInstance);
		}
	}

	public get title(): string {
		return this._terminalInstance.title;
	}

	public setVisible(visible: boolean): void {
		if (this._tabElement) {
			this._tabElement.style.display = visible ? '' : 'none';
		}
		this._terminalInstance.setVisible(visible);
	}

	public split(
		terminalFocusContextKey: IContextKey<boolean>,
		configHelper: ITerminalConfigHelper,
		shellLaunchConfig: ISerialLaunchConfig,
	): ISerialPortInstance {
		return null;
	}

	public addDisposable(disposable: IDisposable): void {
		this._register(disposable);
	}

	public layout(width: number, height: number): void {
		if (this._splitPaneContainer) {
			// Check if the panel position changed and rotate panes if so
			const newPanelPosition = this._partService.getPanelPosition();
			const panelPositionChanged = newPanelPosition !== this._panelPosition;
			if (panelPositionChanged) {
				const newOrientation = newPanelPosition === Position.BOTTOM ? Orientation.HORIZONTAL : Orientation.VERTICAL;
				this._splitPaneContainer.setOrientation(newOrientation);
				this._panelPosition = newPanelPosition;
			}

			this._splitPaneContainer.layout(width, height);
		}
	}

	public focusPreviousPane(): void {
	}

	public focusNextPane(): void {
	}

	public resizePane(direction: Direction): void {
		if (!this._splitPaneContainer) {
			return;
		}

		const isHorizontal = (direction === Direction.Left || direction === Direction.Right);
		const font = this._terminalService.configHelper.getFont();
		// TODO: Support letter spacing and line height
		const amount = isHorizontal ? font.charWidth : font.charHeight;
		if (amount) {
			this._splitPaneContainer.resizePane(0, direction, amount);
		}
	}

	private _setActiveInstance(instance: ISerialPortInstance) {
	}
}
