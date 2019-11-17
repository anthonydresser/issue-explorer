import { h, Component, ComponentChild } from 'https://unpkg.com/preact?module';
import { styles } from '../common/css/cssDecorator';
import { Chart } from '../common/chart/chart'
import { Dropdown, Item } from '../common/dropdown/dropdown';
import { api } from '../../api';
import { LabelList, Label } from '../labelList/labelList';
import { Checkbox } from '../common/checkbox/checkbox';

export interface IssueExplorerProps {

}

export interface IssueExplorerState {
    repos: Array<{ owner: string; name: string }>;
    labels: Label[];
    tags: { name: string; date: string }[];
    selectedRepo?: { owner: string; name: string };
    showTags?: boolean;
}

styles('./issueExplorer/issueExplorer');
export class IssueExplorer extends Component<IssueExplorerProps, IssueExplorerState> {
    constructor(props: IssueExplorerProps) {
        super(props);
        this.state = {
            repos: [],
            labels: [],
            tags: [],
            showTags: false
        };
    }

    componentWillMount(): void {
        (async () => {
            const repos: api.getReposResponse = await (await fetch('/api/repos')).json();
            this.setState({ repos });
        })();
    }

    repoSelected(item: Item): void {
        const [owner, name] = item.value.split('/');
        this.setState({ selectedRepo: { owner, name } });
        (async () => {
            const labels: api.getLabelsResponse = await (await fetch(`/api/repo/${owner}/${name}/labels`)).json();
            this.setState({ labels });
        })();
    }

    showTags(doShow: boolean): void {
        this.setState({ showTags: doShow });
        if (doShow && this.state.selectedRepo) {
            (async () => {
                const { owner, name } = this.state.selectedRepo!;
                const tags: api.getTagsResponse = await (await fetch(`/api/repo/${owner}/${name}/tags`)).json();
                this.setState({ tags });
            })();
        } else {
            this.setState({ tags: [] });
        }
    }

    onInputKeyPress(e: KeyboardEvent): void {
        if (e.key === 'Enter') {
            const name = (e.target as HTMLInputElement).value;
            this.repoSelected({ name, value: name })
        }
    }

    onSegmentChange(e: Event): void {

    }

    render(): ComponentChild {
        return (
            <div class="issue-explorer">
                <Dropdown items={this.state.repos.map(r => ({ name: `${r.owner}/${r.name}`, value: `${r.owner}/${r.name}` }))} onChange={e => this.repoSelected(e)} />
                <input onKeyPress={e => this.onInputKeyPress(e)} />
                <Checkbox onChange={e => this.showTags(e)} checked={this.state.showTags} name="Show Releases" />
                <LabelList labels={this.state.labels} />
                <LabelList labels={this.state.tags.map(t => ({ name: t.name + t.date, color: 'ffffff'}))} />
                <Chart />
            </div>
        );
    }
}
