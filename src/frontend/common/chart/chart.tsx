import { h, Component, ComponentChild } from "https://unpkg.com/preact?module";
import * as d3 from 'https://unpkg.com/d3?module';

export interface ChartProps { }

export interface ChartState { }

export class Chart extends Component<ChartProps, ChartState> {
    private readonly id = "d3Container" + String(Math.round(Math.random() * 10000));

    componentDidMount() {
        d3.select('#' + this.id);
    }

    render(): ComponentChild {
        return <div id={this.id} />;
    }
}
