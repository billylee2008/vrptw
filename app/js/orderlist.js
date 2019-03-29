Ext.ns('LSH.listpanel');
LSH.listpanel.OrderListView = Ext.extend(LSH.listpanel.ListPanelBaseCls, {
	url: '/api/order/findOrder',
	buildListView: function () {
		var store = this.buildStore();
		return {
			xtype: 'editorgrid',
			columns: [{
				header: '订单日期',
				dataIndex: 'dldate',
				sortable: true,
				editor: this.dateFieldEditor,
				width: 100,
				hideable: false,
			}, {
				header: '站点',
				dataIndex: 'dccode',
				sortable: true,
				editor: this.textFieldEditor,
				width: 70,
				hideable: false,
			}, {
				header: '站点名',
				dataIndex: 'dcname',
				sortable: false,
			}, {
				header: '体积',
				dataIndex: 'volumn',
				sortable: false,
				editor: this.floatFieldEditor,
				width: 50,
				align: 'right',
			}, {
				header: '重量',
				dataIndex: 'load',
				sortable: false,
				editor: this.floatFieldEditor,
				width: 50,
				align: 'right',
			}, {
				header: '订单号',
				dataIndex: 'po',
				sortable: true,
				editor: this.textFieldEditor,
				width: 70,
			}],
			store: store,
			bbar: {
				xtype: 'paging',
				store: store,
				pageSize: 1000,
				displayInfo: true,
				listeners: {
					scope: this,
					load: function () {
						console.log(arguments);
					}
				},
			},
			loadMask: true,
			stripeRow: true,
			viewConfig: {
				forceFit: true,
			},
			selModel: new Ext.grid.RowSelectionModel({
				singleSelect: true
			}),
			autoExpandColumn: 'dcname',
			//style: 'background-color: #FFFFFF;',
			//style: 'overflow: auto; background-color: #FFFFFF;',
		};
	},
	buildStore: function () {
		return new Ext.data.JsonStore({
			//xtype: 'jsonstore',
			//url: this.url,
			autoLoad: this.autoLoadStore || false,
			root: 'records',
			totalProperty: 'totalCount',
			fields: [ 'id', 'site', 'dc', 'dccode', 'dcname', 'dldate', 'volumn', 'load', 'po' ],
			idProperty: 'id',
			//remoteSort: true,
			sortInfo: {
				field: 'dldate',
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
				read: '/api/vrp/order/doQuery',
				create: '/api/vrp/order/doCreate',
				update: '/api/vrp/order/doUpdate',
				destroy: '/api/vrp/order/doDelete',
			},
		});
	},
	displaySiteName: function (store, records, options) {
		var name, i = 0;
		for (; i < store.getCount(); i++) {
			name = this.findNameMapById(store.getAt(i).get('dc'));
			store.getAt(i).set('dccode', name[0]);
			store.getAt(i).set('dcname', name[1]);
		}
		store.commitChanges();
		if (store.getCount() == 0)
			delete this.site;
		else
			this.site = store.baseParams.site;
		this.site = store.baseParams.site;
	},
	checkEditable: function (evtObj) {
		return (evtObj.record.phantom || (evtObj.column != 0 && evtObj.column != 1));
	},
	changeField: function (evtObj) {
		var store = this.getStore();
		if (evtObj.column == 1) {
			var name = this.findNameMapByCode(evtObj.value);
			store.getAt(evtObj.row).set('dcname', name[1]);
			store.getAt(evtObj.row).set('dc', name[2]);
		}
	},
});
Ext.reg('orderlist', LSH.listpanel.OrderListView);
