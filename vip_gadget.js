vip.event_req = {queue: [], pending: false};


function init_gadget()
{
	google.calendar.getPreferences(receive_GCalPrefs);
}

function InitSingleColView()
{
	init_gadget();
	
	vip_init_grid(grid);
	vip.grid.onloadVipCol = addVipEventRequest;
	vip.grid.createSingleCol();

	updateSingleColLayout();
}

function updateSingleColLayout()
{
	var prefs = new gadgets.Prefs();
	var show = prefs.getBool("show_single_col");

	var grid = document.getElementById("grid");
	grid.style.visibility = show ? "visible" : "hidden";

	gadgets.window.adjustHeight(show ? grid.offsetBottom : grid.offsetTop);

	google.calendar.subscribeToDates(show ? update_dates : null);
	google.calendar.subscribeToDataChange(show ? update_events : null);

	//ga_hit('view', vip.single_col.show ? 'single_col' : 'none');
}

function InitMultiColView()
{
	//ga_hit('view', 'multi_col');
	//ga_hit('multi_col_count', vip.multi_col.count);
	//ga_hit('multi_col_scroll_offset', vip.multi_col.auto_scroll ? vip.multi_col.offset : 'n/a');
	//ga_hit('event_format', vip.events.format);
	
	init_gadget();
	vip_init_grid(document.body);
	vip.grid.onloadVipCol = addVipEventRequest;
	vip.grid.create();
}

function show_multi_col()
{
	//window.open("https://ctcode.github.io/ctcode/visual-planner/vip.html");
	//window.open("https://rawgit.com/ctcode/visual-planner/dev/vip.html");
	gadgets.views.requestNavigateTo('canvas');
}

function toggle_single_col()
{
	var prefs = new gadgets.Prefs();
	var show = prefs.getBool("show_single_col");
	prefs.set("show_single_col", (!show).toString());

	updateSingleColLayout();
}

function show_settings()
{
	//window.top.location.replace("https://ctcode.github.io/ctcode/visual-planner/vip_settings.html");
	window.top.location.replace("https://rawgit.com/ctcode/visual-planner/dev/vip_settings.html");
}

function receive_GCalPrefs(prefs)
{
	if ('military' in prefs)
		vip.events.time_24hr = prefs.military;
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

	google.calendar.composeEvent({allDay: true, startTime: vdt_start.GCalDate(), endTime: vdt_end.GCalDate()});
}

function onclickVipDayNumber(event)
{
	var num = event.target;

	if ("vipobj" in num)
	if (num.vipobj.parent instanceof VipCell)
	{
		var dt = num.vipobj.parent.vipdate.dt;
		google.calendar.showDate(dt.getFullYear(), (dt.getMonth() + 1), dt.getDate());
	}
}

function addVipEventRequest(vipcol)
{
	vip.event_req.queue.push(vipcol);
	request_events();
}


/////////////////////////////////////////////////////////////////
// calendar event handlers

function update_dates(cal_dates)
// callback when user changes calendar date range
{
	update_indicator(cal_dates);
}

function update_indicator(cal_dates)
// redraw date range indicator
{
	var vipcol = vip.grid.First();
	if (!vipcol) return;
	vipcol.vipind.Align(null);

	var vdt_start = gdt2vdt(cal_dates.startTime);
	var vdt_end = gdt2vdt(cal_dates.endTime);

	var cell_top = vip.grid.getVipCell(vdt_start);
	var cell_bottom = vip.grid.getVipCell(vdt_end);
	var cell_first = vipcol.vipcells.First();
	var cell_last = vipcol.vipcells.Last();

	if (!cell_top)
	if (cell_first.inDateRange(vdt_start, vdt_end))
		cell_top = cell_first;

	if (!cell_bottom)
	if (cell_last.inDateRange(vdt_start, vdt_end))
		cell_bottom = cell_last;
	
	if (cell_top && cell_bottom)
		vipcol.vipind.Align(cell_top, cell_bottom);
}

function gdt2vdt(gdt)
{
	var dt = google.calendar.utils.toDate(gdt);
	var vdt = new VipDate.YMD(dt.getFullYear(), dt.getMonth()+1, dt.getDate());
	return vdt;
}

function update_events()
// callback when calendar events have changed
{
	vip.event_req.queue = [];
	
	// clear existing event items
	var vipcol = vip.grid.First();
	while (vipcol)
	{
		vipcol.vipevts.ClearContent();
		
/*
		var vipcell = vipcol.vipcells.First();
		while (vipcell)
		{
			vipcell.vipevts.ClearContent();
			vipcell.updateEventInfo();

			vipcell = vipcell.Next();
		}
*/

		vip.event_req.queue.push(vipcol);
		
		vipcol = vipcol.Next();
	}

	vip.event_req.pending = false;
	request_events();
}

function request_events()
{
	if (vip.event_req.pending)
		return;

	if (vip.event_req.queue.length == 0)
		return;

	vip.event_req.pending = true;

	var gdtStart = google.calendar.utils.fromDate(vipcol.datespan.start.dt);
	var gdtEnd = google.calendar.utils.fromDate(vipcol.datespan.end.dt);
	google.calendar.read.getEvents(receive_events, "selected", gdtStart, gdtEnd);
}

function receive_events(data)
// callback when event data received
{
	vip.event_req.pending = false;
	request_events();

	for (var j in data)
	{
		var cal_data = data[j];

		if (cal_data.error)
		{
			alert(fmt("visual-planner: error retrieving event data : ^", cal_data.error));
			return;
		}
		
		// draw new events
		for (var k in cal_data.events)
		{
			var event = cal_data.events[k];
			
			if (cal_data.name)
				event.calendar = cal_data.name;

			if (event.allDay)
				add_all_day_event(event);
			else
				add_timed_event(event);
		}
	}
}

function add_all_day_event(event)
{
console.log(event);
	if (!vip.events.allday.show)
		return;
	
	var vdt_start = new VipDate.GCal(event.startTime);
	var vdt_end = new VipDate.GCal(event.endTime);

	var vdt_nextday = new VipDate(vdt_start);
	vdt_nextday.MoveDays(1);
	var one_day_evt = (vdt_nextday.isSameDay(vdt_end))

	while (vdt_start.Datestamp() < vdt_end.Datestamp())
	{
		var vipcell = vip.host.getVipCell(vdt_start);

		if (vipcell)
		{
			if (vip.events.allday.one_day_as_timed && one_day_evt)
				vipcell.addEvent(event);
			else if (vip.events.allday.multi_day_as_timed && !one_day_evt)
				vipcell.addEvent(event);
			else
				vipcell.vipcol.addEvent(event, vipcell);
		}

		vdt_start.MoveDays(1);
	}
}

function add_timed_event(event)
{
return;
	if (!vip.events.timed.show)
		return;
	
	var vdt_start = new VipDate.GCal(event.startTime);
	var vdt_end = new VipDate.GCal(event.endTime);

	if (vdt_start.isSameDay(vdt_end))
	{
		var vipcell = vip.host.getVipCell(vdt_start);
		
		if (vipcell)
			vipcell.addEvent(event);
	}
	else
	{
		while (vdt_start.Datestamp() <= vdt_end.Datestamp())
		{
			var vipcell = vip.host.getVipCell(vdt_start);

			if (vipcell)
			{
				if (vip.events.timed.multi_day_as_all_day)
					vipcell.vipcol.addEvent(event, vipcell);
				else
					vipcell.addEvent(event);
			}

			vdt_start.MoveDays(1);
		}
	}
}
