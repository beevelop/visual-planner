function show_single_col()
{
	var prefs = new gadgets.Prefs();
	var show_single_col = prefs.getBool("show_single_col");
	google.calendar.getPreferences(receive_GCalPrefs);

	vip.host.ClearContent();
	gadgets.window.adjustHeight();

	if (show_single_col)
	{
		gadgets.window.adjustHeight(26 + (28*vip.cell.height));

		vip.host.createSingleCol();

		google.calendar.subscribeToDates(update_dates);
		//google.calendar.subscribeToDataChange(update_events);
	}
	else
	{
		google.calendar.subscribeToDates(null);
		google.calendar.subscribeToDataChange(null);
	}

	ga_hit('view', show_single_col ? 'single_col' : 'none');
}

function toggle_single_col()
{
	var prefs = new gadgets.Prefs();
	prefs.set("show_single_col", (!prefs.getBool("show_single_col")).toString());

	show_single_col();
}

function show_multi_col()
{
	if (confirm("Open standalone?"))
		//window.open("https://ctcode.github.io/ctcode/visual-planner/vip.htm");
		window.open("https://rawgit.com/ctcode/visual-planner/dev/vip.htm");
	else
		gadgets.views.requestNavigateTo('canvas');
}

function show_settings()
{
	//window.top.location.replace("https://ctcode.github.io/ctcode/visual-planner/vip_settings.htm");
	window.top.location.replace("https://rawgit.com/ctcode/visual-planner/dev/vip_settings.htm");
}

function receive_GCalPrefs(prefs)
{
	if ('military' in prefs)
		vip.events.time_24hr = prefs.military;
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
	var vipcol = vip.host.getFirstChild();
	if (!vipcol) return;
	vipcol.vipind.Align(null);

	var vdt_start = new VipDate.GCal(cal_dates.startTime);
	var vdt_end = new VipDate.GCal(cal_dates.endTime);

	var cell_top = vip.host.getVipCell(vdt_start);
	var cell_bottom = vip.host.getVipCell(vdt_end);
	var cell_first = vipcol.vipcells.getFirstChild();
	var cell_last = vipcol.vipcells.getLastChild();

	if (!cell_top)
	if (cell_first.inDateRange(vdt_start, vdt_end))
		cell_top = cell_first;

	if (!cell_bottom)
	if (cell_last.inDateRange(vdt_start, vdt_end))
		cell_bottom = cell_last;
	
	if (cell_top && cell_bottom)
		vipcol.vipind.Align(cell_top, cell_bottom);
}

function update_events()
// callback when calendar events have changed
{
	vip.event_req.queue = [];
	
	// clear existing event items
	var vipcol = vip.host.getFirstChild();
	while (vipcol)
	{
		vipcol.vipevts.ClearContent();
		
		var vipcell = vipcol.vipcells.getFirstChild();
		while (vipcell)
		{
			vipcell.vipevts.ClearContent();
			vipcell.updateEventInfo();

			vipcell = vipcell.Next();
		}

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

	var vipcol = vip.event_req.queue.shift();
	google.calendar.read.getEvents(receive_events, "selected", vipcol.ReqDateStart, vipcol.ReqDateEnd);
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
