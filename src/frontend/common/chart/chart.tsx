import { h, Component, ComponentChild } from "https://unpkg.com/preact?module";
import * as d3 from 'https://unpkg.com/d3?module';
import { styles } from "../css/cssDecorator";

export interface Entry {
    label: string;
    value: number;
    color?: string;
}
export interface ChartProps {
    data: Entry[];
}

export interface ChartState { }

styles('./common/chart/chart');
export class Chart extends Component<ChartProps, ChartState> {
    private readonly id = "d3Container" + String(Math.round(Math.random() * 10000));

    componentDidMount() {
        this.renderGraph();
    }

    componentDidUpdate() {
        this.renderGraph();
    }

    private renderGraph(): void {
        const margin = 60;
        const width = 1000 - 2 * margin;
        const height = 600 - 2 * margin;

        const svg = d3.select('#' + this.id);
        svg.selectAll("*").remove();
        const chart = svg.append('g')
            .attr('transform', `translate(${margin}, ${margin})`);

        const yScale = d3.scaleLinear()
            .range([height, 0])
            .domain([0, this.props.data.reduce<number>((e, c) => c.value > e ? c.value : e, 0)]);
        
        chart.append('g')
            .call(d3.axisLeft(yScale));

        const xScale = d3.scaleBand()
            .range([0, width])
            .domain(this.props.data!.map(d => d.label))
            .padding(0.2);
        
        chart.append('g')
            .attr('transform', `translate(0, ${height})`)
            .call(d3.axisBottom(xScale));
        
        chart.selectAll()
            .data(this.props.data)
            .enter()
            .append('rect')
            .attr('x', (s: Entry) => xScale(s.label) || null)
            .attr('y', (s: Entry) => yScale(s.value))
            .attr('height', (s: Entry) => height - yScale(s.value))
            .attr('width', xScale.bandwidth())
            .attr('fill', (s: Entry) => s.color ? '#' + s.color : 'black');
    }

    render(): ComponentChild {
        return <svg style="overflow: overlay" id={this.id} />;
    }
}
