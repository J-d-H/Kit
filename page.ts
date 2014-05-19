function clearElement(element: HTMLElement) {
	while (element.lastChild) {
		element.removeChild(element.lastChild);
	}
}

export function clear() {
	clearElement(window.document.getElementById("content"));
}
