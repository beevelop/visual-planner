// grid interface
var IVipGrid = {
};

// global object
var vip = {
	grid: null,
	layout: {
		col_count: 8,
		col_header: true,
		col_offset: true,
		highlight_weekend: true
	},
	multi_col: {
		auto_scroll: true,
		offset: -1,
		count: 8,
		past_transparency: 30
	},
	events: {
		time_24hr: true,
		proportional: {show: false, start_hour:8, end_hour:20},
		title: {show: true, time: true, colour: false, hide_marker: false},
		marker: {hide: false},
		timed: {show: true, multi_day_as_all_day: false},
		allday: {show: true, one_day_as_timed: true, multi_day_as_timed: false, width_chars: 1}
	},
	selection: {start: null, end: null},
	touch: {id: null, start: {x:0, y:0}},
	event_req: {add: null, queue: [], pending: false}
};

function vip_init_grid(container_id)
{
	vip.grid = new VipGrid(container_id ? document.getElementById(container_id) : document.body);

	install_event_handling();
}

function install_event_handling()
{
	// resizing
	window.top.onresize = onResizeView;

	// disable default selection behaviour
	document.body.style.webkitUserSelect = "none"; // ch
	document.body.style.MozUserSelect = "none"; // ff
	document.body.onselectstart = function(){return false}; // ie
	document.body.style.cursor = "default";

	// keyboard/mouse events
	window.addEventListener('keydown', onkeydown, true);
	window.addEventListener('mousedown', onmousedown, true);
	window.addEventListener('mousemove', onmousemove, true);
	window.addEventListener('mouseup', onmouseup, true);
	window.addEventListener('mousewheel', onmousewheel, true);  // ch
	window.addEventListener('DOMMouseScroll', onmousewheel, true);  // ff

	// touch events
	vip.grid.div.addEventListener('touchstart', ontouchstart, false);
	vip.grid.div.addEventListener('touchmove', ontouchmove, false);
	vip.grid.div.addEventListener('touchend', ontouchend, false);
	vip.grid.div.addEventListener('touchcancel', ontouchcancel, false);

	// printing
	if (window.matchMedia)
	{
		var mql = window.matchMedia("print");

		if (mql)
			mql.addListener(onMediaChange);
	}
}

function onResizeView()
{
	vip.grid.updateLayout(true);
}

function onMediaChange(mql)
{
	vip.grid.updateLayout(true);

	//if (mql.matches)
		//ga_hit('media', 'print');
}


/////////////////////////////////////////////////////////////////
// mouse/keyboard event handlers

function onclick_day_number(event)
{
	var num = event.target;

	if ("vipobj" in num)
	if (num.vipobj.parent instanceof VipCell)
	{
		var url = fmt("https://www.google.com/calendar/render?date=^&mode=day", num.vipobj.parent.vipdate.Datestamp());
		window.open(url);
	}
}

function onclick_month_header(event)
{
	var cell = event.target;

	if ("vipobj" in cell)
	if (cell.vipobj.parent instanceof VipCol)
	{
		var url = fmt("https://www.google.com/calendar/render?date=^&mode=month", cell.vipobj.parent.vdt_month.Datestamp());
		window.open(url);
	}
}

function onkeydown(event)
{
	var clicks=0;

	switch (event.which)
	{
		case 37:  // back
		case 38:  // up
			clicks = -1;
			break;
		case 39:  // right
		case 40:  // down
			clicks = 1;
			break;
		default:
			return;
	}

	vip.grid.scroll_col(clicks, "key");

	event.returnValue = false;
	event.preventDefault();
}

function onmousewheel(event)
{
	var delta = event.wheelDelta ? event.wheelDelta : -event.detail;
	
	if (delta > 0)
		vip.grid.scroll_col(-1, "mouse");

	if (delta < 0)
		vip.grid.scroll_col(1, "mouse");

	event.preventDefault();
}

function onmousedown(event)
{
	var vipcell = getVipCell(event.target);
	
	if (vipcell)
		init_selection(vipcell);
}

function onmousemove(event)
{
	var vipcell = getVipCell(event.target);
	
	if (vipcell)
		update_selection(vipcell);
}

function onmouseup(event)
{
	complete_selection("mouse");
}

function getVipCell(target)
{
	var vipcell = null;
	
	if ("vipobj" in target)
	if (target.vipobj instanceof VipCell)
		vipcell = target.vipobj;

	return vipcell;
}

function init_selection(vipcell)
{
	cancel_selection();
	
	vipcell.vipcol.vipsel.Align(vipcell, vipcell);

	vip.selection.start = vipcell;
	vip.selection.end = vipcell;
}

