Ext.ns('LSH.listpanel');
LSH.listpanel.EmployeeListView = Ext.extend(LSH.listpanel.ListPanelBaseCls, {
	url: '/api/cost/findSiteCost',
	buildListView: function () {
		return {
			xtype: 'listview',
			singleSelect: true,
			store: this.buildStore(),
			//style: 'background-color: #FFFFFF;',
			style: 'overflow: auto; background-color: #FFFFFF;',
			columns: [{
				header: '站点',
				dataIndex: 'site2',
				width: .3,
			}, {
				header: '站点名',
				dataIndex: 'name2',
				width: .4,
			}, {
				header: '距离',
				dataIndex: 'minutes',
				width: .15,
				align: 'right',
			}, {
				header: '费用',
				dataIndex: 'tariff',
				align: 'right',
			}]
		};
	},
	buildStore: function () {
		return {
			xtype: 'jsonstore',
			autoLoad: this.autoLoadStore || false,
			url: this.url,
			root: 'data',
			fields: [ 'site2', 'name2', 'minutes', 'tariff', 'id' ],
			sortInfo: {
				field: 'site2',
				dir: 'ASC'
			}
		};
	},
	addListeners: function() {
		this.getStore().addListener('load', this.displaySiteName, this);
	},
	setNameMap: function (nameMap) {
		this.nameMap = nameMap;
	},
	displaySiteName: function (store, records, options) {
		var name, i = 0;
		for (; i < store.getCount(); i++) {
			name = this.nameMap['s' + store.getAt(i).get('site2')] || '';
			store.getAt(i).set('name2', name);
		}
	},
});
Ext.reg('employeelist', LSH.listpanel.EmployeeListView);
