Ext.ns('LSH.chartpanel');
LSH.chartpanel.ChartPanelBaseCls = Ext.extend(Ext.Panel, {
	frame: false,
	layout: 'fit',
	chartExtraStyles: {
		xAxis: {
			majorGridLines: { color: 0x999999, size: 1 }
		},
		yAxis: {
			titleRotation: -90
		},
		legend: {
			display: 'bottom',
			padding: 5,
			spacing: 2,
			font: { color: 0x000000, family: 'Arial', size: 12 },
			border: { size: 1, color: 0x999999 }
		}
	},
	seriesStyles: {
		red: {
			fillColor: 0xFFAAAA,
			borderColor: 0xAA3333,
			lineColor: 0xAA3333
		},
		yellow: {
			fillColor: 0xFFFFAA,
			borderColor: 0xFFAA33,
			lineColor: 0xFFAA33
		},
		green: {
			fillColor: 0xAAFFAA,
			borderColor: 0x33AA33,
			lineColor: 0x33AA33
		},
		blue: {
			fillColor: 0xAAAAFF,
			borderColor: 0x3333FF,
			lineColor: 0x3333FF
		}
	},
	initComponent: function () {
		this.items = this.buildChart();
		LSH.chartpanel.ChartPanelBaseCls.superclass.initComponent.call(this);
		this.relayEvents(this.getChart(), [ 'itemclick' ]);
	},
	buildChart: function () {
		return {};
	},
	buildSeries: function () {
		return [];
	},
	buildStore: function () {
		return {};
	},
	getChart: function () {
		return this.items.items[0];
	},
	getStore: function () {
		this.getChart().store();
	},
	loadStoreByParams: function (params) {
		params = params || {};
		this.getStore().load({
			params: params
		});
	},
	tipRenderer: function (chart, record, index, series) {
		var yearInfo = 'Year: ' + record.get('year');
		var empInfo = 'Employees ' + series.displayName + ': ' + record.get(series.yField);
		return yearInfo + '\n' + empInfo;
	}
});
