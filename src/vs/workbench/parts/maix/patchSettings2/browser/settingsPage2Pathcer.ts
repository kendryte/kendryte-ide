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

PatchClassMethodFunction(SettingsEditor2, createHeader);
PatchClassMethodFunction(SettingsEditor2, createFeedbackButton);

function PatchClassMethodFunction<T extends Function>(Class: any, wrapper: (original: T) => T) {
	const name = wrapper['name'];
	if (!name) {
		throw new TypeError('function must have name.');
	}
	const original = Class.prototype[name];
	if (!original) {
		throw new TypeError('function ' + name + ' is not found in original class.');
	}

	Class.prototype[name] = wrapper(original);
}
