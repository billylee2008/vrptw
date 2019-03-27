Ext.ns('LSH.listpanel');
LSH.listpanel.SiteListView = Ext.extend(LSH.listpanel.ListPanelBaseCls, {
	url: '/api/site/abbr',
	buildListView: function () {
		var store = this.buildStore();
		return {
			xtype: 'editorgrid',
			columns: [{
				header: '站点',
				dataIndex: 'code',
				sortable: true,
				editor: this.textFieldEditor,
				width: 70,
				hideable: false,
			}, {
				header: '站点名',
				dataIndex: 'name',
				sortable: true,
				editor: this.textFieldEditor,
			}, {
				header: '精度',
				dataIndex: 'longitude',
				sortable: false,
				editor: this.textFieldEditor,
				width: 70,
				align: 'right',
			}, {
				header: '纬度',
				dataIndex: 'latitude',
				sortable: false,
				editor: this.textFieldEditor,
				width: 70,
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
			autoExpandColumn: 'name',
			//style: 'overflow: auto; background-color: #FFFFFF;',
		};
	},
	buildStore: function () {
		return new Ext.data.JsonStore({
			//xtype: 'jsonstore',
			//url: this.url,
			autoLoad: this.autoLoadStore || true,
			root: 'records',
			totalProperty: 'totalCount',
			fields: [ 'id', 'code', 'name', 'longitude', 'latitude' ],
			idProperty: 'id',
			//remoteSort: true,
			sortInfo: {
				field: 'code',
				dir: 'ASC'
			},
			proxy: this.buildProxy(),
			autoSave: false,
			successProperty: 'success',
			writer: this.buildWriter(),
			listeners: {
				scope: this,
				exception: function () {
					console.log(arguments);
				}
			},
		});
	},
	buildProxy: function () {
		return new Ext.data.HttpProxy({
			api: {
				read: '/api/site/doQuery',
				create: '/api/site/doCreate',
				update: '/api/site/doUpdate',
				destroy: '/api/site/doDelete',
			},
		});
	},
	buildNameMap: function (rebuild) {
		rebuild = rebuild || false;
		if (!this.nameMap || rebuild) {
			var nameMap = {};
			var store = this.getStore();

			for (var i = 0; i < store.getCount(); i++)
				nameMap['s' + store.getAt(i).get('code')] = store.getAt(i).get('name');
			this.nameMap = nameMap;
		}
		return this.nameMap;
	},
});
Ext.reg('sitelist', LSH.listpanel.SiteListView);
