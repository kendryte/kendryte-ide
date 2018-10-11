export function objectPath(obj: any, path: string): any;
export function objectPath(obj: any, path: string, value: any): void;

export function objectPath(obj: any, path: string, value?: any): any {
	if (typeof obj !== 'object' || !obj) {
		throw new TypeError('first argument must be valid object');
	}
	let pathArr = path.split('.');
	let name: string;
	if (arguments.length === 3) {
		if (!path) {
			throw new Error('path cannot be empty when set value');
		}
		const lastName = pathArr.pop();
		while (pathArr.length > 0) {
			name = pathArr.shift();

			if (obj.hasOwnProperty(name)) {
				if (typeof obj[name] === 'object' && obj[name]) {
					obj = obj[name];
				} else {
					throw new TypeError(`Cannot set property ${name} on ${path.replace(pathArr.join('.'), '')}`);
				}
			} else {
				obj = obj[name] = {};
			}
		}
		obj[lastName] = value;
	} else {
		while (pathArr.length > 0) {
			name = pathArr.shift();
			obj = obj[name];
			if (obj === undefined) {
				return;
			}
			if (obj === null && pathArr.length > 0) {
				return;
			}
		}
		return obj;
	}
}
