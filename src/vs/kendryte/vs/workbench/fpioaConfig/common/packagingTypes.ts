import { BaseAny } from 'vs/kendryte/vs/workbench/fpioaConfig/common/baseAny';

export enum ChipPackageType {
	BGA = 1, // left top is 0
}

export type PIN_POWER = -1;
export type PIN_NC = -2;
export type PIN_SPECIAL = -3;

export const PIN_POWER: PIN_POWER = -1;
export const PIN_NC: PIN_NC = -2;
export const PIN_SPECIAL: PIN_SPECIAL = -3;

export type PIN_IO = number;
export type PinId = PIN_IO | PIN_NC | PIN_POWER;

export interface IPin2D {
	x: number;
	y: string | number;
}

export interface IPin2DNumber {
	x: number;
	y: number;
}

export type IPin = string | number | IPin2D;

export interface IPinRange {
	from: IPin;
	to: IPin;
}

export interface IOPinPlacement { // { A1: IO1, B2: IO2 ... }
	[pinLocation: string]: /* pinIO: */number | undefined;
}

export interface NotePinPlacement { // { A1: VCC, B2: VDD ... }
	[pinLocation: string]: /* name: */string;
}

export interface IOPinPlacementRevert {
	[pinIO: number]: /* pinLocation: */string | undefined;
}

export interface IChipGeometry {
	type: number; // ChipPackageType
	maxPin: {
		name: string;
		x: number;
		y: number;
	};
	emptyRange?: IPinRange[];
	missingRows: string; // I S O X Y
	IOPinPlacement: IOPinPlacement;
	NotePinPlacement: NotePinPlacement;
}

export interface IChipGeneratorConfig {
	funcNamePrefix: string;
	setterFuncName: string;
	libraryName: string;
}

export type pickKeys = 'funcId' | 'funcNumber' | 'description';
export const pickKeys: pickKeys[] = ['funcId', 'funcNumber', 'description'];

export interface IFuncPinDefinition {
	funcId: string;
	funcNumber: number;
	overwriteParentId?: string;
	description?: string;
}

export interface IFuncPin extends Pick<IFuncPinDefinition, pickKeys> {
	funcIdFull: string; // == parent.funcBaseId.toUpperCase() + '_' + this.funcId.toUpperCase()
	funcIdGen: string; // == parent.funcBaseId.toUpperCase() + '_' + this.funcId.toUpperCase()
}

export interface IChipInterface<T extends FunctionLabelMap> {
	id: string;
	title: string;
	functions: Partial<Record<keyof T, string>>;
}

export interface IChipInterfaceClass<T extends FunctionLabelMap> {
	id: string;
	title: string;
	devices: (IChipInterface<T> | IChipInterfaceClass<T>)[];
}

export interface FunctionLabelMap {
	[funcConstDefine: string]: /* comment (function title)*/ string;
}

/**
 * 功能引脚定义
 */
export interface IChipPackagingDefinition<T extends FunctionLabelMap> {
	name: string;
	geometry: IChipGeometry;
	generator: IChipGeneratorConfig; // TODO
	interfaceList: (IChipInterface<T> | IChipInterfaceClass<T>)[];
}

/**
 * 实际起作用的芯片定义
 */
export interface IChipPackagingCalculated extends IChipPackagingDefinition<FunctionLabelMap> {
	pinCount: number;
	ROW: BaseAny;
}
