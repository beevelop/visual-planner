// global object
var vip = {
	multi_col: {
		auto_scroll: true,
		offset: -1,
		count: 8,
		past_transparency: 50
	},
	cell: {width: 144, height: 16, margin: 20},
	events: {
		time_24hr: true,
		proportional: {show: false, start_hour:8, end_hour:20},
		title: {show: true, time: true, colour: false, hide_marker: false},
		marker: {width: 6, height: 11, hide: false},
		multi_day: {separate_all: false, separate_first: false}
	},
	selection: {start: null, end: null},
	touch: {id: null, start: {x:0, y:0}},
	event_req: {add: null, queue: [], pending: false}
};

function init()
{
	vip.host = new VipHost();
	var cell = new VipClrBar(vip.host, "clrbar", "grey", 20, 200);
	cell.setSize(500,160);
	cell.div.style.fontSize = "100px";
	cell.Show(true);
	
	var viptitle = new VipDiv(cell, "viptitle");
	viptitle.setText("Arsey");
	viptitle.div.style.whiteSpace = "nowrap";
	//viptitle.div.style.height = 160;
	viptitle.div.style.lineHeight = "160px";
	viptitle.setPos(20, 0);
}
