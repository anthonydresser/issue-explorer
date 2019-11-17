function createElement(path: string): HTMLLinkElement {
    const link = document.createElement('link');
    link.href = path + '.css';
    link.rel = 'stylesheet';
    link.type = 'text/css';
    return link;
}

export function styles(path: string) {
    const cssLink = createElement(path);
    document.head.appendChild(cssLink);
}
