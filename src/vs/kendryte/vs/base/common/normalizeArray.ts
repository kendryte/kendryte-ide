export function normalizeArray<T>(input: any): T[] {
	if (input && Array.isArray(input)) {
		return input;
	} else {
		return [];
	}
}