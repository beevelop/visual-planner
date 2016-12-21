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
		google.calendar.subscribeToDataChange(update_events);
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
	//window.open("https://ctcode.github.io/ctcode/visual-planner/vip.htm");
	//window.open("https://rawgit.com/ctcode/visual-planner/dev/vip.htm");
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
