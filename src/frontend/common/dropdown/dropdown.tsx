import { h, Component, ComponentChild } from 'https://unpkg.com/preact?module';
import { styles } from '../css/cssDecorator';

export interface DropdownState {
    value: string;
}

export interface Item {
    name: string;
    value: string;
}

export interface DropdownProps {
    items: Item[];
    onChange: (item: Item) => void;
}

styles('./common/dropdown/dropdown');
export class Dropdown extends Component<DropdownProps, DropdownState> {

    onChange(event: Event): void {
        this.setState({ value: (event.target as HTMLSelectElement).value });
        this.props.onChange(this.props.items.find(v => v.value === (event.target as HTMLSelectElement).value)!);
    };

    render(): ComponentChild {
        return (
            <select value={this.state.value} onChange={e => this.onChange(e)}>
                {this.props.items.map(v => <option value={v.value}>{v.name}</option>)}
            </select>
        );
    }
}
