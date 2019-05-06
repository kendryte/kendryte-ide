import { RawContextKey } from 'vs/platform/contextkey/common/contextkey';

export namespace JsonEditorExtensions {
	export const CustomJson = 'workbench.registry.kenderyte.json';
}

export const JsonEditorFocusContext = new RawContextKey<boolean>('kendryteJsonEditorFocus', false);
export const JsonEditorFocusIdContext = new RawContextKey<string>('kendryteJsonEditorFocusId', '');
