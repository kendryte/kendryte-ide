export function timing() {
	const date = new Date;
	
	return function () {
		const t = (Date.now() - date.getTime()) / 1000;
		return ` (in ${t.toFixed(2)} sec)`;
	};
}

export function timeout(ms: number): Promise<void> {
	return new Promise((resolve, reject) => {
		setTimeout(resolve, ms);
	});
}