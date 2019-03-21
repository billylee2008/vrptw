Ext.ns('LSH.chartpanel');
LSH.chartpanel.CompanySnapshot = Ext.extend(LSH.chartpanel.ChartPanelBaseCls, {
	url: '/api/stat/year',
	buildChart: function () {
		return {};
	},
	buildSeries: function () {
		return [];
	},
	buildStore: function () {
		return {};
	}
});
Ext.reg('companysnapshot', LSH.chartpanel.CompanySnapshot);
