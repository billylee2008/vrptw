Ext.ns('VrpSolver');
VrpSolver.EmployeeManager = Ext.extend(Ext.Panel, {
	border: false,
	layout: 'border',
	defaults: {
		split: true
	},
	msgs: {
		immediateChanges: 'Warning! Changes are <span style="color: red;">immediate</span>.',
		errorsInForm: 'There are errors in the form. Please correct and try again.',
		empSavedSuccess: 'Saved {0}, {1} successfully.',
		fetchingDataFor: 'Fetching data for {0}, {1}',
		couldNotLoadData: 'Could not load data for {0}, {1}',
		saving: 'Saving {0}, {1}...',
		errorSavingData: 'There was an error saving the form.',
		deletingEmployee: 'Deleting employee {0}, {1}...',
		deleteEmpComfirm: 'Are you sure you want to delete employee {0}, {1}?',
		deleteEmpSuccess: 'Employee {0}, {1} was deleted successfully.',
		deleteEmpFaulure: 'Employee {0}, {1} was not deleted due to a failure.'
	},
	initComponent: function () {
		this.items = [
			this.buildSiteListView(), {
				region: 'center',
				border: false,
				layout: 'border',
				defaults: {
					split: true
				},
				items: [
					this.buildCostListView(),
					this.buildOrderListView()
				]
			}
		];
		VrpSolver.EmployeeManager.superclass.initComponent.call(this);
	},
	buildSiteListView: function () {
		return {
			region: 'west',
			xtype: 'sitelist',
			id: 'siteList',
			width: 420,
			border: false,
			style: 'border-right: 1px solid #99BBE8;',
			tbar: [ '站点信息', '->', {
				text: '保存',
				iconCls: 'icon-table_save',
				scope: this,
				handler: this.onSaveSiteRecord,
			}, {
				text: '追加',
				iconCls: 'icon-world_add',
				scope: this,
				handler: function () {
					delete this.rowIndexCtxMenu;
					this.onInsertSiteRecord();
				},
			}],
			listeners: {
				scope: this,
				click: this.onSiteListClick,
				rowcontextmenu: this.onSiteCtxMenu,
				destroy: function (thisComponent) {
					if (thisComponent.rowCtxMenu)
						thisComponent.rowCtxMenu.destroy();
				},
			}
		};
	},
	buildCostListView: function () {
		return {
			region: 'north',
			xtype: 'costlist',
			id: 'costList',
			height: 300,
			border: false,
			style: 'border-right: 1px solid #99BBE8;',
			tbar: [ '距离费用信息', '->', {
				text: '保存',
				iconCls: 'icon-table_save',
				scope: this,
				handler: this.onSaveCostRecord,
			}, {
				text: '追加',
				iconCls: 'icon-world_add',
				scope: this,
				handler: function () {
					delete this.rowIndexCtxMenu;
					this.onInsertCostRecord();
				},
			}],
			listeners: {
				scope: this,
				rowcontextmenu: this.onCostCtxMenu,
				destroy: function (thisComponent) {
					if (thisComponent.rowCtxMenu)
						thisComponent.rowCtxMenu.destroy();
				},
			}
		};
	},
	buildOrderListView: function () {
		return {
			region: 'center',
			xtype: 'orderlist',
			id: 'orderList',
			border: false,
			style: 'border-right: 1px solid #99BBE8;',
			tbar: [ '订单信息', '->', {
				text: '保存',
				iconCls: 'icon-table_save',
				scope: this,
				handler: this.onSaveOrderRecord,
			}, {
				text: '追加',
				iconCls: 'icon-world_add',
				scope: this,
				handler: function () {
					delete this.rowIndexCtxMenu;
					this.onInsertOrderRecord();
				},
			}],
			listeners: {
				scope: this,
				rowcontextmenu: this.onOrderCtxMenu,
				destroy: function (thisComponent) {
					if (thisComponent.rowCtxMenu)
						thisComponent.rowCtxMenu.destroy();
				},
			}
		};
	},
	onSiteListClick: function () {
		var siteList = Ext.getCmp('siteList');
		var selectedSite = siteList.getSelected();
		var costList = Ext.getCmp('costList');
		var orderList = Ext.getCmp('orderList');

		if (selectedSite.get('code') !== (costList.site || '')) {
			costList.setNameMap(siteList.buildNameMap());
			costList.loadStoreByParams({
				phantom: selectedSite.phantom,
				site: selectedSite.get('code')
			});
		}

		if (selectedSite.get('code') !== (orderList.site || '')) {
			orderList.setNameMap(siteList.buildNameMap());
			orderList.loadStoreByParams({
				phantom: selectedSite.phantom,
				site: selectedSite.get('code')
			});
		}
	},
	onSiteCtxMenu: function (thisComponent, rowIndex, evtObj) {
		evtObj.stopEvent();
		this.rowIndexCtxMenu = rowIndex;

		if (!thisComponent.rowCtxMenu) {
			thisComponent.rowCtxMenu = new Ext.menu.Menu({
				items: [{
					text: '删除',
					iconCls: 'icon-world_delete',
					scope: this,
					handler: this.onDeleteSiteRecord,
				},{
					text: '插入',
					iconCls: 'icon-world_add',
					scope: this,
					handler: this.onInsertSiteRecord,
				}],
			});
		}
		thisComponent.rowCtxMenu.showAt(evtObj.getXY());
	},
	onSaveSiteRecord: function () {
		var siteList = Ext.getCmp('siteList');
		siteList.getStore().save();
		siteList.refreshView();
	},
	onInsertSiteRecord: function () {
		var siteList = Ext.getCmp('siteList');
		var store = siteList.getStore();
		var newRecord = new store.recordType({
			newRecordId: Ext.id()
		});
		var selectedRowIndex = this.rowIndexCtxMenu || siteList.getSelectedRowIndex() || 0;
		store.insert(selectedRowIndex, newRecord);
		siteList.getView().startEditing(selectedRowIndex, 0);
	},
	onDeleteSiteRecord: function () {
		var rowIndexCtxMenu = this.rowIndexCtxMenu;
		Ext.MessageBox.confirm('系统提示', '确定要删除吗？', function (btn) {
			if (btn == 'yes') {
				//console.log(rowIndexCtxMenu);
				var store = Ext.getCmp('siteList').getStore();
				store.remove(store.getAt(rowIndexCtxMenu));
				//siteList.getStore().save();
			}
		});
	},
	onCostCtxMenu: function (thisComponent, rowIndex, evtObj) {
		evtObj.stopEvent();
		this.rowIndexCtxMenu = rowIndex;

		if (!thisComponent.rowCtxMenu) {
			thisComponent.rowCtxMenu = new Ext.menu.Menu({
				items: [{
					text: '删除',
					iconCls: 'icon-world_delete',
					scope: this,
					handler: this.onDeleteCostRecord,
				},{
					text: '插入',
					iconCls: 'icon-world_add',
					scope: this,
					handler: this.onInsertCostRecord,
				}],
			});
		}
		thisComponent.rowCtxMenu.showAt(evtObj.getXY());
	},
	onSaveCostRecord: function () {
		var costList = Ext.getCmp('costList');
		costList.getStore().save();
		costList.refreshView();
	},
	onInsertCostRecord: function () {
		var costList = Ext.getCmp('costList');
		var store = costList.getStore();
		var newRecord = new store.recordType({
			newRecordId: Ext.id()
		});
		var selectedRowIndex = this.rowIndexCtxMenu || costList.getSelectedRowIndex() || 0;
		store.insert(selectedRowIndex, newRecord);
		costList.getView().startEditing(selectedRowIndex, 0);
	},
	onDeleteCostRecord: function () {
		var rowIndexCtxMenu = this.rowIndexCtxMenu;
		Ext.MessageBox.confirm('系统提示', '确定要删除吗？', function (btn) {
			if (btn == 'yes') {
				//console.log(rowIndexCtxMenu);
				var store = Ext.getCmp('costList').getStore();
				store.remove(store.getAt(rowIndexCtxMenu));
				//costList.getStore().save();
			}
		});
	},
	onOrderCtxMenu: function (thisComponent, rowIndex, evtObj) {
		evtObj.stopEvent();
		this.rowIndexCtxMenu = rowIndex;

		if (!thisComponent.rowCtxMenu) {
			thisComponent.rowCtxMenu = new Ext.menu.Menu({
				items: [{
					text: '删除',
					iconCls: 'icon-world_delete',
					scope: this,
					handler: this.onDeleteOrderRecord,
				},{
					text: '插入',
					iconCls: 'icon-world_add',
					scope: this,
					handler: this.onInsertOrderRecord,
				}],
			});
		}
		thisComponent.rowCtxMenu.showAt(evtObj.getXY());
	},
	onSaveOrderRecord: function () {
		var orderList = Ext.getCmp('orderList');
		orderList.getStore().save();
		orderList.refreshView();
	},
	onInsertOrderRecord: function () {
		var orderList = Ext.getCmp('orderList');
		var store = orderList.getStore();
		var newRecord = new store.recordType({
			newRecordId: Ext.id()
		});
		var selectedRowIndex = this.rowIndexCtxMenu || orderList.getSelectedRowIndex() || 0;
		store.insert(selectedRowIndex, newRecord);
		orderList.getView().startEditing(selectedRowIndex, 0);
	},
	onDeleteOrderRecord: function () {
		var rowIndexCtxMenu = this.rowIndexCtxMenu;
		Ext.MessageBox.confirm('系统提示', '确定要删除吗？', function (btn) {
			if (btn == 'yes') {
				//console.log(rowIndexCtxMenu);
				var store = Ext.getCmp('orderList').getStore();
				store.remove(store.getAt(rowIndexCtxMenu));
				//orderList.getStore().save();
			}
		});
	},
	clearMask: function () {
		Ext.getBody().unmask();
	},
	cleanSlate: function() {
		Ext.getCmp('siteList').refreshView();
		Ext.getCmp('costList').clearView();
		Ext.getCmp('orderList').clearView();
	}
});
Ext.reg('employeemanager', VrpSolver.EmployeeManager);
