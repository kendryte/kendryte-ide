import { RawContextKey } from 'vs/platform/contextkey/common/contextkey';

export const CONTEXT_JSON_GUI_EDITOR = new RawContextKey<boolean>('inJsonGuiEditor', false);
export const CONTEXT_JSON_GUI_EDITOR_JSON_MODE = new RawContextKey<boolean>('inJsonGuiEditorJson', false);
