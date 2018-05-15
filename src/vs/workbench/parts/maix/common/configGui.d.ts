declare interface ISettingsCategoryTree {
	id: string;
	category: string;
	settings?: string[];
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