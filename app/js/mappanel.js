Ext.ns('VrpSolver');
VrpSolver.MapPanel = Ext.extend(Ext.Panel, {
	map: false,
	store: false,
	needFind: false,
	points: [],
	nodes: {},
	overlays: {},
	pathDesc: [],
	initComponent: function () {
		VrpSolver.MapPanel.superclass.initComponent.call(this);
	},
	buildPoints: function (store, needFind, autoDraw) {
		store.load();

		needFind = needFind || false;
		var points = [];
		var nodes = {};
		var overlays = {};
		var route = [];

		for (var i = 0; i < store.getCount(); i++) {
			points[i] = new BMap.Point(store.getAt(i).get('lng'), store.getAt(i).get('lat'));
			nodes['n' + store.getAt(i).get('code')] = i;
			store.getAt(i).set('rendered', false);
			store.getAt(i).set('found', needFind ? false : true);
			store.getAt(i).set('nameFound', '');
			route[i] = i;
		}
		route.push(0);

		this.store = store;
		this.needFind = needFind;
		this.points = points;
		this.nodes = nodes;
		this.overlays = overlays;

		if (autoDraw || false) {
			this.map.centerAndZoom(this.centerPoint(route), 10);
			this.drawRoutes([ route ], true);
		}
	},
	drawRoutes: function (allRoutes, formatted) {
		this.map.clearOverlays();
		var routes = allRoutes;
		if (!formatted)
			routes = this.formatSite(allRoutes);

		for (var i = 0; i < routes.length; i++) {
			var route = new Array();
			var k = 0;
			for (var j = 0; j < routes[i].length; j++) {
				route[j] = routes[i][j];
				this.addMarker(this.points[route[j]], routes[i][j], k);
				k += 1;
			}
			this.addPolyline(route, i % 3);
		}
	},
	formatSite: function (routes) {
		var routesMatrix = [];
		for (var i = 0; i < routes.length; i++) {
			var routeMatrix = [];
			for (var j = 0; j < routes[i].length; j++) {
				if (typeof(routes[i][j]) == 'string')
					routeMatrix[j] = this.nodes['n' + routes[i][j]];
				else
					routeMatrix[j] = routes[i][j];
			}
			routesMatrix[i] = routeMatrix;
		}
		return routesMatrix;
	},
	addMarker: function (point, p, k) {
		//this.map.addOverlay(new BMap.Marker(point));
		var data = this.store.getAt(p);
		if (!(data.get('rendered'))) {
			data.set('rendered', true);
			var marker = new BMap.Marker(point, {
				icon: new BMap.Icon(["http://api.map.baidu.com/img/markers.png"], new BMap.Size(23, 25), {
					offset: new BMap.Size(13, 25),
					imageOffset: new BMap.Size(0, 0 - ((k > 0) ? ((k != 11) ? (k - 1) : 11) : 10) * 25)
				})
			});
			this.map.addOverlay(marker);
			this.overlays['p' + p] = marker;
			this.getAddress(p, marker);
		}
	},
	getAddress: function (p, marker) {
		var data = this.store.getAt(p);
		if (data.get('found')) {
			this.addClickHandler(this.getRemark(p), marker);
		} else {
			var gc = new BMap.Geocoder();
			gc.getLocation(this.points[p], function (rs) {
				data.set('found', true);
				var addComp = rs.addressComponents;
				data.set('nameFound', addComp.city + addComp.district + addComp.street + addComp.streetNumber)
				this.addClickHandler(this.getRemark(p), marker);
			}, this);
		}
	},
	addClickHandler: function (html, marker) {
		marker.addEventListener("click", function (e) {
			var p = e.target;
			var point = new BMap.Point(p.getPosition().lng, p.getPosition().lat);
			var infoWindow = new BMap.InfoWindow(html);
			this.map.openInfoWindow(infoWindow, point);
		}, this);
	},
	getRemark: function (p) {
		var data = this.store.getAt(p);
		if (data.get('name') === '')
			return data.get('code') + '<br/>' + data.get('nameFound');
		return data.get('code') + '<br/>' + data.get('name');
	},
	addPolyline: function (route, flag) {
		var color;
		if (flag == 0)
			color = "blue";
		else if (flag == 1)
			color = "green";
		else
			color = "red"

		this.pathDesc = [];
		var prevPoint = route[0];
		for (var i = 1; i < route.length; i++) {
			this.pathDesc[this.pathDesc.length] = [];
			this.driveLine(prevPoint, route[i], {
				strokeColor: color,
				strokeWeight: 3.6,
				strokeOpacity: 0.5
			}, this.pathDesc.length - 1, this.map, this.overlays);
			prevPoint = route[i];
		}
	},
	driveLine: function (p1, p2, values, result, map, overlays) {
		this.pathDesc[result][0] = p1;
		this.pathDesc[result][1] = p2;
		this.pathDesc[result][2] = '';
		var driving = new BMap.DrivingRoute(map);
		driving.setSearchCompleteCallback(function () {
			var pts = driving.getResults().getPlan(0).getRoute(0).getPath();
			var polyline = new BMap.Polyline(pts, values);
			map.addOverlay(polyline);
			overlays['r' + p1 + '-' + p2] = polyline;
			//var plan = driving.getResults().getPlan(0);
		});
		driving.search(this.points[p1], this.points[p2]);
	},
	centerPoint: function (route) {
		if (typeof(route) == 'number')
			return this.points[route];

		var longitude = 0.0;
		var latitude = 0.0;
		for (var j = 0; j < route.length; j++) {
			longitude += this.store.getAt(route[j]).get('lng');
			latitude += this.store.getAt(route[j]).get('lat');
		}
		return new BMap.Point(longitude / route.length, latitude / route.length);
	}
});
Ext.reg('mappanel', VrpSolver.MapPanel);
