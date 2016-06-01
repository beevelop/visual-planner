// global object
var vip = {
	single_col: {show: false},
	multi_col: {
		auto_scroll: true,
		offset: -1,
		count: 8,
		scale: {fixed: false, width: 144, height: 16},
		past_transparency: 50
	},
	cell: {width: 144, height: 16, margin: 20, font_client: {}},
	events: {
		time_24hr: true,
		proportional: {show: false, start_hour:8, end_hour:20},
		title: {show: false, time: false, colour: false, hide_marker: false},
		timed: {show: true, multi_day_as_all_day: false},
		allday: {show: true, one_day_as_timed: true, multi_day_as_timed: false, width_chars: 1}
	},
	selection: {start: null, end: null},
	touch: {id: null, start: {x:0, y:0}},
	event_req: {add: onAddEventRequest, queue: [], pending: false}
};

function VipInit()
{
	if (vip.events.proportional.start_hour >= vip.events.proportional.end_hour)
	{
		vip.events.proportional.start_hour = 0;
		vip.events.proportional.end_hour = 24;
	}

	if (vip.events.title.show)
		vip.events.format = 'title';
	else if (vip.events.proportional.show)
		vip.events.format = 'proportional';
	else
		vip.events.format = 'basic';

	//google.calendar.getPreferences(receive_GCalPrefs);

	vip.host = new VipHost();
	vip.host.createMultiCol();

	install_event_handling();

	ga_hit('context', 'standalone');
	ga_hit('multi_col_count', vip.multi_col.count);
	ga_hit('multi_col_scroll_offset', vip.multi_col.auto_scroll ? vip.multi_col.offset : 'n/a');
	ga_hit('event_format', vip.events.format);
}

/*
function receive_GCalPrefs(prefs)
{
	if ('military' in prefs)
		vip.events.time_24hr = prefs.military;
}
*/

function install_event_handling()
{
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
	vip.host.div.addEventListener('touchstart', ontouchstart, false);
	vip.host.div.addEventListener('touchmove', ontouchmove, false);
	vip.host.div.addEventListener('touchend', ontouchend, false);
	vip.host.div.addEventListener('touchcancel', ontouchcancel, false);
}


/////////////////////////////////////////////////////////////////
// calendar event handlers

function onAddEventRequest(vipcol)
{
	//vip.event_req.queue.push(vipcol);
	//request_events();
}


/////////////////////////////////////////////////////////////////
// mouse/keyboard event handlers

function reload_calendar()
{
	window.top.location.replace("https://www.google.com/calendar/render");
}

function onclick_day_number(event)
{
	var num = event.target;

	if ("vipobj" in num)
	if (num.vipobj.parent instanceof VipCell)
		num.vipobj.parent.vipdate.ShowInCalendar();
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
	}

	vip.host.scroll_col(clicks, "key");

	event.returnValue=false;
}

function onmousewheel(event)
{
	if (vip.host.SingleCol)
		return;

	var delta = event.wheelDelta ? event.wheelDelta : -event.detail;
	
	if (delta > 0)
		vip.host.scroll_col(-1, "mouse");

	if (delta < 0)
		vip.host.scroll_col(1, "mouse");

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
		ga_hit('create_calendar_event', ui_event);
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
			vip.host.scroll_col((vip.touch.start.x > t.pageX) ? 1 : -1, "touch");
	}

	ontouchcancel();
}

function ontouchcancel(event)
{
	vip.touch.id = null;
	cancel_selection();
}
