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

			console.log("init:2:loginCookie");
			console.log(cookieUtil.get('loginCookie'));
			cookieUtil.clear('loginCookie');
			if (!cookieUtil.get('loginCookie')) {
				if (!loginWindow)
					loginWindow = this.buildLoginWindow();
				loginWindow.show();
			} else {
				this.buildViewport();
			}
		},
		buildLoginWindow: function() {
			return new LSH.window.UserLoginWindow({
				title: 'Login to Department Manager',
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
				loginWindow.el.mask('Please wait...', 'x-mask-loading');
				form.getForm().submit({
					//success: this.onLoginSuccess,
					success: function (form, action) {
						this.onLoginSuccess(form, action);
					},
					failure: function (form, action) {
						this.onLoginFailure();
					},
					scope: VrpSolver.workspace
				});
			}
		},
		onLoginSuccess: function (form, action) {
			loginWindow.el.unmask();
			if (action.result.data) {
				cookieUtil.set('loginCookie', action.result.data);
				console.log(cookieUtil.get('loginCookie'));
				this.buildViewport();
				loginWindow.destroy();
				loginWindow = null;
			} else {
				console.log("onLoginSuccess:: onLoginFailure");
				this.onLoginFailure();
			}
		},
		onLoginFailure: function () {
			loginWindow.el.unmask();
			Ext.MessageBox.alert('Failure', 'Login failed. Please try again.');
		},
		onLogout: function () {
			Ext.MessageBox.confirm('Please confirm', 'Are you sure you want to log out?', function (btn) {
				if (btn === 'yes')
					this.doLogout();
			}, this);
		},
		doLogout: function () {
			Ext.getBody().mask('Loggingout...', 'x-mask-loading');
			Ext.Ajax.request({
				url: '/api/logout',
				params: { user: cookieUtil.get('loginCookie') },
				callback: this.onAfterAjaxReq,
				succCallback: this.onAfterLogout,
				scope: this
			});
		},
		onAfterLogout: function (jsonData) {
			console.log("onAfterLogout");
			cookieUtil.clear('loginCookie');
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
