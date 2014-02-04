/* global nv, d3, Chart */

nv.models.lineChart = function () {
    'use strict';
    //============================================================
    // Public Variables with Default Settings
    //------------------------------------------------------------
    var lines = nv.models.line(),
        interactiveLayer = nv.interactiveGuideline();

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
            var canvas = Chart.call(null, this, defaults);

            var container = canvas.svg,
                that = this;

            canvas.updata = chart.update = function () {
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

    //============================================================
    //============================================================
    // Expose Public Variables
    //------------------------------------------------------------
    // expose chart's sub-components

    // chart.dispatch = canvas.dispatch;
    // chart.lines = lines;
    // chart.legend = canvas.legend;
    // chart.xAxis = canvas.axis.x;
    // chart.yAxis = canvas.yAxis;

    // chart.interactiveLayer = interactiveLayer;
    // d3.rebind(chart, lines, 'defined', 'isArea', 'x', 'y', 'size', 'xScale', 'yScale', 'xDomain', 'yDomain', 'xRange', 'yRange', 'forceX', 'forceY', 'interactive', 'clipEdge', 'clipVoronoi', 'useVoronoi', 'id', 'interpolate');
    // chart.options = nv.utils.optionsFunc.bind(chart);
    // chart.margin = function (_) {
    //     if (!arguments.length) return margin;
    //     margin.top = typeof _.top != 'undefined' ? _.top : margin.top;
    //     margin.right = typeof _.right != 'undefined' ? _.right : margin.right;
    //     margin.bottom = typeof _.bottom != 'undefined' ? _.bottom : margin.bottom;
    //     margin.left = typeof _.left != 'undefined' ? _.left : margin.left;
    //     return chart;
    // };
    // chart.width = function (_) {
    //     if (!arguments.length) return width;
    //     width = _;
    //     return chart;
    // };
    // chart.height = function (_) {
    //     if (!arguments.length) return height;
    //     height = _;
    //     return chart;
    // };
    // chart.color = function (_) {
    //     if (!arguments.length) return color;
    //     color = nv.utils.getColor(_);
    //     legend.color(color);
    //     return chart;
    // };
    // chart.showLegend = function (_) {
    //     if (!arguments.length) return showLegend;
    //     showLegend = _;
    //     return chart;
    // };
    // chart.showXAxis = function (_) {
    //     if (!arguments.length) return showXAxis;
    //     showXAxis;
    //     return chart;
    // };
    // chart.showYAxis = function (_) {
    //     if (!arguments.length) return showYAxis;
    //     showYAxis = _;
    //     return chart;
    // };
    // chart.rightAlignYAxis = function (_) {
    //     if (!arguments.length) return rightAlignYAxis;
    //     rightAlignYAxis = _;
    //     yAxis.orient((_) ? 'right' : 'left');
    //     return chart;
    // };
    // chart.useInteractiveGuideline = function (_) {
    //     if (!arguments.length) return useInteractiveGuideline;
    //     useInteractiveGuideline = _;
    //     if (_ === true) {
    //         chart.interactive(false);
    //         chart.useVoronoi(false);
    //     }
    //     return chart;
    // };
    // chart.tooltips = function (_) {
    //     if (!arguments.length) return tooltips;
    //     tooltips = _;
    //     return chart;
    // };
    // chart.tooltipContent = function (_) {
    //     if (!arguments.length) return tooltip;
    //     tooltip = _;
    //     return chart;
    // };
    // chart.state = function (_) {
    //     if (!arguments.length) return state;
    //     state = _;
    //     return chart;
    // };
    // chart.defaultState = function (_) {
    //     if (!arguments.length) return defaultState;
    //     defaultState = _;
    //     return chart;
    // };
    // chart.noData = function (_) {
    //     if (!arguments.length) return noData;
    //     noData = _;
    //     return chart;
    // };
    // chart.transitionDuration = function (_) {
    //     nv.deprecated('lineChart.transitionDuration');
    //     return chart.duration(_);
    // };
    // chart.duration = function (_) {
    //     if (!arguments.length) return duration;
    //     duration = _;
    //     renderWatch.reset(duration);
    //     lines.duration(duration);
    //     xAxis.duration(duration);
    //     yAxis.duration(duration);
    //     return chart;
    // }

    //============================================================
    return chart;
}

nv.models.lineChart.build = function(chart, data, lines){
    Chart.state.set(canvas, data);

    if(Chart.checkData(canvas, data)){
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
        interactiveLayer
            .width(chart.size.available.width)
            .height(chart.size.available.height)
            .margin({
                left: chart.margin.left,
                top: chart.margin.top
            })
            .svgContainer(container)
            .xScale(chart.scale.x);
        chart.wrap.select('.nv-interactive').call(interactiveLayer);
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
    interactiveLayer.dispatch.on('elementMousemove', function (e) {
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
        interactiveLayer.tooltip
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
        interactiveLayer.renderGuideLine(pointXLocation);
    });
    interactiveLayer.dispatch.on('elementMouseout', function (e) {
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
    chart.wrap = chart.container.selectAll('g.nv-wrap.nv-lineChart').data([data]);
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

