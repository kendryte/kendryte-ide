export interface IFuncPinMap {
	[pinFuncID: string]: /* ioPinNum */ string;
}

export type IFuncIOMap = Map</*pinFuncID*/string, /*io*/number>;

export interface ISavedJson {
	selectedChip: string;
	funcPinMap: IFuncPinMap;
}