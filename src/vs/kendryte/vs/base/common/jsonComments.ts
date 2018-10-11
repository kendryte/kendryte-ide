import * as json from 'vs/base/common/json';

export function parseExtendedJson<T>(content: string, debugTitle?: string): [T, json.ParseError[]] {
	let raw: any = {};
	let currentProperty: string = null;
	let currentParent: any = [];
	let previousParents: any[] = [];
	let parseErrors: json.ParseError[] = [];

	function onValue(value: any) {
		if (Array.isArray(currentParent)) {
			(<any[]>currentParent).push(value);
		} else if (currentProperty) {
			currentParent[currentProperty] = value;
		}
	}

	let visitor: json.JSONVisitor = {
		onObjectBegin: () => {
			let object = {};
			onValue(object);
			previousParents.push(currentParent);
			currentParent = object;
			currentProperty = null;
		},
		onObjectProperty: (name: string) => {
			currentProperty = name;
		},
		onObjectEnd: () => {
			currentParent = previousParents.pop();
		},
		onArrayBegin: () => {
			let array: any[] = [];
			onValue(array);
			previousParents.push(currentParent);
			currentParent = array;
			currentProperty = null;
		},
		onArrayEnd: () => {
			currentParent = previousParents.pop();
		},
		onLiteralValue: onValue,
		onError: (error: json.ParseErrorCode) => {
			parseErrors.push({ error: error });
		},
	};
	if (content) {
		try {
			json.visit(content, visitor);
			raw = currentParent[0] || {};
		} catch (e) {
			console.error(`Error while parsing json ${debugTitle}: ${e}`);
			parseErrors = [e];
		}
	}

	return [raw, parseErrors];
}