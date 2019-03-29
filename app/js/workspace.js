Ext.ns('VrpSolver');
VrpSolver.workspace = function () {
	var viewport, cardPanel, loginWindow,
		cookieUtil = Ext.util.Cookies;

	return {
		init: function () {
			Ext.BLANK_IMAGE_URL = './ext/resources/images/default/s.gif';
			//初始化标签中的Ext:Qtip属性。
			Ext.QuickTips.init();
			Ext.form.Field.prototype.msgTarget = 'side';

			/********** 解决日历控件显示异常 **********/
			Ext.override(Ext.menu.DateMenu, {
				render : function() {
					Ext.menu.DateMenu.superclass.render.call(this);
					if (Ext.isGecko || Ext.isSafari || Ext.isChrome) {
						this.picker.el.dom.childNodes[0].style.width = '178px';
						this.picker.el.dom.style.width = '178px';
					}
				}
			});

			cookieUtil.clear('token');
			var token = cookieUtil.get('token') || '';
			if (cookieUtil.get('token') === '' || true) {
				if (!loginWindow)
					loginWindow = this.buildLoginWindow();
				loginWindow.show();
			} else {
				this.buildViewport();
			}
		},
		buildLoginWindow: function() {
			return new LSH.window.UserLoginWindow({
				title: '系统登陆',
				handler: this.onLogin,
				scope: this
			});
		},
		buildViewport: function () {
			cardPanel = new Ext.Panel({
				layout: 'card',
				activeItem: 0,
				border: false,
				defaults: { workspace: this },
				items: [{
					xtype: 'routemanager'
				}, {
					xtype: 'mastermanager'
				}, {
					xtype: 'dashboard'
				}],
				tbar: [{
					text: '线路规划',
					iconCls: 'icon-vector_add',
					itemType: 'routemanager',
					toggleGroup: 'navGrp',
					enableToggle: true,
					pressed: true,
					handler: this.onSwitchPanel,
					scope: this
				}, '-', {
					text: '基础数据',
					//iconCls: 'icon-user_edit',
					iconCls: 'icon-script_gear',
					itemType: 'mastermanager',
					toggleGroup: 'navGrp',
					enableToggle: true,
					handler: this.onSwitchPanel,
					scope: this
				}, '-', {
					text: '控制仓',
					iconCls: 'icon-chart_curve',
					itemType: 'dashboard',
					toggleGroup: 'navGrp',
					enableToggle: true,
					handler: this.onSwitchPanel,
					scope: this
				}, '->', {
					text: '退出',
					iconCls: 'icon-door_out',
					handler: this.onLogout,
					scope: this
				}]
			});
			viewport = new Ext.Viewport({
				layout: 'fit',
				items: cardPanel
			});
			Ext.getBody().unmask();
		},
		onLogin: function () {
			var form = loginWindow.get(0);
			if (form.getForm().isValid()) {
				loginWindow.el.mask('登陆中...', 'x-mask-loading');
				form.getForm().submit({
					scope: this,
					success: this.onLoginSuccess,
					failure: this.onLoginFailure,
					//scope: VrpSolver.workspace
				});
			}
		},
		onLoginSuccess: function (form, action) {
			loginWindow.el.unmask();
			if (action.result.data) {
				var data = action.result.data;
				cookieUtil.set('user', data[0]);
				cookieUtil.set('token', data[1]);
				this.buildViewport();
				loginWindow.destroy();
				loginWindow = null;
			} else {
				this.onLoginFailure();
			}
		},
		onLoginFailure: function () {
			loginWindow.el.unmask();
			Ext.MessageBox.alert('系统提示', '登陆失败，请重试！');
		},
		onLogout: function () {
			Ext.MessageBox.confirm('系统提示', '确定要退出系统吗？', function (btn) {
				if (btn === 'yes')
					this.doLogout();
			}, this);
		},
		doLogout: function () {
			Ext.getBody().mask('系统退出中...', 'x-mask-loading');
			Ext.Ajax.request({
				url: '/api/vrp/logout',
				callback: this.onAfterAjaxReq,
				succCallback: this.onAfterLogout,
				scope: this
			});
		},
		onAfterLogout: function (jsonData) {
			console.log("onAfterLogout");
			cookieUtil.clear('token');
			this.destroy();
		},
		onSwitchPanel: function (btn) {
			var xtype = btn.itemType,
				panels = cardPanel.findByType(xtype),
				newPanel = panels[0];
			var newCardIndex = cardPanel.items.indexOf(newPanel);
			this.switchToCard(newCardIndex, newPanel);
		},
		switchToCard: function (newCardIndex, newPanel) {
			var layout = cardPanel.getLayout(),
				activePanel = layout.activeItem,
				activePanelIdx = cardPanel.items.indexOf(activePanel);
			if (activePanelIdx !== newCardIndex) {
				layout.setActiveItem(newCardIndex);
				if (newPanel.clearSlate)
					newPanel.clearSlate();
			}
		},
		onAfterAjaxReq: function (options, success, result) {
			Ext.getBody().unmask();
			if (success === true) {
				var jsonData;
				try {
					jsonData = Ext.decode(result.responseText);
					console.log("jsonData");
					console.log(jsonData);
				} catch (e) {
					Ext.MessageBox.alert('Error!', 'Data returned is not valid!');
				}
				options.succCallback.call(options.scope, jsonData, options);
			} else {
				if (options.failure)
					options.failure.call(options.scope, jsonData, options);
				else
					Ext.MessageBox.alert('Error!', 'The web transaction failed!');
			}
		},
		destroy: function () {
			viewport.destroy();
			viewport = null;
			cardPanel = null;
			console.log("destroy");
			this.init();
		}
	};
}();
Ext.onReady(VrpSolver.workspace.init, VrpSolver.workspace);
