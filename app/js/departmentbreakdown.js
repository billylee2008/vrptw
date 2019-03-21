Ext.ns('LSH.chartpanel');
LSH.chartpanel.DepartmentBreakdown = Ext.extend(LSH.chartpanel.ChartPanelBaseCls, {
	url: '/api/stat/department',
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
Ext.reg('departmentbreakdown', LSH.chartpanel.DepartmentBreakdown);
