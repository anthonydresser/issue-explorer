import { h, Component, ComponentChild } from '/preact';
import { Chart } from './chart'

export interface IssueExplorerProps {

}

export interface IssueExplorerState {

}

export class IssueExplorer extends Component<IssueExplorerProps, IssueExplorerState> {
    render(): ComponentChild {
        return (
            <div class="issue-explorer">
                <Chart />
            </div>
        )
    }
}
