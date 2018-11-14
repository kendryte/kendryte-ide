export function wrapTable(...elements: string[]) {
	let ret = '<table class="table">';
	
	for (const body of elements) {
		ret += `<tbody>
	${body}
</tbody>
`;
	}
	return ret + '</table>';
}