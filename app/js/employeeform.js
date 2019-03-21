Ext.ns('LSH.form');
LSH.form.EmployeeForm = Ext.extend(LSH.form.FormPanelBaseCls, {
	border: true,
	autoScroll: true,
	bodyStyle: 'background-color: #DFE8F6; padding: 10px;',
	labelWidth: 40,
	defaultType: 'textfield',
	defaults: {
		width: 200,
		maxLength: 255,
		allowBlank: false
	},
	initComponent: function () {
		Ext.applyIf(this, {
			tbar: this.buildTbar(),
			items: this.buildFormItems()
		});
		LSH.form.EmployeeForm.superclass.initComponent.call(this);
		this.addEvents({
			newemp: true,
			savemp: true,
			delemp: true
		});
		if (this.record) {
			this.on({
				scope: this,
				render: {
					single: true,
					fn: this.loadFormAfterRender
				}
			});
		}
	},
	buildTbar: function () {
		return [{
			text: 'Save',
			iconCls: 'icon-disk',
			scope: this,
			handler: this.onSave
		}, '-', {
			text: 'Reset',
			iconCls: 'icon-arrow_undo',
			scope: this,
			handler: this.onReset
		}, '-', {
			text: 'New Employee',
			iconCls: 'icon-user_add',
			scope: this,
			handler: this.onNew
		}, '->', {
			text: 'Delete Employee',
			iconCls: 'icon-user_delete',
			scope: this,
			handler: this.onDelete
		}];
	},
	buildFormItems: function () {
		var nameContainer = this.buildNameContainer(),
			departmentInfoContainer = this.buildDepartmentInfoContainer(),
			emailDobContainer = this.buildEmailDobContainer(),
			cityStateZipContainer = this.buildCityStateZipContainer(),
			phoneNumbersContainer = this.buildPhoneNumbersContainer();
		return [{
			xtype: 'hidden',
			name: 'id'
		}, {
			xtype: 'hidden',
			name: 'departmentId'
		},
			nameContainer,
			emailDobContainer,
			phoneNumbersContainer,
			departmentInfoContainer, {
			fieldLabel: 'Street',
			name: 'street',
			allowBlank: true,
			width: 300
		},
			cityStateZipContainer
		];
	},
	buildNameContainer: function () {
		return {
			xtype: 'container',
			layout: 'column',
			anchor: '-10',
			defaultType: 'container',
			defaults: {
				width: 150,
				labelWidth: 40,
				layout: 'form'
			},
			items: [{
				items: {
					xtype: 'textfield',
					fieldLabel: 'Last',
					name: 'lastName',
					anchor: '-10',
					allowBlank: false,
					maxLength: 50
				}
			}, {
				items: {
					xtype: 'textfield',
					fieldLabel: 'Middle',
					name: 'middle',
					anchor: '-10',
					maxLength: 50
				}
			}, {
				labelWidth: 30,
				items: {
					xtype: 'textfield',
					fieldLabel: 'First',
					name: 'firstName',
					anchor: '-10',
					allowBlank: false,
					maxLength: 50
				}
			}, {
				labelWidth: 30,
				width: 90,
				items: {
					xtype: 'textfield',
					fieldLabel: 'Title',
					name: 'title',
					anchor: '-10',
					maxLength: 5
				}
			}]
		};
	},
	buildDepartmentInfoContainer: function () {
		return {
			xtype: 'container',
			layout: 'column',
			anchor: '-10',
			defaultType: 'container',
			defaults: {
				width: 200,
				layout: 'form'
			},
			items: [{
				labelWidth: 40,
				width: 250,
				items: {
					xtype: 'combo',
					fieldLabel: 'Dept',
					hiddenName: 'departmentId',
					displayField: 'name',
					valueField: 'id',
					triggerAction: 'all',
					editable: false,
					anchor: '-10',
					store: {
						xtype: 'jsonstore',
						url: '/api/dept/all',
						root: 'data',
						fields: [ 'name', 'id' ]
					}
				}
			}, {
				labelWidth: 65,
				width: 175,
				items: {
					xtype: 'datefield',
					fieldLabel: 'Date Hired',
					anchor: '-10',
					name: 'dateHired'
				}
			}, {
				labelWidth: 50,
				width: 145,
				items: {
					xtype: 'numberfield',
					fieldLabel: 'Rate/hr',
					name: 'rate',
					allowDecimals: true,
					anchor: '-10',
					decimalPrecision: 2
				}
			}]
		};
	},
	buildEmailDobContainer: function () {
		return {
			xtype: 'container',
			layout: 'column',
			anchor: '-10',
			defaultType: 'container',
			defaults: {
				layout: 'form'
			},
			items: [{
				labelWidth: 40,
				width: 325,
				items: {
					xtype: 'textfield',
					fieldLabel: 'Email',
					name: 'email',
					anchor: '-10',
					maxLength: 50
				}
			}, {
				width: 140,
				labelWidth: 30,
				items: {
					xtype: 'datefield',
					fieldLabel: 'DOB',
					anchor: '-10',
					name: 'dob',
					allowBlank: true
				}
			}]
		};
	},
	buildCityStateZipContainer: function () {
		return {
			xtype: 'container',
			layout: 'column',
			anchor: '-10',
			defaultType: 'container',
			defaults: {
				width: 175,
				labelWidth: 40,
				layout: 'form'
			},
			items: [{
				items: {
					xtype: 'textfield',
					fieldLabel: 'City',
					name: 'city',
					anchor: '-10'
				}
			}, {
				items: {
					xtype: 'combo',
					fieldLabel: 'State',
					name: 'state',
					displayField: 'state',
					valueField: 'state',
					triggerAction: 'all',
					editable: false,
					anchor: '-10',
					store: {
						xtype: 'jsonstore',
						url: '/api/state/all',
						root: 'data',
						fields: [ 'state' ]
					}
				}
			}, {
				labelWidth: 30,
				items: {
					xtype: 'numberfield',
					fieldLabel: 'Zip',
					name: 'zip',
					anchor: '-10',
					minLength: 4,
					maxLength: 5
				}
			}]
		};
	},
	buildPhoneNumbersContainer: function () {
		return {
			xtype: 'container',
			layout: 'column',
			anchor: '-10',
			defaultType: 'container',
			defaults: {
				width: 175,
				labelWidth: 40,
				layout: 'form'
			},
			items: [{
				items: {
					xtype: 'textfield',
					fieldLabel: 'Office',
					name: 'officePhone',
					anchor: '-10'
				}
			}, {
				items: {
					xtype: 'textfield',
					fieldLabel: 'Home',
					name: 'homePhone',
					anchor: '-10'
				}
			}, {
				items: {
					xtype: 'textfield',
					fieldLabel: 'Mobile',
					name: 'mobilePhone',
					anchor: '-10'
				}
			}]
		};
	},
	onNew: function () {
		this.clearForm();
		this.fireEvent('newemp', this, this.getValues());
	},
	onSave: function () {
		if (this.isValid())
			this.fireEvent('savemp', this, this.getValues());
	},
	onReset: function () {
		this.getForm().reset();
	},
	onDelete: function () {
		var vals = this.getValues();
		if (vals.id.length > 0)
			this.fireEvent('delemp', this, this.getValues());
	},
	loadFormAfterRender: function () {
		this.load({
			url: '/api/emp/get',
			params: {
				id: this.record.get('id')
			}
		});
	}
});
Ext.reg('employeeform', LSH.form.EmployeeForm);
