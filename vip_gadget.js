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

	google.calendar.subscribeToDates(show ? update_dates : function() {});
	google.calendar.subscribeToDataChange(show ? update_events : function() {});
}

function InitMultiColView()
{
	init_gadget();
	vip_init_grid(document.body);
	vip.grid.onloadVipCol = addVipEventRequest;
	vip.grid.create();
}

function show_multi_col()
{
	//window.open("https://beevelop.github.io/visual-planner/vip.html");
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
	window.top.location.replace("https://beevelop.github.io/visual-planner/vip_settings.html");
}

function receive_GCalPrefs(prefs)
{
	if ('military' in prefs)
		vip.grid.time_24hr = prefs.military;
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

	google.calendar.composeEvent({allDay: true, startTime: vdt2gdt(vdt_start), endTime: vdt2gdt(vdt_end)});
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

function update_events()
// callback when calendar events have changed
{
	vip.event_req.queue = [];
	
	// clear existing event items
	var vipcol = vip.grid.First();
	while (vipcol)
	{
		vipcol.vipevts.ClearContent();
		
		var vipcell = vipcol.vipcells.First();
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
			alert(fmt("visual-planner - error retrieving event data : ^", cal_data.error));
			return;
		}
		
		for (var k in cal_data.events)
		{
			var calevt = cal_data.events[k];
			var info = new VipEventInfo();

			if (cal_data.name)
				info.calendar_name = cal_data.name;

			info.vdtStart = new VipDate.YMD(calevt.startTime.year, calevt.startTime.month, calevt.startTime.date);
			info.vdtEnd = new VipDate.YMD(calevt.endTime.year, calevt.endTime.month, calevt.endTime.date);
			info.id = calevt.id;
			info.title = calevt.title;
			info.colour = calevt.palette.medium;

			if (calevt.allDay)
			{
				info.timed = false;
				info.duration = (info.vdtEnd.UTCDay() - info.vdtStart.UTCDay());
			}
			else
			{
				info.timed = true;
				info.duration = (info.vdtEnd.UTCDay() - info.vdtStart.UTCDay() + 1);
				info.vtmStart = new VipTime.HourMin(calevt.startTime.hour, calevt.startTime.minute);
				info.vtmEnd = new VipTime.HourMin(calevt.endTime.hour, calevt.endTime.minute);
			}
			
			vip.grid.addEvent(info);
		}
	}
}

function gdt2vdt(gdt)
{
	var dt = google.calendar.utils.toDate(gdt);
	var vdt = new VipDate.YMD(dt.getFullYear(), dt.getMonth()+1, dt.getDate());
	return vdt;
}

function gdt2vtm(gdt)
{
	var dt = google.calendar.utils.toDate(gdt);

	var vtm = new VipTime;
	vtm.hh = dt.getHours();
	vtm.mm = dt.getMinutes();

	return vtm;
}

function vdt2gdt(vdt)
{
	return google.calendar.utils.fromDate(vdt.dt);
}
