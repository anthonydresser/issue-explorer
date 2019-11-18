import { h, Component, ComponentChild } from 'https://unpkg.com/preact?module';
import * as d3 from 'https://unpkg.com/d3?module';
import { styles } from '../css/cssDecorator';

export interface Entry {
    label: string;
    value: number;
    color?: string;
}

export interface Point {
    x: string;
    y: number;
}

export interface TimeLineEntry {
    label: string;
    values: Point[]
    color?: string;
}

export interface ChartProps {
    data: Entry[] | TimeLineEntry[];
    isTimeline: boolean;
    verticalMarkers?: Array<{ x: string, label: string }>;
}

export interface ChartState { }

styles('./common/chart/chart');
export class Chart extends Component<ChartProps, ChartState> {
    private readonly id = 'd3Container' + String(Math.round(Math.random() * 10000));

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
        svg.selectAll('*').remove();
        if (this.props.isTimeline) {
            const data = this.props.data as TimeLineEntry[];
            const chart = svg.append('g')
                .attr('transform', `translate(${margin}, ${margin})`);

            const yScale = d3.scaleLinear()
                .range([height, 0])
                .domain([Math.min(...data.map(v => Math.min(...v.values.map(t => t.y)))), Math.max(...data.map(v => Math.max(...v.values.map(t => t.y))))]);

            chart.append('g')
                .call(d3.axisLeft(yScale));

            const xScale = d3.scaleTime()
                .range([0, width])
                .domain([new Date(data[0].values[0].x), new Date(data[0].values.slice(-1)[0].x)]);

            chart.append('g')
                .attr('transform', `translate(0, ${height})`)
                .call(d3.axisBottom(xScale));

            if (this.props.verticalMarkers) {
                this.props.verticalMarkers.forEach(v => {
                    chart.append('line')
                        .attr('x1', xScale(new Date(v.x)))
                        .attr('y1', 0)
                        .attr('x2', xScale(new Date(v.x)))
                        .attr('y2', height)
                        .style('stroke-width', 2)
                        .style('stroke', 'grey')
                        .style('fill', 'none');
                    
                    chart.append('text')
                        .attr('x', xScale(new Date(v.x)))
                        .attr('y', 10)
                        .attr('text-anchor', 'left')
                        .attr('class', 'marker-label')
                        .text(v.label);
                });
            }

            data.forEach(v => {
                const line = d3.line<Point>().x(d => xScale(new Date(d.x))).y(d => yScale(d.y));
                chart.append('path')
                    .datum(v.values)
                    .attr('id', v.label)
                    .attr('fill', 'none')
                    .attr('stroke', '#' + v.color)
                    .attr('stroke-width', 1.5)
                    .attr('d', line);
            });
        } else {
            const data = this.props.data as Entry[];
            const chart = svg.append('g')
                .attr('transform', `translate(${margin}, ${margin})`);

            const yScale = d3.scaleLinear()
                .range([height, 0])
                .domain([0, Math.max(...data.map(e => e.value))]);

            chart.append('g')
                .call(d3.axisLeft(yScale));

            const xScale = d3.scaleBand()
                .range([0, width])
                .domain(data!.map(d => d.label))
                .padding(0.2);

            chart.append('g')
                .attr('transform', `translate(0, ${height})`)
                .call(d3.axisBottom(xScale));

            chart.selectAll()
                .data(data)
                .enter()
                .append('rect')
                .attr('x', s => xScale(s.label) || null)
                .attr('y', s => yScale(s.value))
                .attr('height', s => height - yScale(s.value))
                .attr('width', xScale.bandwidth())
                .attr('fill', s => s.color ? '#' + s.color : 'black');
        }
    }

    render(): ComponentChild {
        return <svg style="overflow: overlay" id={this.id} />;
    }
}
