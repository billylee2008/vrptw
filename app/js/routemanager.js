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
				//iconCls: 'icon-script_gear',
				iconCls: 'icon-car',
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
				id: 'orderPanel',
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
			show: {
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
			layout: 'fit',
			title: '车型信息',
			plain: true,
			width: 330,
			height: 265,
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
					allowDecimals: true,
					decimalPrecision: 2,
					style: 'text-align: right;',
					name: 'volumn'
				}, {
					fieldLabel: '最大装载重量(吨)',
					width: 120,
					allowBlank: false,
					allowDecimals: true,
					decimalPrecision: 2,
					style: 'text-align: right;',
					name: 'load'
				}, {
					fieldLabel: '满载率',
					width: 120,
					allowBlank: false,
					allowDecimals: true,
					decimalPrecision: 2,
					style: 'text-align: right;',
					name: 'ratio'
				}, {
					fieldLabel: '站点装货时间(分)',
					width: 120,
					allowBlank: true,
					allowDecimals: false,
					style: 'text-align: right;',
					name: 'pickup'
				}, {
					fieldLabel: '站点卸货时间(分)',
					width: 120,
					allowBlank: true,
					allowDecimals: false,
					style: 'text-align: right;',
					name: 'unload'
				}, {
					fieldLabel: '运行时间限制(分)',
					width: 120,
					allowBlank: true,
					allowDecimals: false,
					style: 'text-align: right;',
					name: 'runlimit'
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
									this.params.vehicle = form.getValues();
									Ext.getCmp('frmVehicle').hide();
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
					//tooltip: 'tooltip test',
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
	countOrder: function () {
		var i = 0, count = this.getOrderPanel().root.childNodes.length;
		var rootRoute = this.getRoutePanel().root;

		for (; i < rootRoute.childNodes.length; i++)
			count += (rootRoute.childNodes[i].length - 1);

		//console.log(count);
		return count;
	},
	onClickPlanButton: function (evt, toolEl, panel) {
		view = this.getOrderPanel();
		/*console.log(view);
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
		console.log(sorter);*/
		//sorter.doSort();

		if (this.countOrder() <= 0) {
			Ext.MessageBox.show({
				title: 'Error',
				msg: '当前没有订单!',
				buttons: Ext.MessageBox.OK,
				icon: Ext.MessageBox.WARNING
			});
			return;
		}

		this.clearRoute(true);
		var route = [];
		var root = view.root;
		for (var i = 0; i < root.childNodes.length; i++)
			if (root.childNodes[i].draggable)
				route.push(root.childNodes[i].attributes.id);
		//console.log(route);

		Ext.getBody().mask('方案生成中...', 'x-mask-loading');
		Ext.Ajax.request({
			url: '/api/order/planRouteBySites',
			params: {
				dldate: this.params.dldate,
				dc: this.params.dc,
				orderSites: route
			},
			callback: this.workspace.onAfterAjaxReq,
			succCallback: function (result) {
				//console.log(result.data);
				this.planRoutes(result.data);
				Ext.MessageBox.alert('系统提示', '方案生成成功！');
			},
			failure: function (result) {
				//错误处理
				Ext.MessageBox.show({
					title: '系统提示',
					msg: result.msg || '方案生成失败',
					buttons: Ext.MessageBox.OK,
					icon: Ext.MessageBox.ERROR,
					maxWidth: 500,
					minWidth: 200
				});
			},
			scope: this
		});
	},
	planRoutes: function (data) {
		var routes = data.routes;
		var count = routes ? routes.length : 0;
		if (count <= 0)
			return;

		var i, j, nodes = {};
		var rootSite = this.getOrderPanel().root;
		for (i = 0; i < rootSite.childNodes.length; i++)
			nodes['s' + rootSite.childNodes[i].attributes.id] = rootSite.childNodes[i];
		//console.log(nodes);

		var rootRoute = this.getRoutePanel().root;
		for (i = 0; i < count; i++) {
			this.addNewRoute('系统规划线路' + (i + 1));
			for (j = 0; j < routes[i].length; j++) {
				var child = nodes['s' + routes[i][j]];
				child.remove();
				child.ui.rendered = false;
				rootSite.removeChild(child);
				rootRoute.lastChild.appendChild(child);
			}
		}
		//this.getOrderPanel().getUpdater().refresh();
		this.getRoutePanel().getUpdater().refresh();
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
				fields: [ 'name', 'code', 'abbr', 'longitude', 'latitude' ]
			});
			store.addListener('load', function (store, records, options) {
				for (var i = 0; i < store.getCount(); i++) {
					btn.menu.addMenuItem(Ext.apply(btn.menu.defaults, {
						//text: store.getAt(i).get('name'),
						lng: store.getAt(i).get('longitude'),
						lat: store.getAt(i).get('latitude'),
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
			this.params.lng = menuItem.lng;
			this.params.lat = menuItem.lat;
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
		this.params.view = 'orderPanel';
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
			id: 'routePanel',
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
					try {
						//var treeDropZone = Ext.tree.TreeDropZone;
						var isValidDrpPnt = Ext.tree.TreeDropZone.prototype.isValidDropPoint;
						if (!nodeData)
							return false;
						var tgtNd = nodeData.node;
						if (!tgtNd || !tgtNd.leaf || (!tgtNd.draggable && pt === 'above'))
							return false;
						return isValidDrpPnt.apply(tgtNd.getOwnerTree().dropZone, arguments);
					} catch (e) {
					}
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
		if (this.countOrder() <= 0) {
			Ext.MessageBox.show({
				title: 'Error',
				msg: '当前没有订单!',
				buttons: Ext.MessageBox.OK,
				icon: Ext.MessageBox.WARNING
			});
			return;
		}

		Ext.MessageBox.prompt("系统提示", "请输入线路名：", function (btn, text) {
			if (btn !== 'ok')
				return;
			text = (text || '').trim();
			if (text === '')
				text = '新线路';
			this.addNewRoute(text);
		}, this);
	},
	addNewRoute: function (text) {
		var view = this.getRoutePanel();
		view.root.appendChild(new Ext.tree.TreeNode({
			id: Ext.id(),
			expanded: true,
			//dropable: false,
			draggable: false,
			leaf: false,
			text: text
		}));
		view.root.lastChild.appendChild(new Ext.tree.TreeNode({
			id: Ext.id(),
			draggable: false,
			leaf: true,
			site: this.params.dc,
			text: this.params.dcText
		}));
	},
	onClickStatusButton: function () {
		var root = this.getRoutePanel().root;
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
		if (this.params.vehicle) {
			this.params.siteLoad = this.params.vehicle.pickup;
			this.params.siteUnload = this.params.vehicle.unload;
		}
		this.totalStatusStore.load({
			sites: sites,
			params: {
				siteLoad: this.params.siteLoad || 0,
				siteUnload: this.params.siteUnload || 20,
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
		var root = this.getRoutePanel().root;
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
				//console.log(result.data);
				Ext.MessageBox.alert('系统提示', '方案生成成功！');
			},
			failure: function (result) {
				//错误处理
				Ext.MessageBox.show({
					title: '系统提示',
					msg: result.msg,
					buttons: Ext.MessageBox.OK,
					icon: Ext.MessageBox.ERROR,
					maxWidth: 500,
					minWidth: 200
				});
			},
			scope: this
		});
	},
	/*buildSaveRouteStore: function () {
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
	},*/
	onCtxMenuRoute: function (node, evtObj) {
		node.select();
		this.params.view = 'routePanel';
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
		var opt2Item = ctxMenuRoute.getComponent('opt2');
		var opt3Item = ctxMenuRoute.getComponent('opt3');

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
			if (node.parentNode.childNodes.length < 3) {
				opt2Item.disable();
				opt3Item.disable();
			} else {
				opt2Item.enable();
				opt3Item.enable();
			}
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
			if (node.childNodes.length < 3) {
				opt2Item.disable();
				opt3Item.disable();
			} else {
				opt2Item.enable();
				opt3Item.enable();
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
			}, '-', {
				itemId: 'opt2',
				text: '2-OPT',
				iconCls: 'icon-arrow_refresh',
				scope: this,
				handler: this.onOptRouteMenu
			}, {
				itemId: 'opt3',
				text: '3-OPT',
				iconCls: 'icon-arrow_in',
				scope: this,
				handler: this.onOptRouteMenu
			}]
		});
	},
	onRenameRouteMenu: function () {
		var selectedNode = this.findSelectedRouteNode();
		Ext.MessageBox.prompt("系统提示", "请输入线路名：", function (btn, txt) {
			txt = (txt || '').trim();
			if (txt !== '') {
				selectedNode.setText(txt);
			}
		}, this);
	},
	onDeleteRouteMenu: function () {
		var selectedNode = this.findSelectedRouteNode();
		Ext.MessageBox.confirm('系统提示', '确定要删除该线路吗？', function (btn) {
			if (btn === 'yes') {
				this.deleteRoute(selectedNode);
			}
		}, this);
	},
	deleteRoute: function (selectedNode) {
		var view = this.getOrderPanel();
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
	},
	onRemoveOrderMenu: function () {
		var selectedNode = this.findSelectedRouteNode();
		var parentNode = selectedNode.parentNode;

		selectedNode.remove();
		selectedNode.ui.rendered = false;
		var view = this.getOrderPanel();
		view.getRootNode().appendChild(selectedNode);
		view.getUpdater().refresh();
	},
	onStatusRouteMenu: function () {
		var selectedNode = this.findSelectedRouteNode(true);

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
			if (this.params.vehicle) {
				this.params.siteLoad = this.params.vehicle.pickup;
				this.params.siteUnload = this.params.vehicle.unload;
			}
			this.showRouteStatus('routesitelist', rawData, options.text, {
				siteLoad: this.params.siteLoad || 0,
				siteUnload: this.params.siteUnload || 20
			});
		}, this);
		return store;
	},
	onDrawMapMenu: function () {
		var selectedNode = this.findSelectedRouteNode(true);

		if (!this.mapInitialized)
			this.initMapComponent();
		this.setMapRouteName(selectedNode.attributes.text);

		var cset = [];
		var route = selectedNode.childNodes[0].attributes;
		cset.push({
			lng: this.params.lng,
			lat: this.params.lat,
			id: 0,
			code: route.site,
			name: route.text
		});

		for (var i = 1; i < selectedNode.childNodes.length; i++) {
			route = selectedNode.childNodes[i].attributes;
			cset.push({
				lng: route.lng,
				lat: route.lat,
				id: i,
				code: route.id,
				name: route.text,
				address: ''
			});
		}

		var mapPanel = this.getMapPanel();
		mapPanel.buildPoints(this.buildMapStore({ data: cset }), false, true);
	},
	buildMapStore: function (data) {
		return new Ext.data.Store({
			autoLoad: true,
			proxy: new Ext.data.MemoryProxy(data),
			reader: new Ext.data.JsonReader({
				root: 'data'
			}, [ 'lng', 'lat', 'id', 'code', 'name', 'address', 'rendered', 'found', 'nameFound' ]),
		});
	},
	onOptRouteMenu: function (menuItem, choice) {
		var selectedNode = this.findSelectedRouteNode(true);

		var route = [];
		var sites = {};
		var node = selectedNode.childNodes[0].attributes;
		route.push(node.site);
		sites['s' + node.site] = node.text;
		for (var i = 1; i < selectedNode.childNodes.length; i++) {
			node = selectedNode.childNodes[i].attributes;
			route.push(node.id);
			sites['s' + node.id] = node.text;
		}
		route.push(selectedNode.childNodes[0].attributes.site);

		//console.log(route);
		Ext.getBody().mask('线路优化中...', 'x-mask-loading');
		Ext.Ajax.request({
			url: '/api/order/optRoute',
			params: {
				route: route,
				mode: menuItem.itemId
			},
			rootText: selectedNode.attributes.text,
			sites: sites,
			callback: this.workspace.onAfterAjaxReq,
			succCallback: function (result, options) {
				//console.log(result);
				//Ext.MessageBox.alert('系统提示', '线路优化成功！');
				if (result.success)
					this.buildOptResultWindow(result.data, options.rootText, options.sites);
				else if (options.failure)
					options.failure.call(options.scope, result, options);
			},
			failure: function (result) {
				Ext.getBody().unmask();
				//错误处理
				Ext.MessageBox.show({
					title: '提示',
					msg: result.msg || '当前线路已最优',
					buttons: Ext.MessageBox.OK,
					icon: Ext.MessageBox.ERROR,
					maxWidth: 500,
					minWidth: 200
				});
			},
			scope: this
		});
	},
	buildOptResultWindow: function (data, text, sites) {
		var children = [];
		for (var i = 0; i < data.length; i++) {
			if (i < data.length - 1 || data[0] !== data[i]) {
				children.push({
					leaf: true,
					text: sites['s' + data[i]]
				});
			}
		}

		new Ext.Window({
			height: 350,
			width: 200,
			layout: 'fit',
			border: false,
			title: '线路优化建议',
			id: 'frmOptRoute',
			closeAction: 'close',
			autoScroll: true,
			resizable: true,
			shadow: false,
			modal: true,
			closable: false,
			animCollapse: true,
			data: data,
			buttons: [{
				text: '接受',
				scope: this,
				handler: this.onClickAcceptButton
			}, {
				text: '关闭',
				handler: function () {
					Ext.getCmp('frmOptRoute').close();
				}
			}],
			items: {
				xtype: 'treepanel',
				autoScroll: true,
				root: {
					text: text,
					expanded: true,
					children: children
				}
			}
		}).show();
	},
	onClickAcceptButton: function () {
		var data = Ext.getCmp('frmOptRoute').data;
		Ext.getCmp('frmOptRoute').close();
		this.replaceRouteNode(data);
	},
	replaceRouteNode: function (data) {
		var selectedNode = this.findSelectedRouteNode(true);
		var nodes = {};
		for (var i = selectedNode.childNodes.length - 1; i > 0; i--) {
			var child = selectedNode.childNodes[i];
			nodes['s' + child.attributes.id] = child;
			child.remove();
			child.ui.rendered = false;
			selectedNode.removeChild(child);
		}
		for (var i = 1; i < data.length - 1; i++)
			selectedNode.appendChild(nodes['s' + data[i]]);
		this.getRoutePanel().getUpdater().refresh();
	},
	findSelectedRouteNode: function (noLeaf) {
		var routePanel = this.getRoutePanel();
		var selectedNode = routePanel.getSelectionModel().getSelectedNode();
		if (noLeaf)
			if (selectedNode.leaf)
				selectedNode = selectedNode.parentNode;
		return selectedNode;
	},
	buildMapPanel: function () {
		return {
			xtype: 'mappanel',
			flex: 1,
			id: 'mapPanel',
			border: false,
			draggable: false,
			tbar: [ '线路图', '->', {
				iconCls: 'icon-flag_green',
				scope: this,
				handler: this.initMapComponent
			}],
			layout: 'fit',
			items: {
				html: '<div id="myMap"></div>'
			}
		};
	},
	setMapRouteName: function (text) {
		var view = this.getMapPanel();
		var title = view.topToolbar.getComponent(0).autoEl.html;
		title = title.substring(0, 3);
		if (text)
			title += ' - ' + text;
		view.topToolbar.getComponent(0).setText(title);
	},
	initMapComponent: function () {
		if (this.params.dc === '') {
			Ext.MessageBox.show({
				title: 'Error',
				msg: '请选择发货点!',
				buttons: Ext.MessageBox.OK,
				icon: Ext.MessageBox.WARNING
			});
		} else {
			if (!this.mapRoute)
				this.mapRoute = new BMap.Map("myMap");
			var map = this.mapRoute;
			map.enableScrollWheelZoom(true);
			map.addControl(new BMap.OverviewMapControl({ isOpen: false, anchor: BMAP_ANCHOR_BOTTOM_RIGHT }));
			map.addControl(new BMap.NavigationControl());
			map.addControl(new BMap.ScaleControl());
			map.centerAndZoom(new BMap.Point(this.params.lng, this.params.lat), 10);
			//map.setCurrentCity("苏州");
			map.clearOverlays();
			this.mapInitialized = true;
			var mapPanel = this.getMapPanel();
			mapPanel.map = map;
			mapPanel.addCenterMarker(this.params.lng, this.params.lat, this.params.dcText);
			this.setMapRouteName();
		}
	},
	getOrderPanel: function () {
		return Ext.getCmp('orderPanel');
	},
	getRoutePanel: function () {
		return Ext.getCmp('routePanel');
	},
	getMapPanel: function () {
		return Ext.getCmp('mapPanel');
	},
	getStore: function () {
		return this.getOrderPanel().store;
	},
	getOrderLoader: function () {
		return this.getOrderPanel().getLoader();
	},
	getSelectedRecords: function () {
		return this.getOrderPanel().getSelectedRecords();
	},
	getSelected: function () {
		return this.getOrderPanel().getSelectedRecords()[0];
	},
	loadStoreByParams: function (params) {
		params = params || {};
		if (!params.dldate || !params.dc)
			return;
		if (params.dldate === '' || params.dc === '')
			return;
		var orderLoader = this.getOrderLoader();
		orderLoader.on('beforeload', function (orderLoader, node) {
			this.baseParams.dldate = params.dldate;
			this.baseParams.dc = params.dc;
		});
		Ext.getBody().mask('数据装载中...', 'x-mask-loading');
		orderLoader.load(this.getOrderPanel().root, function () {
			var view = this.getOrderPanel();
			var count = view.root.childNodes.length;
			var title = view.topToolbar.getComponent(0).autoEl.html;
			title = title.substring(0, 4);
			if (count > 0)
				title = title + "(" + count + ")";
			view.topToolbar.getComponent(0).setText(title);
			this.clearRoute();
			view.root.setText(this.params.dcText);
			Ext.getBody().unmask();
		}, this);
		this.getOrderPanel().expandAll();
	},
	clearRoute: function (backup) {
		var root = this.getRoutePanel().root;
		if (!backup) {
			while (root.childNodes.length > 0)
				root.removeChild(root.firstChild);
		} else {
			for (var i = root.childNodes.length - 1; i >= 0; i--)
				this.deleteRoute(root.childNodes[i]);
		}
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
