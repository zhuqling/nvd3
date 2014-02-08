/* global nv, d3, Chart */

nv.models.lineChart = function () {
    'use strict';

    var defaults = {
        margin: {
            top: 30,
            right: 20,
            bottom: 50,
            left: 60
        },
        dispatch: [
            'tooltipShow',
            'tooltipHide',
            'stateChange',
            'changeState',
            'renderEnd'
        ]
    };

    //============================================================
    // Public Variables with Default Settings
    //------------------------------------------------------------
    var lines = nv.models.line(),
        interactiveLayer = nv.interactiveGuideline(),
        inst = Chart.call(null, defaults);

    //============================================================
    //============================================================
    // Private Variables
    //------------------------------------------------------------
    var showTooltip = function(canvas){
        return function (e, offsetElement) {
            var left = e.pos[0] + (offsetElement.offsetLeft || 0),
                top = e.pos[1] + (offsetElement.offsetTop || 0),
                x = canvas.axis.x.tickFormat()(canvas.scale.x()(e.point, e.pointIndex)),
                y = canvas.axis.y.tickFormat()(canvas.scale.y()(e.point, e.pointIndex)),
                content = canvas.tooltip(e.series.key, x, y, e, chart);
            nv.tooltip.show([left, top], content, null, null, offsetElement);
        };
    };
    // var renderWatch = nv.utils.renderWatch(canvas.dispatch, otions.duration);

    //============================================================
    function chart(selection) {
        // renderWatch.reset();
        // renderWatch.models(lines);
        // if (showXAxis) renderWatch.models(xAxis);
        // if (showYAxis) renderWatch.models(yAxis);

        selection.each(function (data) {
            Chart.canvas(inst, this);
            var canvas = inst;
            var container = canvas.svg,
                that = this;

            canvas.update = chart.update = function () {
                if (canvas.duration === 0)
                    canvas.svg.call(chart);
                else
                    canvas.svg.transition().duration(canvas.duration).call(chart)
            };

            nv.models.lineChart.build(canvas, data, lines);
        });
        // renderWatch.renderEnd('lineChart immediate');
        return chart;
    }

    //============================================================
    // Event Handling/Dispatching (out of chart's scope)
    //------------------------------------------------------------
    // lines.dispatch.on('elementMouseover.tooltip', function (e) {
    //     e.pos = [e.pos[0] + canvas.margin.left, e.pos[1] + canvas.margin.top];
    //     canvas.dispatch.tooltipShow(e);
    // });
    // lines.dispatch.on('elementMouseout.tooltip', function (e) {
    //     canvas.dispatch.tooltipHide(e);
    // });
    // canvas.dispatch.on('tooltipHide', function () {
    //     if (canvas.tooltips) nv.tooltip.cleanup();
    // });
    Chart.attachCallable(inst, chart);

    inst.interactiveLayer = chart.interactiveLayer = interactiveLayer;
    chart.duration = function (_) {
        if (!arguments.length) return inst.duration;
        inst.duration = _;
        // renderWatch.reset(duration);
        lines.duration(chart.duration);
        inst.axis.x.duration(duration);
        inst.axis.y.duration(duration);
        return chart;
    }

    d3.rebind(chart, lines, 'defined', 'isArea', 'x', 'y', 'size', 'xScale', 'yScale', 'xDomain', 'yDomain', 'xRange', 'yRange', 'forceX', 'forceY', 'interactive', 'clipEdge', 'clipVoronoi', 'useVoronoi','id', 'interpolate');

    //============================================================
    return chart;
}

