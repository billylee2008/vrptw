Ext.ns('LSH.listpanel');
LSH.listpanel.ListPanelBaseCls = Ext.extend(Ext.Panel, {
	layout: 'fit',
	initComponent: function () {
		this.items = this.buildListView();
		LSH.listpanel.ListPanelBaseCls.superclass.initComponent.call(this);
		this.relayEvents(this.getView(), [ 'click' ]);
		this.relayEvents(this.getStore(), [ 'load' ]);
	},
	buildListView: function () {
		return {};
	},
	buildStore: function () {
		return {};
	},
	clearView: function () {
		this.getStore().removeAll();
	},
	createAndSelectRecord: function (o) {
		var view = this.getView();
		var record = new view.store.recordType(o);
		view.store.addSorted(record);
		var index = view.store.indexOf(record);
		view.select(index);
		return record;
	},
	clearSelections: function () {
		return this.getView().clearSelections();
	},
	getView: function () {
		return this.items.items[0];
	},
	getStore: function () {
		return this.getView().store;
	},
	getSelectedRecords: function () {
		return this.getView().getSelectedRecords();
	},
	getSelected: function () {
		return this.getView().getSelectedRecords()[0];
	},
	loadStoreByParams: function (params) {
		params = params || {};
		this.getStore().load({ params: params });
	},
	refreshView: function () {
		this.getStore().reload();
	},
	selectById: function (id) {
		var view = this.getView();
		id = id || false;
		if (id) {
			var ind = view.store.find('id', id);
			view.select(ind);
		}
	}
});
