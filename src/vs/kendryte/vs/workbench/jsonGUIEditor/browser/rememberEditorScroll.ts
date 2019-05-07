import { IEditorModel } from 'vs/platform/editor/common/editor';

const scrollSymbol = Symbol('scrollTop');

export function rememberEditorScroll(model: IEditorModel, value: number) {
	model[scrollSymbol] = value;
}

export function restoreEditorScroll(model: IEditorModel) {
	return model[scrollSymbol] || 0;
}
