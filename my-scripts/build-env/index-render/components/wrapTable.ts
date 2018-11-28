export function wrapTable(cls: string, ...elements: string[]) {
	let ret = `<table class="${cls} table">`;
	
	for (const body of elements) {
		ret += `<tbody>
	${body}
</tbody>
`;
	}
	return ret + '</table>';
}