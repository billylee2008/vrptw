Ext.ns('LSH.form');
LSH.form.RouteSiteList = Ext.extend(Ext.DataView, {
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
		LSH.form.RouteSiteList.superclass.initComponent.call(this);
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
					'<div class="emplName">{name}</div>',
						'<tpl if="type===9">',
						'<div><span class="emplTitle">耗时：</span><span style="color:red;">{btime}</span></div>',
						'<div><span class="emplTitle">体积：</span><span style="color:red;">{pcost}</span></div>',
						'<div><span class="emplTitle">重量：</span><span style="color:red;">{ncost}</span></div>',
						'</tpl>',
						'<tpl if="type===-1">',
						'<div><span class="emplTitle">服务本站：</span><span style="color:red;">({btime}+{stime})</span></div>',
						'<div><span class="emplTitle">下一站：</span>{nsite}({nleft}+{ncost})</div>',
						'</tpl>',
						'<tpl if="type===0">',
						'<div><span class="emplTitle">上一站：</span>{psite}({pleft}+{pcost})</div>',
						'<div><span class="emplTitle">服务本站：</span><span style="color:red;">{po}({btime}+{stime})</span></div>',
						'<div><span class="emplTitle">下一站：</span>{nsite}({nleft}+{ncost})</div>',
						'</tpl>',
						'<tpl if="type===1">',
						'<div><span class="emplTitle">上一站：</span>{psite}({pleft}+{pcost})</div>',
						'<div><span class="emplTitle">服务本站：</span><span style="color:red;">({btime})</span></div>',
						'</tpl>',
					'</div>',
				'</div>',
			'</tpl>'
		);
	},
	formatRawData: function () {
		this.siteLoad = this.siteLoad || 0;
		this.siteUnload = this.siteUnload || 20;
		this.rawData = this.rawData || [];
		var rawData = this.rawData;
		if (rawData.length === 0)
			return [];

		var arrayData = [];
		var record, lastRecord = null;
		var btime = 0;
		var totalLoad = 0.0;
		var totalVolumn = 0.0;
		arrayData[0] = null;

		for (var i = 0; i < rawData.length; i++) {
			record = [];
			record[0] = rawData[i].text;
			record[10] = rawData[i].cost;
			totalLoad += rawData[i].load;
			totalVolumn += rawData[i].volumn;

			if (i === 0) {
				record[1] = -1;
				record[6] = this.formatTime(btime);
				record[7] = this.siteLoad;
				btime += record[7];
				record[9] = this.formatTime(btime);
				btime += record[10];
			} else {
				lastRecord[8] = record[0];
				record[1] = 0;
				record[2] = lastRecord[0];
				record[3] = lastRecord[9];
				record[4] = lastRecord[10];
				record[5] = rawData[i].po || ('PO' + i);
				record[6] = this.formatTime(btime);
				record[7] = this.siteUnload;
				btime += record[7];
				record[9] = this.formatTime(btime);
				btime += record[10];
			}
			lastRecord = record;
			arrayData.push(record);
		}

		record = [];
		record[0] = rawData[0].text;
		record[10] = 0;
		record[1] = 1;
		record[2] = lastRecord[0];
		record[3] = lastRecord[9];
		record[4] = lastRecord[10];
		record[6] = this.formatTime(btime);
		record[7] = 0;
		arrayData.push(record);
		lastRecord = record;

		record = [];
		record[0] = this.text || '本线路';
		record[1] = 9;
		record[6] = lastRecord[6];
		record[4] = this.formatDecimal(totalVolumn, 3, true);
		record[10] = this.formatDecimal(totalLoad, 3, true);
		arrayData[0] = record;

		//console.log(arrayData);
		this.arrayData = arrayData;
	},
	buildStore: function () {
		this.arrayData = this.arrayData || [];
		var arrayStore = new Ext.data.ArrayStore({
			data: this.arrayData,
			fields: [ 'name', 'type', 'psite', 'pleft', 'pcost', 'po', 'btime', 'stime', 'nsite', 'nleft', 'ncost' ]
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
Ext.reg('routesitelist', LSH.form.RouteSiteList);
