import { h, Component, ComponentChild } from '/preact';
import { CSS } from './common/css/cssDecorator';
import { Chart } from './common/chart/chart'
import { Dropdown } from './common/dropdown/dropdown';
import { api } from '../api';

export interface IssueExplorerProps {

}

export interface IssueExplorerState {
    repos: Array<{ name: string, value: string }>;
}

@CSS('./issueExplorer')
export class IssueExplorer extends Component<IssueExplorerProps, IssueExplorerState> {
    constructor(props: IssueExplorerProps) {
        super(props);
        this.state = {
            repos: []
        };
    }

    componentWillMount?(): void {
        (async () => {
            const repos: api.getReposResponse = await (await fetch('/api/repos')).json();
            this.setState({ repos: repos.map(r => ({ name: r.name, value: r.name })) })
        })()
    }

    render(): ComponentChild {
        return (
            <div class="issue-explorer">
                <Dropdown items={this.state.repos} />
                <Chart />
            </div>
        );
    }
}
