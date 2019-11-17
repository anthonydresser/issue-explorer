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
    groups: Array<Array<string>>;
}

styles('./labelList/labelList');
export class LabelList extends Component<LabelListProps, LabelListState> {
    constructor(props: LabelListProps) {
        super(props);
        this.state = {
            groups: []
        }
    }
    render(): ComponentChild {
        return (
            <div>
                <div class="label-list">{this.props.labels.map(l => (<span class="label" style={{ 'background-color': '#' + l.color }}>{l.name}</span>))}</div>
                {this.state.groups}
            </div>
        );
    }
}
