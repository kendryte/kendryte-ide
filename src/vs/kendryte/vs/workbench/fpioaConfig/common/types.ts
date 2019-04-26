import { Color } from 'vs/base/common/color';
import { IDisposable } from 'vs/base/common/lifecycle';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { URI } from 'vs/base/common/uri';
import { IEditorOptions, ITextEditorOptions } from 'vs/platform/editor/common/editor';
import { IEditorGroup } from 'vs/workbench/services/editor/common/editorGroupsService';

export interface IFuncPinMap {
	[pinFuncID: string]: /* ioPinNum */ string;
}

export interface IPinFuncMap {
	[ioPinNum: string]: /* pinFuncID */ string;
}

export type IFuncIOMap = Map</*pinFuncID*/string, /*io*/number>;

export interface ISavedJson {
	selectedChip?: string;
	funcPinMap: IFuncPinMap;
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
	currentFunctionId: string | null;
}

export const ID_NO_FUNCTION = null;

export interface IFpioaService {
	_serviceBrand: any;

	openEditor(resource: URI, options: IEditorOptions | ITextEditorOptions | undefined, group: IEditorGroup): any;
}

export const IFpioaService = createDecorator<IFpioaService>('fpioaService');