nv.models.lineChart.build = function(chart, data, lines){
    Chart.defaultState.set(chart, data);

    if(Chart.checkData(chart, data)){
        return chart;
    }

    nv.models.lineChart.wrap(chart, data);
    Chart.legend.build(chart, data);

    //------------------------------------------------------------
    chart.wrap.attr('transform', 'translate(' + chart.margin.left + ',' + chart.margin.top + ')');
    if (chart.axis.rightAlignY) {
        chart.g.select('.nv-y.nv-axis')
            .attr('transform', 'translate(' + chart.size.available.width + ',0)');
    }

    //------------------------------------------------------------
    // Main Chart Component(s)
    //------------------------------------------------------------
    //Set up interactive layer
    if (chart.useInteractiveGuideline) {
        chart.interactiveLayer
            .width(chart.size.available.width)
            .height(chart.size.available.height)
            .margin({
                left: chart.margin.left,
                top: chart.margin.top
            })
            .svgContainer(chart.svg)
            .xScale(chart.scale.x);
        chart.wrap.select('.nv-interactive').call(chart.interactiveLayer);
    }

    nv.models.lineChart.lines(chart, data, lines);

    //------------------------------------------------------------
    //------------------------------------------------------------
    // Setup Axes
    Chart.axis.build(chart, data);

    //------------------------------------------------------------
    //============================================================
    // Event Handling/Dispatching (in chart's scope)
    //------------------------------------------------------------
    chart.legend.dispatch.on('stateChange', function (newState) {
        chart.state = newState;
        chart.dispatch.stateChange(chart.state);
        chart.update();
    });
    chart.interactiveLayer.dispatch.on('elementMousemove', function (e) {
        lines.clearHighlights();
        var singlePoint, pointIndex, pointXLocation, allData = [];
        data
            .filter(function (series, i) {
                series.seriesIndex = i;
                return !series.disabled;
            })
            .forEach(function (series, i) {
                pointIndex = nv.interactiveBisect(series.values, e.pointXValue, chart.scale.x());
                lines.highlightPoint(i, pointIndex, true);
                var point = series.values[pointIndex];
                if (typeof point === 'undefined') return;
                if (typeof singlePoint === 'undefined') singlePoint = point;
                if (typeof pointXLocation === 'undefined') pointXLocation = chart.xScale()(chart.scale.x()(point, pointIndex));
                allData.push({
                    key: series.key,
                    value: chart.scale.y()(point, pointIndex),
                    color: chart.color(series, series.seriesIndex)
                });
            });
        //Highlight the tooltip entry based on which point the mouse is closest to.
        if (allData.length > 2) {
            var yValue = chart.yScale().invert(e.mouseY);
            var domainExtent = Math.abs(chart.yScale().domain()[0] - chart.yScale().domain()[1]);
            var threshold = 0.03 * domainExtent;
            var indexToHighlight = nv.nearestValueIndex(allData.map(function (d) {
                return d.value
            }), yValue, threshold);
            if (indexToHighlight !== null)
                allData[indexToHighlight].highlight = true;
        }
        var xValue = chart.axis.x.tickFormat()(chart.scale.x()(singlePoint, pointIndex));
        chart.interactiveLayer.tooltip
            .position({
                left: pointXLocation + chart.margin.left,
                top: e.mouseY + chart.margin.top
            })
            .chartContainer(that.parentNode)
            .enabled(chart.tooltips)
            .valueFormatter(function (d, i) {
                return chart.axis.y.tickFormat()(d);
            })
            .data({
                value: xValue,
                series: allData
            })();
        chart.interactiveLayer.renderGuideLine(pointXLocation);
    });
    chart.interactiveLayer.dispatch.on('elementMouseout', function (e) {
        chart.dispatch.tooltipHide();
        lines.clearHighlights();
    });
    chart.dispatch.on('tooltipShow', function (e) {
        if (chart.tooltips) showTooltip(e, that.parentNode);
    });
    chart.dispatch.on('changeState', function (e) {
        if (typeof e.disabled !== 'undefined' && data.length === e.disabled.length) {
            data.forEach(function (series, i) {
                series.disabled = e.disabled[i];
            });
            chart.state.disabled = e.disabled;
        }
        chart.update();
    });
};

nv.models.lineChart.wrap = function(chart, data) {
    chart.wrap = chart.svg.selectAll('g.nv-wrap.nv-lineChart').data([data]);
    var gEnter = chart.wrap.enter().append('g').attr('class', 'nvd3 nv-wrap nv-lineChart').append('g');
    chart.g = chart.wrap.select('g');
    gEnter.append('rect').style('opacity', 0);
    gEnter.append('g').attr('class', 'nv-x nv-axis');
    gEnter.append('g').attr('class', 'nv-y nv-axis');
    gEnter.append('g').attr('class', 'nv-linesWrap');
    gEnter.append('g').attr('class', 'nv-legendWrap');
    gEnter.append('g').attr('class', 'nv-interactive');
    chart.g.select('rect')
        .attr({
            width: chart.size.available.width,
            height: Math.max(chart.size.available.height, 0)
        });
};

nv.models.lineChart.lines = function(chart, data, lines){
    lines
        .width(chart.size.available.width)
        .height(chart.size.available.height)
        .color(data.map(function (d, i) {
            return d.color || chart.color(d, i);
        }).filter(function (d, i) {
            return !data[i].disabled
        }));
    var linesWrap = chart.g.select('.nv-linesWrap')
        .datum(data.filter(function (d) {
            return !d.disabled
        }))
    linesWrap.call(lines);
};

