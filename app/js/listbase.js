Ext.ns('LSH.listpanel');
LSH.listpanel.ListPanelBaseCls = Ext.extend(Ext.Panel, {
	layout: 'fit',
	/*textFieldEditor: new Ext.form.TextField({
		maxLength: 15,
	}),*/
	textFieldEditor: {
		xtype: 'textfield',
		maxLength: 15,
	},
	numberFieldEditor: new Ext.form.NumberField({
		allowDecimals: false,
	}),
	/*floatFieldEditor: new Ext.form.NumberField({
		decimalPrecision: 10,
		allowDecimals: true,
	}),*/
	floatFieldEditor: {
		xtype: 'numberfield',
		decimalPrecision: 10,
		allowDecimals: true,
	},
	dateFieldEditor: new Ext.form.DateField({
		//xtype: 'datefield',
		format: 'Y-m-d',
		submitFormat: 'Y-m-d',
	}),
	initComponent: function () {
		Date.prototype.toString = function () {
			return this.format("Y-m-d");
		};
		/*Ext.PagingToolbar.prototype.doRefresh = function () {
			// Keep or remove these code
			var me = this, current = me.store.currentPage;
			console.log(me);
			console.log(current);
			console.log(me.store);
			if (me.fireEvent('beforechange', me, current) !== false) {
				me.store.loadPage(current);
			}
		};*/

		this.items = this.buildListView();
		LSH.listpanel.ListPanelBaseCls.superclass.initComponent.call(this);

		this.relayEvents(this.getView(), [ 'click' ]);
		this.relayEvents(this.getView(), [ 'rowcontextmenu' ]);
		this.relayEvents(this.getStore(), [ 'load' ]);

		if (this.addListeners)
			this.addListeners();
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
		try {
			return this.getView().getSelectionModel().getSelections();
		} catch (e) {
			return this.getView().getSelectedRecords();
		}
	},
	getSelected: function () {
		try {
			return this.getView().getSelectionModel().getSelected();
		} catch (e) {
			return this.getView().getSelectedRecords()[0];
		}
	},
	getSelectedRowIndex: function () {
		try {
			return this.getView().getSelectionModel().last;
		} catch (e) {
		}
	},
	loadStoreByParams: function (params) {
		params = params || {};
		if (params.phantom || false)
			this.clearView();
		else {
			this.getStore().baseParams = params;
			this.getStore().load();
		}
	},
	refreshView: function () {
		//this.getView().getBottomToolbar().readPage(0);
		//this.getView().getBottomToolbar().moveLast();
		this.getView().getBottomToolbar().getPageData();
		this.getStore().reload();
		console.log(this.getView().getBottomToolbar());
		//this.getView().getBottomToolbar().store().reload();
	},
	selectById: function (id) {
		var view = this.getView();
		id = id || false;
		if (id) {
			var ind = view.store.find(view.store.idProperty || 'id', id);
			try {
				view.getSelectionModel().selectRow(ind);
			} catch (e) {
				view.select(ind);
			}
		}
	},
	buildWriter: function () {
		return new Ext.data.JsonWriter({
			writeAllFields: true
		});
	},
	setNameMap: function (nameMap) {
		this.nameMap = nameMap;
	},
	findNameMapById: function (id) {
		id = id || false;
		var name;
		if (id)
			name = this.nameMap['s' + id];
		return name || ['','',-1];
	},
	findNameMapByCode: function (code) {
		code = code || false;
		if (code) {
			for (var key in this.nameMap) {
				var name = this.nameMap[key];
				if (name[0] === code)
					return name;
			}
		}
		return ['','',-1];
	},
	addListeners: function () {
		this.getView().on('beforeedit', this.checkEditable, this)
		this.getView().on('afteredit', this.changeField, this)
	},
	checkEditable: function (evtObj) {
		return (evtObj.record.phantom || evtObj.column != 0);
	},
	changeField: function (evtObj) {
	},
});
