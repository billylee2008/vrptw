Ext.ns('LSH.window');
LSH.window.UserLoginWindow = Ext.extend(Ext.Window, {
	plain: true,
	width: 260,
	height: 140,
	resizable: false,
	shadow: true,
	modal: true,
	closable: false,
	animCollapse: true,
	layout: 'fit',
	initComponent: function () {
		this.items = this.buildForm();
		LSH.window.UserLoginWindow.superclass.initComponent.call(this);
		this.relayEvents(this.get(0).getForm(), [ 'click' ]);
	},
	buildForm: function () {
		//表单
		return new Ext.form.FormPanel({
			url: '/api/login',
			labelAlign: 'right',
			labelWidth: 50,
			frame: true,
			buttonAlign: 'right',
			bodyStyle: 'padding: 6px 0px 0px 6px;',
			defaultType: 'textfield',
			items: [{
				fieldLabel: '用户名',
				allowBlank: false,
				maxLength: 20,
				blankText: '请输入用户名',
				maxLengthText: '用户名不能超过20个字符',
				name: 'username'
			}, {
				fieldLabel: '密　码',
				inputType: 'password',
				allowBlank: false,
				maxLength: 20,
				blankText: '请输入密码',
				maxLengthText: '密码不能超过20个字符',
				name: 'password'
			}],
			buttons: [{
				text: 'Login',
				handler: this.handler,
				//scope: this
			}]
		});
	}
});
