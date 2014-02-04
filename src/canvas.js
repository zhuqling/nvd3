/*
Get a new SVG canvas, with margins and scales. Pass an object as `options` to
set values. Defaults:

{
	size: # Size of SVG. Available size will be smaller by the size of the margins.
		width: 960
		height: 500
		available:
			width: 900
			height: 450
	margin: # Margins for the graphic.
		top: 20
		right: 20
		bottom: 30
		left: 40
	scale: # d3.scales to scale against the canvas
		x: linear
		y: linear
	domain: # Domain of scales for the canvas.
		x: [0, 1]
		y: [0, 1]
}

@param root String selector for finding the SVG element.
@param options Object matching the defaults to override.
@return Object with defaults, overriden by the options, and an additional two properties:
	{
	svg: SVG_Element # SVG root
	defs: SVG_Defs_Element # <defs> to attach gradient and filter definitions to.
	}
*/
function Canvas (root, options) {
	var margin, width, height, svg, scales, canvas;

	root == null && (root = 'body');

	options == null && (options = {});
	options.size || (options.size = {});
	options.margin || (options.margin = {});
	options.scale || (options.scale = {});

	margin = {
		top: options.margin.top || 20,
		right: options.margin.top || 20,
		bottom: options.margin.top || 30,
		left: options.margin.top || 40
	};

	margin.leftright = margin.left + margin.right;
	margin.topbottom = margin.top + margin.bottom;

	width = (options.size.width || parseInt(svg.style('width')) || 960);
	height = (options.size.height || parseInt(svg.style('height')) || 500);

	svg = d3.select(root).attr({
		width: width,
		height: height
	});

	scales = {
		x: d3.scale[options.scale.x || 'linear']()
			.range([0, width])
			.domain(options.domain.x || [0, 1])
			.nice(),
		y: d3.scale[options.scale.y || 'linear']()
			.range([0, height])
			.domain(options.domain.y || [0, 1])
			.nice()
	};

	canvas = {
		size: {
			width: width,
			height: height,
			available: {
				width: width - margin.leftright,
				height: height - margin.topbottom
			},
		},
		margin: margin,
		scale: scales,
		svg: svg,
		defs: svg.select('defs'),
		dispatch: d3.dispatch.apply(null, options.dispatch || [])
	};
	return canvas;
}

function Chart (root, options) {
	var chart = Canvas(root, options);

	chart.noData = options.noData || 'No Data Available.';
	chart.color = options.color || nv.utils.defaultColor();

	Chart.axis(chart, options);
	Chart.state(chart, options);
	Chart.legend(chart, options);

	chart.tooltip = options.tooltip ||
		function (key, x, y, e, graph) {
		    return '<h3>' + key + '</h3>' +
		        '<p>' + y + ' at ' + x + '</p>'
		};


    chart.duration = options.duration || 250;
    chart.useInteractiveGuideline = options.useInteractiveGuideline || false;
	return chart;
}

Chart.axis = function (chart, options) {
	chart.axis = options.axis || options.axis = {
		x: nv.models.axis(),
		y: nv.models.axis()
	};

	chart.axis.rightAlignY = options.axis.rightAlignY || false;
	chart.axis.topAlignX = options.axis.topAlignX || false;

    xAxis
        .orient((options.axis.topAlignX) ? 'top' : 'bottom')
        .tickPadding(7);
    yAxis
        .orient((options.axis.rightAlignY) ? 'right' : 'left');
};

Chart.axis.build = function (chart) {
    if (chart.axis.x) {
        chart.axis.x
            .scale(chart.scale.x)
            .ticks(chart.size.avialable.width / 100)
            .tickSize(-chart.size.avialable.eight, 0);
        chart.g.select('.nv-x.nv-axis')
            .attr('transform',
                'translate(0,' + chart.scale.y.range()[0] + ')'
            );
        chart.g.select('.nv-x.nv-axis')
            .call(chart.axis.x);
    }
    if (chart.axis.y) {
        chart.axis.y
            .scale(chart.scale.y)
            .ticks(chart.size.available.height / 36)
            .tickSize(-chart.size.available.width, 0);
        chart.g.select('.nv-y.nv-axis')
            .call(chart.axis.y);
    }
};

Chart.legend = function (chart, options) {
    chart.legend = options.legend || nv.models.legend();
}

Chart.legend.build = function (chart, data) {
	if(!chart.legend){ return; }
    chart.legend.width(availableWidth);
    g.select('.nv-legendWrap')
        .datum(data)
        .call(legend);
    if (otions.margin.top != legend.height()) {
        otions.margin.top = legend.height();
        availableHeight = (otions.height || parseInt(container.style('height')) || 400) - margin.top - margin.bottom;
    }
    wrap.select('.nv-legendWrap')
        .attr('transform', 'translate(0,' + (-otions.margin.top) + ')')
}

Chart.defaultState = function (chart, options) {
    chart.state = options.state || {};
    chart.defaultState = options.defaultState || null;
}

Chart.defaultState.set = function(chart, data){
    chart.state.disabled = data.map(function (d) {
        return !!d.disabled
    });
    if (!chart.defaultState) {
        var key;
        chart.defaultState = {};
        for (key in chart.state) {
            if (chart.state[key] instanceof Array)
                chart.defaultState[key] = chart.state[key].slice(0);
            else
                chart.defaultState[key] = chart.state[key];
        }
    }
}

Chart.checkData = function(chart, data){
    if (!data || !data.length || !data.filter(function (d) {
        return d.values.length
    }).length) {
        var noDataText = chart.container.selectAll('.nv-noData').data([noData]);
        noDataText.enter().append('text')
            .attr('class', 'nvd3 nv-noData')
            .attr('dy', '-.7em')
            .style('text-anchor', 'middle');
        noDataText
            .attr('x', margin.left + availableWidth / 2)
            .attr('y', margin.top + availableHeight / 2)
            .text(function (d) {
                return d
            });
        return true;
    } else {
        container.selectAll('.nv-noData').remove();
        return false;
    }
}

