import { h, Component, ComponentChild } from 'https://unpkg.com/preact?module';
import { styles } from '../common/css/cssDecorator';
import { Chart, Entry, TimeLineEntry } from '../common/chart/chart'
import { Dropdown, Item } from '../common/dropdown/dropdown';
import { api } from '../../api';
import { LabelList, Label } from '../labelList/labelList';
import { Checkbox } from '../common/checkbox/checkbox';

export interface IssueExplorerProps {

}

export interface IssueExplorerState {
    repos: Array<{ owner: string; name: string }>;
    labels: Label[];
    tags: Array<{ x: string, label: string }>
    selectedRepo?: { owner: string; name: string };
    showTags?: boolean;
    data: Entry[] | TimeLineEntry[];
    groups: Array<Array<Label>>;
    timeline: boolean;
}

const allGroups = [[{ name: 'all', color: 'ffa500' }]];

styles('./issueExplorer/issueExplorer');
export class IssueExplorer extends Component<IssueExplorerProps, IssueExplorerState> {
    constructor(props: IssueExplorerProps) {
        super(props);
        this.state = {
            repos: [],
            labels: [],
            tags: [],
            data: [],
            groups: allGroups,
            showTags: false,
            timeline: false
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
            const data = await this.updateIssues(this.state.groups, { owner, name }, this.state.timeline);
            this.setState({ labels, data });
        })();
    }

    labelGroupsChanged(groups: Array<Array<Label>>) {
        if (groups.length === 0 || groups[0].length === 0) {
            groups = allGroups
        }
        (async () => {
            const data = await this.updateIssues(groups, this.state.selectedRepo!, this.state.timeline);
            this.setState({ groups, data });
        })();
    }

    async updateIssues(groups: Array<Array<Label>>, repo: { owner: string; name: string }, timeline: boolean): Promise<Entry[] | TimeLineEntry[]> {
        const { owner, name } = repo;
        if (timeline) {
            const data = await Promise.all(groups.map(async g => {
                if (g.map(g => g.name).join('.') === 'all') {
                    const issues: api.getIssuesTimelineResponse = await (await fetch(`/api/repo/${owner}/${name}/issues/timeline?segments=50&start=${new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toString()}&end=${new Date(Date.now()).toString()}`)).json();
                    return { label: 'all', values: issues.map(v => ({ x: v.time, y: v.count })), color: g[0].color };
                } else {
                    const labels = encodeURIComponent(g.map(g => g.name).join(','));
                    const issues: api.getIssuesTimelineResponse = await (await fetch(`/api/repo/${owner}/${name}/issues/timeline?labels=${labels}&segments=50&start=${new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toString()}&end=${new Date(Date.now()).toString()}`)).json();
                    return { label: g.map(g => g.name).join(','), values: issues.map(v => ({ x: v.time, y: v.count })), color: g[0].color };
                }
            }));
            return data;
        } else {
            const data = await Promise.all(groups.map(async g => {
                if (g.map(g => g.name).join('.') === 'all') {
                    const issues: api.getIssuesResponse = await (await fetch(`/api/repo/${owner}/${name}/issues`)).json();
                    return { label: 'all', value: issues.count, color: g[0].color };
                } else {
                    const labels = encodeURIComponent(g.map(g => g.name).join(','));
                    const issues: api.getIssuesResponse = await (await fetch(`/api/repo/${owner}/${name}/issues?labels=${labels}`)).json();
                    return { label: g.map(g => g.name).join(','), value: issues.count, color: g[0].color };
                }
            }));
            return data;
        }
    }

    showTags(doShow: boolean): void {
        this.setState({ showTags: doShow });
        if (doShow && this.state.selectedRepo) {
            (async () => {
                const { owner, name } = this.state.selectedRepo!;
                const tags: api.getTagsResponse = await (await fetch(`/api/repo/${owner}/${name}/tags`)).json();
                this.setState({ tags: tags.map(v => ({ x: v.date, label: v.name })) });
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

    onTimelineChange(doTimeline: boolean): void {
        (async () => {
            const data = await this.updateIssues(this.state.groups, this.state.selectedRepo!, doTimeline);
            this.setState({ timeline: doTimeline, data });
        })();
    }

    render(): ComponentChild {
        return (
            <div class="issue-explorer">
                <Dropdown items={this.state.repos.map(r => ({ name: `${r.owner}/${r.name}`, value: `${r.owner}/${r.name}` }))} onChange={e => this.repoSelected(e)} />
                <input onKeyPress={e => this.onInputKeyPress(e)} />
                <Checkbox onChange={e => this.onTimelineChange(e)} checked={this.state.timeline} name="Timeline" />
                <Checkbox onChange={e => this.showTags(e)} checked={this.state.showTags} name="Show Releases" />
                <LabelList labels={this.state.labels} onGroupChange={g => this.labelGroupsChanged(g)} />
                <Chart data={this.state.data} isTimeline={this.state.timeline} verticalMarkers={this.state.tags} />
            </div>
        );
    }
}
