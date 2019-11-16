import { h, Component, ComponentChild } from "/preact";
// import * as d3 from '/d3';

export interface ChartProps { }

export interface ChartState { }

export class Chart extends Component<ChartProps, ChartState> {
    private readonly id = "d3Container" + String(Math.random() * 10000);

    componentDidMount() {
        // d3.select('#' + this.id)
    }

    render(): ComponentChild {
        return <div id={this.id} />;
    }
}
