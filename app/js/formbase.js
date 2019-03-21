Ext.ns('LSH.form');
LSH.form.FormPanelBaseCls = Ext.extend(Ext.form.FormPanel, {
	constructor: function (config) {
		config = config || {};
		Ext.applyIf(config, {
			trackResetOnLoad: true
		});
		LSH.form.FormPanelBaseCls.superclass.constructor.call(this, config);
	},
	getValues: function () {
		return this.getForm().getValues();
	},
	isValid: function () {
		return this.getForm().isValid();
	},
	clearForm: function () {
		var vals = this.getForm().getValues();
		var clrVals = {};
		for (var vName in vals)
			clrVals[vName] = '';
		this.getForm().setValues(clrVals);
		this.data = null;
	},
	loadData: function (data) {
		if (data) {
			console.log("loadData");
			console.log(data);
			this.data = data;
			this.getForm().setValues(data);
		} else {
			this.clearForm();
		}
	},
	setValues: function (o) {
		return this.getForm().setValues(o || {});
	}
});
