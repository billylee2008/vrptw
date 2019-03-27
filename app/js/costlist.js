Ext.ns('LSH.listpanel');
LSH.listpanel.CostListView = Ext.extend(LSH.listpanel.ListPanelBaseCls, {
	url: '/api/cost/findSiteCost',
	buildListView: function () {
		var store = this.buildStore();
		return {
			xtype: 'editorgrid',
			columns: [{
				header: '站点',
				dataIndex: 'site2',
				sortable: true,
				editor: this.textFieldEditor,
				width: 70,
				hideable: false,
			}, {
				header: '站点名',
				dataIndex: 'name2',
				sortable: false,
			}, {
				header: '距离',
				dataIndex: 'minutes',
				sortable: false,
				editor: this.numberFieldEditor,
				width: 50,
				align: 'right',
			}, {
				header: '费用',
				dataIndex: 'tariff',
				sortable: false,
				editor: this.numberFieldEditor,
				width: 50,
				align: 'right',
			}],
			store: store,
			bbar: {
				xtype: 'paging',
				store: store,
				pageSize: 1000,
				displayInfo: true,
			},
			loadMask: true,
			stripeRow: true,
			viewConfig: {
				forceFit: true,
			},
			selModel: new Ext.grid.RowSelectionModel({
				singleSelect: true
			}),
			autoExpandColumn: 'name2',
			//style: 'background-color: #FFFFFF;',
			//style: 'overflow: auto; background-color: #FFFFFF;',
			/*listeners: {
				scope: this,
				afteredit: this.changeSiteName,
				exception: function () {
					console.log(arguments);
				}
			},*/
		};
	},
	buildStore: function () {
		return new Ext.data.JsonStore({
			//xtype: 'jsonstore',
			//url: this.url,
			autoLoad: this.autoLoadStore || false,
			root: 'records',
			totalProperty: 'totalCount',
			fields: [ 'id', 'site1', 'site2', 'name2', 'minutes', 'tariff' ],
			idProperty: 'id',
			//remoteSort: true,
			sortInfo: {
				field: 'site2',
				dir: 'ASC'
			},
			proxy: this.buildProxy(),
			autoSave: false,
			successProperty: 'success',
			writer: this.buildWriter(),
			listeners: {
				scope: this,
				load: this.displaySiteName,
				exception: function () {
					console.log(arguments);
				}
			},
		});
	},
	buildProxy: function () {
		return new Ext.data.HttpProxy({
			api: {
				read: '/api/cost/doQuery',
				create: '/api/cost/doCreate',
				update: '/api/cost/doUpdate',
				destroy: '/api/cost/doDelete',
			},
		});
	},
	displaySiteName: function (store, records, options) {
		var name, i = 0;
		for (; i < store.getCount(); i++) {
			name = this.nameMap['s' + store.getAt(i).get('site2')] || '';
			store.getAt(i).set('name2', name);
		}
		store.commitChanges();
		if (store.getCount() == 0)
			delete this.site;
		else
			this.site = store.baseParams.site;
		this.site = store.baseParams.site;
	},
	changeField: function (evtObj) {
		var store = this.getStore();
		if (evtObj.column == 0) {
			name = this.nameMap['s' + store.getAt(evtObj.row).get('site2')] || '';
			store.getAt(evtObj.row).set('name2', name);
		}
	},
});
Ext.reg('costlist', LSH.listpanel.CostListView);
