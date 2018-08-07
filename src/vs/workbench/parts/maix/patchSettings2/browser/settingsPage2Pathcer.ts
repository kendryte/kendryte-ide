import { SettingsEditor2 } from 'vs/workbench/parts/preferences/browser/settingsEditor2';

function createHeader(original) {
	return function (this: SettingsEditor2, parent: HTMLElement) {
		original.call(this, parent);
		const preview = parent.querySelector('.settings-preview-header');
		if (preview) {
			preview.remove();
		}
	};
}

function createFeedbackButton(original) {
	return function (this: SettingsEditor2, parent: HTMLElement) {
	};
}

PatchClassMethodFunction(SettingsEditor2, 'createHeader', createHeader);
PatchClassMethodFunction(SettingsEditor2, 'createFeedbackButton', createFeedbackButton);

function PatchClassMethodFunction<T extends Function>(Class: any, wrapperName: string, wrapper: (original: T) => T) {
	const original = Class.prototype[wrapperName];
	if (!original) {
		throw new TypeError('function ' + wrapperName + ' is not found in original class.');
	}

	Class.prototype[wrapperName] = wrapper(original);
}
