Ext.ns('VrpSolver');
VrpSolver.Dashboard = Ext.extend(Ext.Container, {
	border: false,
	layout: {
		type: 'hbox',
		align: 'stretch'
	},
	defaults: {
		style: 'background-color: #DFE8F6; padding: 10px;',
		flex: 1
	},
	msgs: {
		deptBreakdown: 'Department breakdown of year: {0}'
	},
	initComponent: function () {
		this.items = [{
			xtype: 'companysnapshot',
			title: 'Company Snapshot',
			listeners: {
				itemclick: this.onCompanySnapshotItemClick,
				scope: this
			}
		}, {
			xtype: 'departmentbreakdown',
			title: 'Department Breakdown',
			itemId: 'departmentbreakdown'
		}];
		VrpSolver.Dashboard.superclass.initComponent.call(this);
	},
	onCompanySnapshotItemClick: function (evtObj) {
		var record = evtObj.component.store.getAt(evtObj.index);
		var dptBrkDwnChart = this.getComponent('departmentbreakdown');
		dptBrkDwnChart.loadStoreByParams({
			year: record.get('year')
		});
		var msg = String.format(this.msgs.deptBreakdown, record.get('year'));
		dptBrkDwnChart.setTitle(msg);
	}
});
Ext.reg('dashboard', VrpSolver.Dashboard);
