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
    lastGroupAddedTo: number;
}

styles('./labelList/labelList');
export class LabelList extends Component<LabelListProps, LabelListState> {
    constructor(props: LabelListProps) {
        super(props);
        this.state = {
            groups: [[]],
            lastGroupAddedTo: 0
        }
    }

    onLabelClick(e: MouseEvent, item: Label): void {
        this.addLabelToGroup(item, e.ctrlKey ? this.state.lastGroupAddedTo + 1 : this.state.lastGroupAddedTo);
    }

    private addLabelToGroup(item: Label, group: number): void {
        const groups = this.state.groups;
        groups[group].splice(0, 0, item);
        // keep an empty group at the end
        if (groups[groups.length - 1].length > 0) {
            groups.push([]);
        }
        this.setState({ groups: groups, lastGroupAddedTo: group });
        if (this.props.onGroupChange) {
            this.props.onGroupChange(groups.slice(0, -1));
        }
    }

    removeLabelFromGroup(label: number, group: number): void {
        const groups = this.state.groups;
        groups[group].splice(label, 1);
        if (groups[group].length === 0) {
            groups.splice(group, 1);
        }
        this.setState({ groups: groups, lastGroupAddedTo: this.state.lastGroupAddedTo > groups.length - 1 ? groups.length -1 : this.state.lastGroupAddedTo });
        if (this.props.onGroupChange) {
            this.props.onGroupChange(groups.slice(0, -1));
        }
    }

    onDragStart(event: DragEvent, label: Label): void {
        event.dataTransfer && event.dataTransfer.setData('label', JSON.stringify(label));
    }

    onDrop(event: DragEvent, group: number): void {
        event.preventDefault();
        const labelString = event.dataTransfer && event.dataTransfer.getData('label');
        if (labelString) {
            const label: Label = JSON.parse(labelString);
            this.addLabelToGroup(label, group);
            event.dataTransfer && event.dataTransfer.clearData();
        }
    }

    render(): ComponentChild {
        return (
            <div class="labeling">
                {createLabelList(this.props.labels, (e, l) => this.onLabelClick(e, l), (e, l) => this.onDragStart(e, l))}
                <div class="label-groups">{this.state.groups.map((g, j) => <div class="label-group" onDragOver={preventEveryThing} onDrop={e => this.onDrop(e, j)}>{createLabelList(g, (e, l, i) => this.removeLabelFromGroup(i, j), e => this.onDrop(e, j))}</div>)}</div>
            </div>
        );
    }
}

function preventEveryThing(e: Event): void {
    e.preventDefault();
    e.stopPropagation();
}

function createLabelList(
    labels: Array<Label>,
    onLabelClick: (e: MouseEvent, label: Label, index: number) => void = () => {},
    onLabelDragStart: (event: DragEvent, label: Label) => void = () => {},
    onLabelDrop: (event: DragEvent) => void = () => {}): ComponentChild {
    return <div class="label-list" onDrop={e => onLabelDrop(e)} onDragOver={preventEveryThing}>
            {labels.map((l, i) => createLabel(l, (e, l) => onLabelClick(e, l, i), (e, l) => onLabelDragStart(e, l), e => onLabelDrop(e)))}
        </div>
}

function createLabel(
    label: Label,
    onClick: (e: MouseEvent, label: Label) => void,
    onLabelDragStart: (event: DragEvent, label: Label) => void,
    onLabelDrop: (event: DragEvent) => void): ComponentChild {
    return <span class="label" draggable onClick={e => onClick(e, label)} onDrop={e => onLabelDrop(e)} onDragOver={preventEveryThing} onDragStart={e => onLabelDragStart(e, label)}
        style={{ 'background-color': '#' + label.color }}>{label.name}</span>
}
