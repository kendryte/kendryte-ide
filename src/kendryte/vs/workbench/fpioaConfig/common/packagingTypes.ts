import { BaseAny } from 'kendryte/vs/workbench/fpioaConfig/common/baseAny';

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

/**
 * 功能定义，一开始就会被转换成 IFunc，没有别的作用
 */
export interface IFuncDefinition {
	funcBaseId: string;
	ios: IFuncPinDefinition[];
	description?: string;
}

/**
 * 功能引脚定义，一开始就会被转换成 IFuncPin，没有别的作用
 */
export interface IFuncPinDefinition {
	funcId: string;
	funcNumber: number;
	overwriteParentId?: string;
	description?: string;
}

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
	[pinLocation: string]: /* pinIO: */number;
}

export interface IOPinPlacementRevert {
	[pinIO: number]: /* pinLocation: */string;
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
}

export interface IChipGeneratorConfig {
	funcNamePrefix: string;
	setterFuncName: string;
	libraryName: string;
}

export type pickKeys = 'funcId' | 'funcNumber' | 'description';
export const pickKeys: pickKeys[] = ['funcId', 'funcNumber', 'description'];

export interface IFuncPin extends Pick<IFuncPinDefinition, pickKeys> {
	funcIdFull: string; // == parent.funcBaseId.toUpperCase() + '_' + this.funcId.toUpperCase()
	funcIdGen: string; // == parent.funcBaseId.toUpperCase() + '_' + this.funcId.toUpperCase()
}

/**
 * 功能定义
 */
export interface IFunc extends IFuncDefinition {
	ios: IFuncPin[];
}

/**
 * 功能引脚定义
 */
export interface IChipPackagingDefinition {
	name: string;
	geometry: IChipGeometry;
	usableFunctions: IFuncDefinition[];
	generator: IChipGeneratorConfig; // TODO
}

/**
 * 实际起作用的芯片定义
 */
export interface IChipPackagingCalculated extends IChipPackagingDefinition {
	pinCount: number;
	ROW: BaseAny;
	usableFunctions: IFunc[];
}