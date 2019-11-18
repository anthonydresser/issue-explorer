import { h, Component, ComponentChild } from 'https://unpkg.com/preact?module';
import { styles } from '../common/css/cssDecorator';


export interface Label {
    name: string;
    color: string;
}

export interface LabelListProps {
    labels: Label[];
    onGroupChange?: (groups: Array<Array<Label>>) => void;
}

export interface LabelListState {
    groups: Array<Array<Label>>;
}

styles('./labelList/labelList');
export class LabelList extends Component<LabelListProps, LabelListState> {
    constructor(props: LabelListProps) {
        super(props);
        this.state = {
            groups: [[]]
        }
    }

    onLabelClick(item: Label): void {
        const groups = this.state.groups;
        groups[0].push(item);
        this.setState({ groups: groups });
        if (this.props.onGroupChange) {
            this.props.onGroupChange(groups);
        }
    }

    render(): ComponentChild {
        return (
            <div>
                <div class="label-list">{this.props.labels.map(l => (<span class="label" onClick={() => this.onLabelClick(l)} style={{ 'background-color': '#' + l.color }}>{l.name}</span>))}</div>
                {this.state.groups.map(g => <span class="label-group"><div class="label-list">{g.map(l => (<span class="label" style={{ 'background-color': '#' + l.color }}>{l.name}</span>))}</div></span>)}
            </div>
        );
    }
}
