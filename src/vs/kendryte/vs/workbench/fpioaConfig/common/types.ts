import { Color } from 'vs/base/common/color';
import { IDisposable } from 'vs/base/common/lifecycle';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { IChipGeneratorConfig } from 'vs/kendryte/vs/workbench/fpioaConfig/common/packagingTypes';
import { IInputState } from 'vs/kendryte/vs/workbench/jsonGUIEditor/editor/browser/abstractJsonEditorInput';

export interface IPinFuncMap {
	[ioPinNum: string]: /* pinFuncID */ string;
}

export type IFuncIOMap = Map</*pinFuncID*/string, /*io*/number>;

export interface IFpioaInputState extends IInputState {

}

export interface PinFuncSetEvent {
	pin: string | undefined; // IPin
	func: string; // name of func
	triggerBy: 'pin' | 'func';
}

export interface PinFuncSetEventEmitter {
	(set: PinFuncSetEvent): void;
}

export interface IEachDisposable {
	forEach(callback: (item: IDisposable) => void): void;
}

export interface IEach<T> {
	forEach(callback: (item: T) => void): void;

	get(id: string): T;
}

export interface ColorMap {
	[p: string]: Color;
}

export interface ContextMenuData {
	pointer: { x: number; y: number; };
	pinName: string;
	ioNum?: number;
}

export const ID_NO_FUNCTION = null;

export interface IFpioaService {
	_serviceBrand: any;
}

export const IFpioaService = createDecorator<IFpioaService>('fpioaService');

export interface IGenerator {
	readonly filename: string;

	generate(config: IChipGeneratorConfig, funcPinMap: IFuncIOMap): string;
}

