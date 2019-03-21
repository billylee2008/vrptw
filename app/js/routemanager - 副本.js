Ext.ns('VrpSolver');
VrpSolver.RouteManager = Ext.extend(Ext.Panel, {
	url: '/api/order/getAllByDldateAndDc',
	border: false,
	layout: {
		type: 'hbox',
		align: 'stretch'
	},
	params: { dldate: '', dc: '' },
	initComponent: function () {
		this.items = [
			this.buildOrderPanel(),
			this.buildRoutePanel(),
			this.buildMapPanel()
		];
		VrpSolver.RouteManager.superclass.initComponent.call(this);
	},
	buildOrderPanel: function () {
		return {
			xtype: 'panel',
			width: 200,
			border: false,
			style: 'border-right: 1px solid #99BBE8;',
			title: '订单选择',
			tools: [{
				id: 'gear',
				tooltip: '执行规划',
				scope: this,
				handler: this.planRoute
			}, {
				id: 'help',
				tooltip: '帮助'
			}],
			//layout: 'accordion',
			layout: {
				type: 'vbox',
				align: 'stretch'
			},
			items: [{
				xtype: 'container',
				layout: 'hbox',
				style: 'border-bottom: 1px solid #99BBE8;',
				height: 35,
				items: [{
					xtype: 'form',
					flex: 1,
					border: false,
					buttonAlign: 'center',
					buttons: [{
						xtype: 'button',
						text: '运输日期',
						id: 'dateButton',
						menu: {
							xtype: 'datemenu',
							format: 'Ymd',
							scope: this,
							handler: this.setDeliveryDate
						}
					}]
				}, {
					xtype: 'form',
					width: 100,
					border: false,
					buttonAlign: 'center',
					buttons: [{
						xtype: 'button',
						text: '发货点',
						id: 'siteButton',
						menu: {
							defaults: {
								scope: this,
								checked: false,
								group: 'centerChkGrp',
								checkHandler: this.setCenterSite
							},
							items: [{
								text: '东方海外广州DC',
								siteId: '1042828',
								btnText: '广州DC'
							}, {
								text: '东方海外深圳DC',
								siteId: '1042829',
								btnText: '深圳DC'
							}]
						}
					}]
				}]
			}, {
				//xtype: 'panel',
				flex: 1,
				border: false,
				title: '当日订单',
				//layout: 'fit',
				//items: {
					/*xtype: 'dataview',
					tpl: this.buildTemplate(),
					id: 'orderView',
					store: this.buildStore(),
					singleSelect: true,
					itemSelector: 'div.emplWrap',
					selectedClass: 'emplSelected',
					overClass: 'emplOver',
					style: 'overflow: auto; background-color: #FFFFFF;'*/
					xtype: 'treepanel',
					id: 'orderView',
					autoScroll: true,
					rootVisible : false,
					loader: new Ext.tree.TreeLoader({
						//root: 'data',
						dataUrl: this.url,
						baseParams: {
							dldate: '',
							dc: ''
						}
					}),
					root: {
						id: '-1',
						expanded: true
					}
				//}
			}]
		};
	},
	buildTemplate: function () {
		return new Ext.XTemplate(
			'<tpl for=".">',
				'<div class="emplWrap">',
					'{site}',
				'</div>',
			'</tpl>'
		);
	},
	buildStore: function () {
		return {
			xtype: 'jsonstore',
			root: 'data.content',
			autoLoad: this.autoLoadStore || false,
			url: this.url,
			fields: [ 'po', 'site', 'load', 'volumn' ]
		};
	},
	planRoute: function (evt, toolEl, panel) {
		if (this.params.dldate === '') {
			Ext.MessageBox.show({
				title: 'Error',
				msg: '请选择运输日期!',
				buttons: Ext.MessageBox.OK,
				icon: Ext.MessageBox.WARNING
			});
		} else if (this.params.dc === '') {
			Ext.MessageBox.show({
				title: 'Error',
				msg: '请选择发货点!',
				buttons: Ext.MessageBox.OK,
				icon: Ext.MessageBox.WARNING
			});
		} else {
			//console.log('Begin!!!');
			this.loadStoreByParams(this.params);
			//console.log('End!!!');
		}
	},
	setDeliveryDate: function (picker, choice) {
		this.params.dldate = Ext.util.Format.date(choice, picker.format);
		Ext.getCmp('dateButton').setText(this.params.dldate);
		this.loadStoreByParams(this.params);
	},
	setCenterSite: function (menuItem, checked) {
		if (checked === true) {
			this.params.dc = menuItem.siteId;
			Ext.getCmp('siteButton').setText(menuItem.btnText);
			this.loadStoreByParams(this.params);
		}
	},
	buildRoutePanel: function () {
		return {
			xtype: 'panel',
			width: 200,
			border: false,
			style: 'border-right: 1px solid #99BBE8;',
			title: '线路规划'
		};
	},
	buildMapPanel: function () {
		return {
			xtype: 'panel',
			flex: 1,
			border: false,
			title: '线路图'
		};
	},
	getView: function () {
		return Ext.getCmp('orderView');
	},
	getStore: function () {
		return this.getView().store;
	},
	getLoader: function () {
		//console.log(this.getView());
		return this.getView().getLoader();
	},
	getSelectedRecords: function () {
		return this.getView().getSelectedRecords();
	},
	getSelected: function () {
		return this.getView().getSelectedRecords()[0];
	},
	loadStoreByParams: function (params) {
		params = params || {};
		//this.getStore().load({ params: params });
		var loader = this.getLoader();
		//console.log(loader);
		loader.on('beforeload', function (loader, node) {
			this.baseParams.dldate = params.dldate;
			this.baseParams.dc = params.dc;
		});
		loader.load(this.getView().root);
		this.getView().expandAll();
		console.log(this.getView().title);
	}
});
Ext.reg('routemanager', VrpSolver.RouteManager);
