import { h, Component, ComponentChild } from 'https://unpkg.com/preact?module';
import { styles } from '../common/css/cssDecorator';


export interface Label {
    name: string;
    color: string;
}

export interface LabelListProps {
    labels: Label[];
}

export interface LabelListState {
    repos: Array<{ name: string, value: string }>;
}

styles('./labelList/labelList');
export class LabelList extends Component<LabelListProps, LabelListState> {
    render(): ComponentChild {
        return (
            <div class="label-list">{this.props.labels.map(l => (<span class="label" style={{ 'background-color': '#' + l.color }}>{l.name}</span>))}</div>
        );
    }
}
