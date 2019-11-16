import { Component, ComponentChild } from '/preact';

export type ComponentClassConstructor<T> = new (...args: any[]) => T;

export interface ComponentClass<K, M> extends Component<K, M> {
    render(): ComponentChild;
}

function createElement(path: string): HTMLLinkElement {
    const link = document.createElement('link');
    link.href = path + '.css';
    link.rel = 'stylesheet';
    link.type = 'text/css';
    return link;
}

export function CSS(path: string) {
    const cssLink = createElement(path);
    let mountCount = 0;
    return function <K, M>(base: ComponentClassConstructor<ComponentClass<K, M>>): ComponentClassConstructor<ComponentClass<K, M>> {
        return class extends base {
            componentWillMount(): void {
                if (super.componentWillMount) {
                    super.componentWillMount();
                }
                mountCount++;
                if (!cssLink.parentElement) {
                    document.head.appendChild(cssLink);
                }
            }
            componentWillUnmount(): void {
                if (--mountCount === 0) {
                    cssLink.remove();
                }
                if (super.componentWillUnmount) {
                    super.componentWillUnmount();
                }
            }
        };
    }
}
