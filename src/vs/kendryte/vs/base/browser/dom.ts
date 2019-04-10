export function querySelector(parent: HTMLElement, selector: string): HTMLElement;
export function querySelector(selector: string): HTMLElement;
export function querySelector(parent: HTMLElement | string, selector?: string): HTMLElement {
	if (arguments.length === 1) {
		selector = parent as string;
		parent = document.body;
	}

	const child = (parent as HTMLElement).querySelector(selector as string);
	if (child) {
		return child as HTMLElement;
	} else {
		throw new Error(`Cannot find "${selector}" element.`);
	}
}