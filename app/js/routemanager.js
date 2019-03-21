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
			tbar: [{
				xtype: 'tbtext',
				//style: 'color: blue; font-weight: bold;'
				text: '订单选择'
			}, '->', {
				//text: '车型确认',
				tooltip: '车型确认',
				iconCls: 'icon-script_gear',
				scope: this,
				handler: this.onClickVehicleButton
			}, {
				id: 'core',
				xtype: 'splitbutton',
				text: '<span style="color: blue; font-weight: bold;">智能规划</span>',
				iconCls: 'icon-layout_edit',
				scope: this,
				handler: this.onClickPlanButton,
				menu: {
					defaults: {},
					items: [{
						xtype: 'menutextitem',
						style: {
							'border': '1px solid #999999',
							'margin': '0px 0px 1px 0px',
							'display': 'block',
							'padding': '3px',
							'font-weight': 'bold',
							'font-size': '12px',
							'text-align': 'center',
							'background-color': '#D6E3F2'
						},
						text: '设置约束条件'
					}, '-', {
						iconCls: 'icon-link_add',
						text: '运行时长限制',
						scope: this,
						handler: this.onTimeContrainMenu
					}]
				}
			}],
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
							handler: this.onSelectDeliveryDate
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
						handler: this.onClickSiteButton,
						menu: {
							defaults: {
								scope: this,
								checked: false,
								group: 'centerChkGrp',
								checkHandler: this.onSelectCenterSite
							},
							items: [{
								xtype: 'menutextitem',
								style: {
									'border': '1px solid #999999',
									'margin': '0px 0px 1px 0px',
									'display': 'block',
									'padding': '3px',
									'font-weight': 'bold',
									'font-size': '12px',
									'text-align': 'center',
									'background-color': '#D6E3F2'
								},
								text: '请设置发货点'
							}]
						}
					}]
				}]
			}, {
				flex: 1,
				border: false,
				tbar: [ '当日订单', '->', {
					//text: '获取',
					tooltip: '获取当日订单',
					iconCls: 'icon-cart_put',
					scope: this,
					handler: this.onClickLoadOrderButton
				}, {
					//text: '追加',
					tooltip: '追加当日订单',
					iconCls: 'icon-cart_add',
					scope: this,
					handler: this.onClickAddOrderButton
				}],
				xtype: 'treepanel',
				checkModel: 'single',
				id: 'orderView',
				//ddGroup: 'siteDDGroup',
				autoScroll: true,
				rootVisible : false,
				//ddAppendOnly : true,
				enableDD: true,
				loader: new Ext.tree.TreeLoader({
					dataUrl: this.url,
					baseParams: {
						dldate: '',
						dc: ''
					}
				}),
				root: {
					id: '-1',
					text: '发货点',
					draggable: false,
					type: 'folder',
					cls: 'folder',
					leaf: false,
					root: true,
					expanded: true
				},
				listeners: {
					scope: this,
					contextmenu: this.onCtxMenuOrder
				}
			}]
		};
	},
	onClickVehicleButton: function () {
		if (!this.vehicleForm)
			this.vehicleForm = this.buildVehicleForm();
		var form = this.vehicleForm;
		form.on({
			scope: this,
			render: {
				single: true,
				fn: function () {
					form.items.items[0].getForm().load({
						url: '/api/vehicle/all',
						scope: this,
						success: function (form, action) {
							this.params.vehicle = form.getValues();
						},
						failure: function (form, action) {
							Ext.MessageBox.alert("装载失败", action.result.errorMessage);
						}
					});
				}
			}
		});
		form.show();
	},
	buildVehicleForm: function () {
		return new Ext.Window({
			id: 'frmVehicle',
			title: '车型信息',
			plain: true,
			width: 330,
			height: 170,
			resizable: false,
			shadow: true,
			modal: true,
			closable: false,
			animCollapse: true,
			items : {
				xtype: 'form',
				url: '/api/vehicle/put',
				trackResetOnLoad: true,
				labelAlign: 'right',
				labelWidth: 140,
				frame: true,
				buttonAlign: 'center',
				bodyStyle: 'padding: 6px 0px 0px 6px;',
				defaultType: 'numberfield',
				items: [{
					fieldLabel: '最大装载体积(立方米)',
					width: 120,
					allowBlank: false,
					//readOnly: true,
					allowDecimals: true,
					decimalPrecision: 2,
					style: 'text-align: right;',
					name: 'volumn'
				}, {
					fieldLabel: '最大装载重量(吨)',
					width: 120,
					allowBlank: false,
					//readOnly: true,
					allowDecimals: true,
					decimalPrecision: 2,
					style: 'text-align: right;',
					name: 'load'
				}, {
					fieldLabel: '满载率',
					width: 120,
					allowBlank: false,
					//readOnly: true,
					allowDecimals: true,
					decimalPrecision: 2,
					style: 'text-align: right;',
					name: 'ratio'
				}, {
					xtype: 'textfield',
					name: 'id',
					hidden: true
				}],
				buttons: [{
					text: '保存',
					scope: this,
					handler: function () {
						var form = Ext.getCmp('frmVehicle').getComponent(0).getForm();
						if (!form.isValid())
							Ext.MessageBox.alert('系统提示', '请修改无效的数据。');
						else if (!form.isDirty())
							Ext.getCmp('frmVehicle').hide();
						else {
							Ext.getBody().mask('Saving...', 'x-mask-loading');
							form.submit({
								scope: this,
								success: function () {
									Ext.getBody().unmask();
									Ext.getCmp('frmVehicle').hide();
									this.params.vehicle = Ext.apply(this.params.vehicle, form.getValues());
									Ext.MessageBox.alert('系统提示', '保存成功。');
								},
								failure: function () {
									Ext.getBody().unmask();
									Ext.MessageBox.alert('系统提示', '保存失败，请重新提交。');
								}
							});
						}
					}
				}, {
					text: '重置',
					handler: function () {
						Ext.getCmp('frmVehicle').getComponent(0).getForm().reset();
					}
				}, {
					tooltip: 'tooltip test',
					text: '关闭',
					handler: function () {
						var form = Ext.getCmp('frmVehicle').getComponent(0).getForm();
						if (!form.isDirty())
							Ext.getCmp('frmVehicle').hide();
						else
							Ext.MessageBox.confirm('系统提示', '放弃已修改的数据吗？', function (btn) {
								if (btn === 'yes') {
									Ext.getCmp('frmVehicle').hide();
									form.reset();
								}
							}, this);
					}
				}]
			}
		});
	},
	onClickPlanButton: function (evt, toolEl, panel) {
		view = this.getView();
		console.log(view);
		view.sort = function (a, b) {
			console.log(a);
			console.log(b);
			return 0;
		};
		var sorter = new Ext.tree.TreeSorter(view, {
			sort: function (a, b) {
				console.log(a);
				console.log(b);
				return 0;
			},
			sortFn: function (a, b) {
				console.log(a);
				console.log(b);
				return 0;
			},
			property: 'id',
			dir: 'ASC'
		});
		console.log(sorter);
		//sorter.doSort();
		if (Ext.getCmp('orderView').root.childNodes.length <= 0) {
			Ext.MessageBox.show({
				title: 'Error',
				msg: '当前没有订单!',
				buttons: Ext.MessageBox.OK,
				icon: Ext.MessageBox.WARNING
			});
			return;
		}

		this.clearRoute();
		Ext.MessageBox.alert('系统提示', '敬请期待!!!');
	},
	onTimeContrainMenu: function () {
		
	},
	onSelectDeliveryDate: function (picker, choice) {
		this.params.dldate = Ext.util.Format.date(choice, picker.format);
		Ext.getCmp('dateButton').setText(this.params.dldate);
		this.loadStoreByParams(this.params);
	},
	onClickSiteButton: function (btn) {
		if (btn.menu.items.items[0].xtype === 'menutextitem') {
			var store = new Ext.data.JsonStore({
				url: '/api/site/getCenterSites',
				root: 'data',
				fields: [ 'name', 'code', 'abbr' ]
			});
			store.addListener('load', function (store, records, options) {
				for (var i = 0; i < store.getCount(); i++) {
					btn.menu.addMenuItem(Ext.apply(btn.menu.defaults, {
						//text: store.getAt(i).get('name'),
						text: store.getAt(i).get('abbr'),
						siteId: store.getAt(i).get('code'),
						btnText: store.getAt(i).get('abbr')
					}));
				}
				if (store.getCount() > 0)
					btn.menu.remove(btn.menu.items.items[0]);
			}, this);
			store.load();
		}
	},
	onSelectCenterSite: function (menuItem, checked) {
		if (checked === true) {
			this.params.dc = menuItem.siteId;
			this.params.dcText = menuItem.text;
			Ext.getCmp('siteButton').setText(menuItem.btnText);
			this.loadStoreByParams(this.params);
		}
	},
	onClickLoadOrderButton: function (evt, toolEl, panel) {
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
			this.loadStoreByParams(this.params);
		}
	},
	onClickAddOrderButton: function (evt, toolEl, panel) {
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
			Ext.MessageBox.alert('系统提示', 'onClickAddOrderButton TODO!!!');
		}
	},
	onCtxMenuOrder: function (node, evtObj) {
		node.select();
		this.params.view = 'orderView';
		evtObj.stopEvent();
		if (!this.ctxMenuOrder)
			this.ctxMenuOrder = this.buildCtxMenuOrder();

		var ctxMenuOrder = this.ctxMenuOrder;
		var checkItem = ctxMenuOrder.getComponent('check');

		if (node.leaf) {
			checkItem.setChecked(!node.draggable);
			checkItem.enable();
		} else {
			checkItem.setChecked(false);
			checkItem.disable();
		}
		ctxMenuOrder.showAt(evtObj.getXY());
	},
	buildCtxMenuOrder: function () {
		return new Ext.menu.Menu({
			items: [{
				itemId: 'edit',
				text: '变更',
				iconCls: 'icon-cart_edit',
				scope: this,
				handler: this.onChangeOrderMenu
			}, {
				itemId: 'delele',
				text: '删除',
				iconCls: 'icon-cart_delete',
				scope: this,
				handler: this.onChangeOrderMenu
			}, {
				itemId: 'check',
				text: '固定',
				checked: false,
				scope: this,
				checkHandler: this.onCheckoutOrderMenu
			}]
		});
	},
	onChangeOrderMenu: function () {
		
	},
	onDeleteOrderMenu: function () {
		
	},
	onCheckoutOrderMenu: function (menuItem, choice) {
		var treePanel = Ext.getCmp(this.params.view);
		var selectedNode = treePanel.getSelectionModel().getSelectedNode();
		if (selectedNode.leaf)
			selectedNode.draggable = !choice;
	},
	buildRoutePanel: function () {
		return {
			xtype: 'treepanel',
			checkModel: 'single',
			width: 200,
			id: 'routeView',
			border: false,
			style: 'border-right: 1px solid #99BBE8;',
			autoScroll: true,
			rootVisible : false,
			//ddGroup: 'siteDDGroup',
			//ddAppendOnly: true,
			enableDD: true,
			loader: false,
			dropConfig: {
				isValidDropPoint: function (nodeData, pt, dd, evtObj, data) {
					//var treeDropZone = Ext.tree.TreeDropZone;
					var isValidDrpPnt = Ext.tree.TreeDropZone.prototype.isValidDropPoint;
					if (!nodeData)
						return false;
					var tgtNd = nodeData.node;
					if (!tgtNd || !tgtNd.leaf || (!tgtNd.draggable && pt === 'above'))
						return false;
					return isValidDrpPnt.apply(tgtNd.getOwnerTree().dropZone, arguments);
				}
			},
			root: new Ext.tree.TreeNode({
				text: '线路方案',
				expanded: true,
				//dropable: false,
				draggable: false,
				leaf: false,
				id: '-1'
			}),
			tbar: ['线路方案', '->', {
				//text: '追加',
				tooltip: '追加线路',
				iconCls: 'icon-car_add',
				scope: this,
				handler: this.onClickAddRouteButton
			}, {
				//text: '统计',
				tooltip: '方案统计',
				iconCls: 'icon-chart_pie',
				scope: this,
				handler: this.onClickStatusButton
			}, {
				tooltip: '方案保存',
				iconCls: 'icon-server_database',
				scope: this,
				handler: this.onClickSaveButton
			}],
			listeners: {
				scope: this,
				contextmenu: this.onCtxMenuRoute
			}
		};
	},
	onClickAddRouteButton: function () {
		if (Ext.getCmp('orderView').root.childNodes.length <= 0) {
			Ext.MessageBox.show({
				title: 'Error',
				msg: '当前没有订单!',
				buttons: Ext.MessageBox.OK,
				icon: Ext.MessageBox.WARNING
			});
			return;
		}

		Ext.MessageBox.prompt("系统提示", "请输入线路名：", function (btn, txt) {
			if (btn !== 'ok')
				return;
			txt = (txt || '').trim();
			if (txt === '')
				txt = '新线路';
			var view = Ext.getCmp('routeView');
			view.root.appendChild(new Ext.tree.TreeNode({
				id: Ext.id(),
				expanded: true,
				//dropable: false,
				draggable: false,
				leaf: false,
				text: txt
			}));
			view.root.lastChild.appendChild(new Ext.tree.TreeNode({
				id: Ext.id(),
				draggable: false,
				leaf: true,
				site: this.params.dc,
				text: this.params.dcText
			}));
		}, this);
	},
	onClickStatusButton: function () {
		var root = Ext.getCmp('routeView').root;
		var count = root.childNodes.length;
		var routes = [];
		var sites = [];
		var route, numOfSites, totalLoad, totalVolumn;

		for (var j = 0; j < count; j++) {
			if (root.childNodes[j].childNodes.length <= 1)
				continue;
			route = root.childNodes[j].childNodes[0].attributes.site;
			numOfSites = 0;
			totalLoad = totalVolumn = 0.0;

			for (var i = 1; i < root.childNodes[j].childNodes.length; i++) {
				route += '-' + root.childNodes[j].childNodes[i].attributes.id;
				numOfSites++;
				totalLoad += (root.childNodes[j].childNodes[i].attributes.load || 0);
				totalVolumn += (root.childNodes[j].childNodes[i].attributes.volumn || 0);
			}

			routes.push(route);
			sites.push({
				text: root.childNodes[j].attributes.text,
				sites: numOfSites,
				load: totalLoad,
				volumn: totalVolumn
			});
		}
		if (sites.length <= 0) {
			Ext.MessageBox.alert('系统提示', '请先设置线路！');
			return;
		}

		if (!this.totalStatusStore)
			this.totalStatusStore = this.buildTotalStatusStore();
		Ext.getBody().mask('计算中...', 'x-mask-loading');
		this.totalStatusStore.load({
			sites: sites,
			params: {
				siteLoad: this.params.siteLoad || 30,
				siteUnload: this.params.siteUnload || 10,
				routes: routes
			}
		}, this);
	},
	buildTotalStatusStore: function () {
		var store = new Ext.data.JsonStore({
			url: '/api/cost/getTotalCost',
			root: 'data',
			fields: [ 'text', 'sites', 'load', 'volumn', 'minutes', 'tariff' ]
		});
		store.addListener('load', function (store, records, options) {
			var rawData = [];
			for (var i = 0; i < store.getCount(); i++) {
				rawData.push({
					text: options.sites[i].text,
					sites: options.sites[i].sites,
					load: options.sites[i].load || 0,
					volumn: options.sites[i].volumn || 0,
					costTime: store.getAt(i).get('minutes'),
					costFee: store.getAt(i).get('tariff')
				});
			}
			Ext.getBody().unmask();
			//console.log(rawData);
			this.showRouteStatus('routestatuslist', rawData, '全体线路方案');
		}, this);
		return store;
	},
	onClickSaveButton: function () {
		var root = Ext.getCmp('routeView').root;
		var count = root.childNodes.length;
		var route, routes = [];

		for (var j = 0; j < count; j++) {
			if (root.childNodes[j].childNodes.length <= 1)
				continue;
			route = root.childNodes[j].childNodes[0].attributes.site;
			for (var i = 1; i < root.childNodes[j].childNodes.length; i++)
				route += '-' + root.childNodes[j].childNodes[i].attributes.id;
			routes.push(route);
		}
		if (routes.length <= 0) {
			Ext.MessageBox.alert('系统提示', '请先设置线路！');
			return;
		}

		Ext.getBody().mask('方案生成中...', 'x-mask-loading');
		Ext.Ajax.request({
			url: '/api/cost/saveRoutes',
			params: {
				routes: routes
			},
			callback: this.workspace.onAfterAjaxReq,
			succCallback: function (result) {
				this.downloadSolution(result.data);
				Ext.MessageBox.alert('系统提示', '方案生成成功！');
			},
			/*failure: function (result) {
				Ext.getBody().unmask();
				//错误处理
				Ext.MessageBox.show({
					title: '提示',
					msg: result.msg,
					buttons: Ext.MessageBox.OK,
					icon: Ext.MessageBox.ERROR,
					maxWidth: 500,
					minWidth: 200
				});
			}*/
			scope: this,
		});

		/*if (!this.saveRouteStore)
			this.saveRouteStore = this.buildSaveRouteStore();
		Ext.getBody().mask('保存中...', 'x-mask-loading');
		this.saveRouteStore.load({
			params: {
				routes: routes
			}
		}, this);*/
		//this.downloadSolution(routes);
	},
	buildSaveRouteStore: function () {
		var store = new Ext.data.JsonStore({
			url: '/api/cost/saveRoutes',
			root: 'data',
			fields: [ 'text', 'sites', 'load', 'volumn', 'minutes', 'tariff' ]
		});
		store.addListener('load', function (store, records, options) {
			Ext.getBody().unmask();
			//console.log(rawData);
			Ext.MessageBox.alert('系统提示', '线路方案保存成功！');
		}, this);
		return store;
	},
	onCtxMenuRoute: function (node, evtObj) {
		node.select();
		this.params.view = 'routeView';
		evtObj.stopEvent();
		if ((node.attributes.site || '') === this.params.dc)
			return;

		if (!this.ctxMenuRoute)
			this.ctxMenuRoute = this.buildCtxMenuRoute();

		var ctxMenuRoute = this.ctxMenuRoute;
		var deleteItem = ctxMenuRoute.getComponent('delete');
		var renameItem = ctxMenuRoute.getComponent('rename');
		var checkItem = ctxMenuRoute.getComponent('check');
		var removeItem = ctxMenuRoute.getComponent('remove');
		var valueItem = ctxMenuRoute.getComponent('value');
		var drawItem = ctxMenuRoute.getComponent('draw');

		if (node.leaf) {
			renameItem.disable();
			deleteItem.disable();
			checkItem.setChecked(!node.draggable);
			checkItem.enable();
			if (!node.draggable)
				removeItem.disable();
			else
				removeItem.enable();
			valueItem.enable();
			drawItem.enable();
		} else {
			renameItem.enable();
			deleteItem.enable();
			checkItem.setChecked(true);
			checkItem.disable();
			removeItem.disable();
			if (node.childNodes.length < 2) {
				valueItem.disable();
				drawItem.disable();
			} else {
				valueItem.enable();
				drawItem.enable();
			}
		}
		ctxMenuRoute.showAt(evtObj.getXY());
	},
	buildCtxMenuRoute: function () {
		return new Ext.menu.Menu({
			items: [{
				itemId: 'rename',
				text: '命名',
				iconCls: 'icon-car',
				scope: this,
				handler: this.onRenameRouteMenu
			}, {
				itemId: 'delete',
				text: '删除',
				iconCls: 'icon-car_delete',
				scope: this,
				handler: this.onDeleteRouteMenu
			}, '-', {
				itemId: 'check',
				text: '固定',
				checked: false,
				scope: this,
				checkHandler: this.onCheckoutOrderMenu
			}, {
				itemId: 'remove',
				text: '卸载',
				iconCls: 'icon-cart_remove',
				scope: this,
				handler: this.onRemoveOrderMenu
			}, '-', {
				itemId: 'value',
				text: '统计',
				iconCls: 'icon-chart_pie',
				scope: this,
				handler: this.onStatusRouteMenu
			}, {
				itemId: 'draw',
				text: '描画',
				iconCls: 'icon-chart_line',
				scope: this,
				handler: this.onDrawMapMenu
			}]
		});
	},
	onRenameRouteMenu: function () {
		var treePanel = Ext.getCmp('routeView');
		var selectedNode = treePanel.getSelectionModel().getSelectedNode();
		Ext.MessageBox.prompt("系统提示", "请输入线路名：", function (btn, txt) {
			txt = (txt || '').trim();
			if (txt !== '') {
				selectedNode.setText(txt);
			}
		}, this);
	},
	onDeleteRouteMenu: function () {
		var treePanel = Ext.getCmp('routeView');
		var selectedNode = treePanel.getSelectionModel().getSelectedNode();
		Ext.MessageBox.confirm('系统提示', '确定要删除该线路吗？', function (btn) {
			if (btn === 'yes') {
				var view = this.getView();
				var isFirst = true;
				var lastChild = null;
				for (var i = selectedNode.childNodes.length - 1; i > 0; i--) {
					var child = selectedNode.childNodes[i];
					child.ui.rendered = false;
					selectedNode.removeChild(child);
					if (isFirst) {
						isFirst = false;
						view.getRootNode().appendChild(child);
					} else {
						view.getRootNode().insertBefore(child, lastChild);
					}
					lastChild = child;
				}
				selectedNode.removeChild(selectedNode.childNodes[0]);
				selectedNode.remove();
				view.getUpdater().refresh();
			}
		}, this);
	},
	onRemoveOrderMenu: function () {
		var treePanel = Ext.getCmp('routeView');
		var selectedNode = treePanel.getSelectionModel().getSelectedNode();
		var parentNode = selectedNode.parentNode;
		selectedNode.remove();
		selectedNode.ui.rendered = false;
		var view = this.getView();
		view.getRootNode().appendChild(selectedNode);
		view.getUpdater().refresh();
	},
	onStatusRouteMenu: function () {
		var treePanel = Ext.getCmp('routeView');
		var selectedNode = treePanel.getSelectionModel().getSelectedNode();
		if (selectedNode.leaf)
			selectedNode = selectedNode.parentNode;
		var route = selectedNode.childNodes[0].attributes.site;
		var sites = [];
		sites.push(selectedNode.childNodes[0].attributes);
		for (var i = 1; i < selectedNode.childNodes.length; i++) {
			route += '-' + selectedNode.childNodes[i].attributes.id;
			sites.push(selectedNode.childNodes[i].attributes);
		}
		if (!this.routeStatusStore)
			this.routeStatusStore = this.buildRouteStatusStore();
		Ext.getBody().mask('计算中...', 'x-mask-loading');
		this.routeStatusStore.load({
			text: selectedNode.text,
			sites: sites,
			params: {
				route: route
			}
		}, this);
	},
	buildRouteStatusStore: function () {
		var store = new Ext.data.JsonStore({
			url: '/api/cost/getRouteCost',
			root: 'data',
			fields: [ 'id', 'site1', 'site2', 'minutes', 'tariff' ]
		});
		store.addListener('load', function (store, records, options) {
			var rawData = [];
			for (var i = 0; i < store.getCount(); i++) {
				rawData.push({
					text: options.sites[i].text,
					//po: options.sites[i].po || '',
					load: options.sites[i].load || 0,
					volumn: options.sites[i].volumn || 0,
					cost: store.getAt(i).get('minutes')
				});
			}
			Ext.getBody().unmask();
			this.showRouteStatus('routesitelist', rawData, options.text, {
				siteLoad: this.params.siteLoad || 30,
				siteUnload: this.params.siteUnload || 10
			});
		}, this);
		return store;
	},
	onDrawMapMenu: function () {
		var treePanel = Ext.getCmp('routeView');
		var selectedNode = treePanel.getSelectionModel().getSelectedNode();
		if (selectedNode.leaf)
			selectedNode = selectedNode.parentNode;
		console.log(selectedNode);
		Ext.MessageBox.alert('系统提示', 'onDrawMapMenu TODO!!!');
	},
	buildMapPanel: function () {
		return {
			xtype: 'panel',
			flex: 1,
			border: false,
			tbar: [ '线路图', '->', {
				iconCls: 'icon-flag_green'
			}]
		};
	},
	getView: function () {
		return Ext.getCmp('orderView');
	},
	getStore: function () {
		return this.getView().store;
	},
	getLoader: function () {
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
		if (!params.dldate || !params.dc)
			return;
		if (params.dldate === '' || params.dc === '')
			return;
		var loader = this.getLoader();
		loader.on('beforeload', function (loader, node) {
			this.baseParams.dldate = params.dldate;
			this.baseParams.dc = params.dc;
		});
		Ext.getBody().mask('数据装载中...', 'x-mask-loading');
		loader.load(this.getView().root, function () {
			var view = this.getView();
			var count = view.root.childNodes.length;
			var title = view.topToolbar.getComponent(0).autoEl.html;
			title = title.substring(0, 4);
			if (count > 0)
				title = title + "(" + count + ")";
			view.topToolbar.getComponent(0).setText(title);
			this.clearRoute();
			view.root.setText(this.params.dcText);
			//view.rootVisible = true;
			//view.getUpdater().refresh();
			Ext.getBody().unmask();
		}, this);
		this.getView().expandAll();
	},
	clearRoute: function () {
		var root = Ext.getCmp('routeView').root;
		while (root.childNodes.length > 0)
			root.removeChild(root.firstChild);
	},
	showRouteStatus: function (xtype, rawData, text, options) {
		var form = this.buildRouteStatusWindow(xtype, rawData, text, options);
		form.on({
			scope: this,
			beforeShow: {
				single: true,
				fn: function () {
					var height = Math.min(Math.max(form.getHeight(), 200), 2 * Ext.getBody().getHeight() / 3);
					form.setHeight(height);
					form.setPosition(form.x, Ext.getBody().getHeight() / 6);
				}
			}
		});
		form.show();
	},
	buildRouteStatusWindow: function (xtype, rawData, text, options) {
		var items = Ext.apply({}, options, {
			rawData: rawData,
			text: text,
			xtype: xtype
		});
		return new Ext.Window({
			title: '线路统计',
			//closeAction: 'hide',
			closeAction: 'close',
			autoScroll: true,
			//plain: true,
			resizable: true,
			shadow: false,
			modal: true,
			closable: true,
			animCollapse: true,
			items : items
		});
	},
	downloadSolution: function (file) {
		if (!Ext.fly('downForm')) {
			var downForm = document.createElement('form');
			downForm.id = 'downForm';
			downForm.name = 'downForm';
			downForm.className = 'x-hidden';
			downForm.action = '/api/route/download';
			downForm.method = 'post';
			var data = document.createElement('input');
			data.type = 'hidden';
			data.name = 'file';
			data.value = file;
			downForm.appendChild(data);
			document.body.appendChild(downForm);
		}
		Ext.fly('downForm').dom.submit();
		if (Ext.fly('downForm')) {
			document.body.removeChild(downForm);
		}
	}
});
Ext.reg('routemanager', VrpSolver.RouteManager);
