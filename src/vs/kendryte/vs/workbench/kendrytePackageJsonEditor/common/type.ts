export interface IUISectionWidget<T, TG = any> {
	get(): TG;
	set(val: T): void;
}

export interface IUISection<T> {
	title: string;
	sectionControl: HTMLDivElement;
	section: HTMLDivElement;
	widget: IUISectionWidget<T>;
}