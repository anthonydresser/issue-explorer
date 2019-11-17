import { h, Component, ComponentChild } from 'https://unpkg.com/preact?module';
import { styles } from '../css/cssDecorator';

export interface CheckboxState {
    checked: boolean;
}

export interface CheckboxProps {
    checked?: boolean;
    name?: string;
    onChange: (checked: boolean) => void;
}

styles('./common/checkbox/checkbox');
export class Checkbox extends Component<CheckboxProps, CheckboxState> {
    constructor(props: CheckboxProps) {
        super(props);
        this.state = {
            checked: !!props.checked
        }
    }

    onChange(event: Event): void {
        this.setState({ checked: Boolean((event.target as HTMLInputElement).checked) });
        this.props.onChange((event.target as HTMLInputElement).checked);
    };

    render(): ComponentChild {
        return (
            <span><input type="checkbox" onChange={e => this.onChange(e)} checked={this.state.checked} /> {this.props.name} </span>
        );
    }
}
