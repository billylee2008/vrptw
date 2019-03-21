Ext.ns('LSH.listpanel');
LSH.listpanel.DepartmentListView = Ext.extend(LSH.listpanel.ListPanelBaseCls, {
	url: '/api/dept/all',
	buildListView: function () {
		return {
			xtype: 'listview',
			singleSelect: true,
			store: this.buildStore(),
			style: 'background-color: #FFFFFF;',
			columns: [{
				header: 'Department Name',
				dataIndex: 'name'
			}]
		};
	},
	buildStore: function () {
		return {
			xtype: 'jsonstore',
			autoLoad: this.autoLoadStore || true,
			url: this.url,
			root: 'data',
			fields: [ 'name', 'id' ],
			sortInfo: {
				field: 'name',
				dir: 'ASC'
			}
		};
	}
});
Ext.reg('departmentlist', LSH.listpanel.DepartmentListView);
