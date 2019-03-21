Ext.ns('LSH.form');
LSH.form.RouteStatusList = Ext.extend(Ext.DataView, {
	singleSelect: true,
	itemSelector: 'div.emplWrap',
	//selectedClass: 'emplSelected',
	overClass: 'emplOver',
	style: 'overflow: auto; background-color: #FFFFFF;',
	initComponent: function () {
		if (this.rawData)
			this.formatRawData();
		Ext.applyIf(this, {
			tpl: this.buildTemplate(),
			store: this.buildStore()
		});
		LSH.form.RouteStatusList.superclass.initComponent.call(this);
	},
	buildTemplate: function () {
		return new Ext.XTemplate(
			'<tpl for=".">',
				'<tpl if="type===9">',
				'<div class="emplSelected">',
				'</tpl>',
				'<tpl if="type!==9">',
				'<div class="emplWrap">',
				'</tpl>',
					'<tpl if="type!==-1">',
					'<div class="emplName">{name}(共{sites}站)</div>',
					'</tpl>',
					'<tpl if="type===-1">',
					'<div class="emplName">{name}(共{sites}站)<span style="color:red;">装载失败</span></div>',
					'</tpl>',
						'<div><span class="emplTitle">耗时：</span><span style="color:red;">{minutes}</span></div>',
						'<div><span class="emplTitle">体积：</span><span style="color:red;">{volumn}</span></div>',
						'<div><span class="emplTitle">重量：</span><span style="color:red;">{load}</span></div>',
					'</div>',
				'</div>',
			'</tpl>'
		);
	},
	formatRawData: function () {
		this.rawData = this.rawData || [];
		var rawData = this.rawData;
		if (rawData.length === 0)
			return [];

		var arrayData = [];
		var record, lastRecord = null;
		var totalSites = 0;
		var totalVolumn = 0.0;
		var totalLoad = 0.0;
		var totalMinutes = 0;
		var totalTariff = 0.0;
		arrayData[0] = null;

		for (var i = 0; i < rawData.length; i++) {
			record = [];
			record[0] = rawData[i].text;
			record[1] = 0;
			record[2] = rawData[i].sites;
			record[3] = this.formatDecimal(rawData[i].volumn, 3, true);
			record[4] = this.formatDecimal(rawData[i].load, 3, true);

			if (rawData[i].costTime < 0) {
				record[1] = -1;
				record[5] = this.formatTime(0);
				record[6] = this.formatDecimal(0, 3, true);
			} else {
				record[5] = this.formatTime(rawData[i].costTime);
				record[6] = this.formatDecimal(rawData[i].costFee, 3, true);
				totalSites += rawData[i].sites;
				totalVolumn += rawData[i].volumn;
				totalLoad += rawData[i].load;
				totalMinutes += rawData[i].costTime;
				totalTariff += rawData[i].costFee;
			}

			arrayData.push(record);
		}

		record = [];
		record[0] = this.text || '全体线路方案';
		record[1] = 9;
		record[2] = totalSites;
		record[3] = this.formatDecimal(totalVolumn, 3, true);
		record[4] = this.formatDecimal(totalLoad, 3, true);
		record[5] = this.formatTime(totalMinutes);
		record[6] = this.formatDecimal(totalTariff, 3, true);
		arrayData[0] = record;

		//console.log(arrayData);
		this.arrayData = arrayData;
	},
	buildStore: function () {
		this.arrayData = this.arrayData || [];
		var arrayStore = new Ext.data.ArrayStore({
			data: this.arrayData,
			fields: [ 'name', 'type', 'sites', 'volumn', 'load', 'minutes', 'tariff' ]
		});
		return arrayStore;
	},
	formatTime: function (totalMinutes) {
		var hours = '00' + Math.floor(totalMinutes / 60);
		var minutes = '00' + (totalMinutes - hours * 60);
		return hours.substr(hours.length - 2) + ':' + minutes.substr(minutes.length - 2);
	},
	formatDecimal: function (decimal, digits, full, fn) {
		digits = digits || 0;
		full = full || false;
		fn = fn || Math.ceil;
		if (digits < 0)
			digits = 0;

		var prefix = '0000000000000000000000000000000000000000000000000000000000000000';
		var newDecimal = prefix.substr(0, digits) + fn(1.0 * decimal * Math.pow(10, digits));
		if (digits === 0)
			return newDecimal;

		newDecimal = newDecimal.substr(0, newDecimal.length - digits).replace(/^0+(?=\d)/, '')
			+ '.' + newDecimal.substring(newDecimal.length - digits)
		if (full === true)
			return newDecimal;

		return newDecimal.replace(/\.?0+$/, '');
	}
});
Ext.reg('routestatuslist', LSH.form.RouteStatusList);