function update_selection(cell_upd)
{
	if (!vip.selection.start)
		return;

	if (cell_upd === vip.selection.end)
		return;  // selection not changed

	// set the target selection range, in left to right order
	var ltor = cell_upd.isBefore(vip.selection.start);
	var cell_targ_left = ltor ? cell_upd : vip.selection.start;
	var cell_targ_right = ltor ? vip.selection.start : cell_upd;

	// set the column update range, in left to right order
	var ltor = vip.selection.end.isBefore(cell_upd);
	var col_upd_left = ltor ? vip.selection.end.vipcol : cell_upd.vipcol;
	var col_upd_right = ltor ? cell_upd.vipcol : vip.selection.end.vipcol;
	
	// update columns
	var col = col_upd_left;
	while (true)
	{
		col.vipsel.Align(null);
		col.updateSelectionTip(null);

		var cell_top = (col === cell_targ_left.vipcol) ? cell_targ_left : null;
		var cell_bottom = (col === cell_targ_right.vipcol) ? cell_targ_right : null;
		
		if (!cell_top)
		if (col.firstcell.inRange(cell_targ_left, cell_targ_right))
			cell_top = col.firstcell;
		
		if (!cell_bottom)
		if (col.lastcell.inRange(cell_targ_left, cell_targ_right))
			cell_bottom = col.lastcell;
		
		if (cell_top && cell_bottom)
			col.vipsel.Align(cell_top, cell_bottom);

		if (col === col_upd_right)
			break;

		col = col.Next();
	}

	vip.selection.end = cell_upd;

	cell_upd.vipcol.updateSelectionTip(vip.selection.start, vip.selection.end);
}

function complete_selection(ui_event)
{
	if (vip.selection.start)
	if (! (vip.selection.start === vip.selection.end) )
	{
		//ga_hit('create_calendar_event', ui_event);
		create_calendar_event();
	}

	cancel_selection();
}

function cancel_selection()
{
	if (!vip.selection.start)
		return;

	update_selection(vip.selection.start);
	vip.selection.start.vipcol.vipsel.Align(null);
	vip.selection.start.vipcol.updateSelectionTip(null);

	vip.selection.start = null;
	vip.selection.end = null;
}

function create_calendar_event()
{
	if (vip.selection.start.isBefore(vip.selection.end))
	{
		var vdt_start = new VipDate(vip.selection.start.vipdate);
		var vdt_end = new VipDate(vip.selection.end.vipdate);
	}
	else
	{
		var vdt_start = new VipDate(vip.selection.end.vipdate);
		var vdt_end = new VipDate(vip.selection.start.vipdate);
	}
	
	vdt_end.MoveDays(1);  // end date is exclusive

	//google.calendar.composeEvent({allDay: true, startTime: vdt_start.GCalDate(), endTime: vdt_end.GCalDate()});
	console.log("create calendar event:");
	console.log(vdt_start);
	console.log(vdt_end);
}

function ontouchstart(event)
{
	if (event.touches.length == 1)
	{
		var t = event.touches[0];

		vip.touch.id = t.identifier;
		vip.touch.start.x = t.pageX;
		vip.touch.start.y = t.pageY;
	}
}

function ontouchmove(event)
{
	if (event.touches.length != 1)
	{
		ontouchcancel();
		return;
	}
	
	var t = event.touches[0];
	
	if (t.identifier != vip.touch.id)
	{
		ontouchcancel();
		return;
	}
	
	if (vip.selection.start)
	{
		var vipcell = getVipCell(document.elementFromPoint(t.pageX, t.pageY));
		
		if (vipcell)
			update_selection(vipcell);
	}

	event.preventDefault();
}

function ontouchend(event)
{
	if (event.changedTouches.length != 1)
	{
		ontouchcancel();
		return;
	}
	
	var t = event.changedTouches[0];
	
	if (t.identifier != vip.touch.id)
	{
		ontouchcancel();
		return;
	}
	
	if (vip.selection.start)
	{
		complete_selection("touch");
	}
	else
	{
		var dx = Math.abs(vip.touch.start.x - t.pageX);
		var dy = Math.abs(vip.touch.start.y - t.pageY);
		
		if (dx > dy)
		if (dx > 30)
			vip.grid.scroll_col((vip.touch.start.x > t.pageX) ? 1 : -1, "touch");
	}

	ontouchcancel();
}

function ontouchcancel(event)
{
	vip.touch.id = null;
	cancel_selection();
}
