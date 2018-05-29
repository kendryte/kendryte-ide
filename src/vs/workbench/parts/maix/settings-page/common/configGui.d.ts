declare interface ISpecialView {
	readonly element: HTMLElement;
}

declare interface INormalSetting {
	type: 0;
	settings: string[];
	categoryId: string;
}

declare interface ISpecialSetting {
	type: 1;
	special: ISpecialSetting;
	categoryId: string;
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
