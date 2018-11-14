/// <reference lib="dom"/>
(() => {
	if (navigator.language.toLowerCase().includes('zh')) {
		document.body.classList.remove('en');
		document.body.classList.add('cn');
	}
})();
(() => {
	let current;
	if (navigator.platform === 'MacIntel') {
		current = document.getElementById('colMac');
	} else if (navigator.platform.startsWith('Linux x86_64')) {
		current = document.getElementById('colLinux');
	} else if (navigator.platform.startsWith('Win') && navigator.userAgent.includes('x64')) {
		current = document.getElementById('colWindows');
	} else {
		document.getElementById('notSupport').classList.remove('d-none');
		return;
	}
	current.classList.add('active', 'col-sm-5');
	current.querySelector('.card').classList.add('border-primary');
	current.querySelector('.card-title').classList.add('text-primary');
	
	const fastDown = document.getElementById('fastDown');
	fastDown.classList.remove('d-hide');
	
	function getA(parent: ParentNode, select: string): HTMLAnchorElement {
		return parent.querySelector(select);
	}
	
	const am = getA(fastDown, 'a.main');
	const ad = getA(current, '.application a');
	am.href = ad.href;
	am.innerText += current.querySelector('.card-title').innerText.trim();
	
	const ap = getA(fastDown, 'a.pkg');
	ap.href = getA(current, '.packages a').href;
})();