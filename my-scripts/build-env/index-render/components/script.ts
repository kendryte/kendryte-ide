/// <reference lib="dom"/>
(() => {
	if (navigator.language.toLowerCase().includes('zh')) {
		document.body.classList.remove('en');
		document.body.classList.add('cn');
	}
})();
(() => {
	const container = document.getElementById('platformContainer');
	let current;
	if (navigator.platform === 'MacIntel') {
		current = container.querySelector('#colMac');
	} else if (navigator.platform.startsWith('Linux x86_64')) {
		current = container.querySelector('#colLinux');
	} else if (navigator.platform.startsWith('Win') && navigator.userAgent.includes('x64')) {
		current = container.querySelector('#colWindows');
	} else {
		document.getElementById('notSupport').classList.remove('d-none');
		return;
	}
	current.classList.replace('col-md', 'active');
	container.parentNode.insertBefore(current, container);
	
	document.querySelectorAll('.col-md').forEach((item) => {
		item.classList.remove('col-md');
		item.classList.add('col-md-6');
	});
	
	current.querySelector('.card').classList.add('border-primary');
	current.querySelector('.card-title').classList.add('text-primary');
	
	const fastDown = document.getElementById('fastDown');
	fastDown.classList.remove('d-hide');
	
	function getA(parent: ParentNode, select: string): HTMLAnchorElement {
		return parent.querySelector(select) || {} as any;
	}
	
	const am = getA(fastDown, 'a.main');
	const ad = getA(current, '.application a');
	if (ad.href) {
		am.href = ad.href;
		am.innerText += current.querySelector('.card-title').innerText.trim();
	} else {
		console.log('main not ready');
		const aa = getA(current, '.packages a');
		aa.classList.add('invalid');
		aa.removeAttribute('href');
	}
	
	const ap = getA(fastDown, 'a.pkg');
	if (ap.href) {
		ap.href = getA(current, '.packages a').href || '';
	} else {
		console.log('offline package not ready');
		const aa = getA(current, '.packages a');
		aa.classList.add('invalid');
		aa.removeAttribute('href');
	}
})();
(() => {
	for (const item of document.querySelectorAll('.date') as any) {
		item.innerText = new Date(Date.parse(item.innerText.trim())).toLocaleString();
	}
})();
