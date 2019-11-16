import { h, Component, ComponentChild } from '/preact';
import { CSS } from '../css/cssDecorator';

export interface DropdownState {

}

export interface DropdownProps {
    items: { name: string, value: string }[];
}

@CSS('./common/dropdown/dropdown')
export class Dropdown extends Component<DropdownProps, DropdownState> {

    render(): ComponentChild {
        return (
            <select>
                {this.props.items.map(v => <option value={v.value}>{v.name}</option>)}
            </select>
        );
    }
}
