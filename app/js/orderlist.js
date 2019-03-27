Ext.ns('LSH.listpanel');
LSH.listpanel.OrderListView = Ext.extend(LSH.listpanel.ListPanelBaseCls, {
	url: '/api/order/findOrder',
	buildListView: function () {
		var store = this.buildStore();
		return {
			xtype: 'editorgrid',
			columns: [{
				header: '订单日期',
				dataIndex: 'dldate2',
				sortable: true,
				editor: this.dateFieldEditor,
				width: 50,
				hideable: false,
			}, {
				header: '站点',
				dataIndex: 'dc',
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
			fields: [ 'id', 'site', 'dc', 'dldate2', 'dldate', 'volumn', 'load', 'po' ],
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
				read: '/api/order/doQuery',
				create: '/api/order/doCreate',
				update: '/api/order/doUpdate',
				destroy: '/api/order/doDelete',
			},
		});
	},
	displaySiteName: function (store, records, options) {
		var name, i = 0;
		for (; i < store.getCount(); i++) {
			name = this.nameMap['s' + store.getAt(i).get('dc')] || '';
			store.getAt(i).set('dcname', name);
			store.getAt(i).set('dldate2', store.getAt(i).get('dldate'));
		}
		store.commitChanges();
		if (store.getCount() == 0)
			delete this.site;
		else
			this.site = store.baseParams.site;
		this.site = store.baseParams.site;
	},
	checkEditable: function (evtObj) {
		return (evtObj.record.phantom || evtObj.column != 0);
	},
	changeField: function (evtObj) {
		var store = this.getStore();
		if (evtObj.column == 0) {
			store.getAt(evtObj.row).set('dldate', Ext.util.Format.date(evtObj.value, 'Ymd'));
		}
		if (evtObj.column == 1) {
			name = this.nameMap['s' + store.getAt(evtObj.row).get('dc')] || '';
			store.getAt(evtObj.row).set('dcname', name);
		}
	},
});
Ext.reg('orderlist', LSH.listpanel.OrderListView);
