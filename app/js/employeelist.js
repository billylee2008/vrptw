Ext.ns('LSH.listpanel');
LSH.listpanel.EmployeeListView = Ext.extend(LSH.listpanel.ListPanelBaseCls, {
	url: '/api/emp/dept',
	buildListView: function () {
		return {
			xtype: 'listview',
			singleSelect: true,
			store: this.buildStore(),
			style: 'background-color: #FFFFFF;',
			columns: [{
				header: 'Last Name',
				dataIndex: 'lastName'
			}, {
				header: 'First Name',
				dataIndex: 'firstName'
			}]
		};
	},
	buildStore: function () {
		return {
			xtype: 'jsonstore',
			autoLoad: this.autoLoadStore || false,
			url: this.url,
			root: 'data',
			fields: [ 'lastName', 'firstName', 'id' ],
			sortInfo: {
				field: 'lastName',
				dir: 'ASC'
			}
		};
	}
});
Ext.reg('employeelist', LSH.listpanel.EmployeeListView);
