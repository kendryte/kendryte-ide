export function promiseToBool(p: Promise<any>): Promise<any> {
	return p.then(() => true, () => false);
}