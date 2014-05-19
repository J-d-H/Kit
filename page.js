function clearElement(element) {
    while (element.lastChild) {
        element.removeChild(element.lastChild);
    }
}

function clear() {
    clearElement(window.document.getElementById("content"));
}
exports.clear = clear;
//# sourceMappingURL=Kit/../page.js.map
