declare interface ISpecialView {
	readonly element: HTMLElement;
}

declare interface ISpecialSetting {
	new (...args: any[]): ISpecialView;
}

declare interface ISettingsCategoryTree {
	id: string;
	category: string;
	settings?: string[];
	special?: ISpecialSetting;
	parent?: ISettingsCategoryTree;
	children?: ISettingsCategoryTree[];
}

declare interface ISettingsGuiDefine {
	id: string;
	category: {
		id: string;
		lavel: string;
	};

}