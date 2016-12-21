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
