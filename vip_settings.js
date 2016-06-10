function InitSettings()
{
/*
	document.getElementById("basic_marker").checked = true;

	var prefs = new gadgets.Prefs();
	document.getElementById("multi_col_count").value = prefs.getInt("multi_col_count");
	document.getElementById("fixed_cell_size").checked = prefs.getBool("fixed_cell_size");
	document.getElementById("fixed_height").value = prefs.getInt("fixed_height");
	document.getElementById("fixed_width").value = prefs.getInt("fixed_width");
	document.getElementById("auto_scroll").checked = prefs.getBool("auto_scroll");
	document.getElementById("start_month_offset").value = prefs.getInt("start_month_offset");
	document.getElementById("past_transparency").value = prefs.getInt("past_transparency");
	document.getElementById("proportional_events").checked = prefs.getBool("proportional_events");
	document.getElementById("evt_start_hour").value = prefs.getInt("evt_start_hour");
	document.getElementById("evt_end_hour").value = prefs.getInt("evt_end_hour");
	document.getElementById("show_event_title").checked = prefs.getBool("show_event_title");
	document.getElementById("show_evt_time").checked = prefs.getBool("show_evt_time");
	document.getElementById("use_evt_colour").checked = prefs.getBool("use_evt_colour");
	document.getElementById("hide_evt_marker").checked = prefs.getBool("hide_evt_marker");
	document.getElementById("show_all_day_evts").checked = prefs.getBool("show_all_day_evts");
	document.getElementById("one_day_as_timed").checked = prefs.getBool("one_day_as_timed");
	document.getElementById("multi_day_as_timed").checked = prefs.getBool("multi_day_as_timed");
	document.getElementById("show_timed_evts").checked = prefs.getBool("show_timed_evts");
	document.getElementById("multi_day_as_all_day").checked = prefs.getBool("multi_day_as_all_day");
	document.getElementById("all_day_evt_width_chars").value = prefs.getInt("all_day_evt_width_chars");

	document.getElementById("available_space").innerHTML = fmt("^x^", document.body.clientWidth, document.body.clientHeight);

	ga_hit('view', 'settings');
*/
}

function onSaveSettings()
{
	setdoc.getElementById("save_btn").innerHTML = "<i>Saving...</i>";
	
/*
	prefs.set("multi_col_count", setdoc.getElementById("multi_col_count").value);
	prefs.set("fixed_cell_size", setdoc.getElementById("fixed_cell_size").checked.toString());
	prefs.set("fixed_height", setdoc.getElementById("fixed_height").value);
	prefs.set("fixed_width", setdoc.getElementById("fixed_width").value);
	prefs.set("auto_scroll", setdoc.getElementById("auto_scroll").checked.toString());
	prefs.set("start_month_offset", setdoc.getElementById("start_month_offset").value);
	prefs.set("past_transparency", setdoc.getElementById("past_transparency").value);
	prefs.set("proportional_events", setdoc.getElementById("proportional_events").checked.toString());
	prefs.set("evt_start_hour", setdoc.getElementById("evt_start_hour").value);
	prefs.set("evt_end_hour", setdoc.getElementById("evt_end_hour").value);
	prefs.set("show_event_title", setdoc.getElementById("show_event_title").checked.toString());
	prefs.set("show_evt_time", setdoc.getElementById("show_evt_time").checked.toString());
	prefs.set("use_evt_colour", setdoc.getElementById("use_evt_colour").checked.toString());
	prefs.set("hide_evt_marker", setdoc.getElementById("hide_evt_marker").checked.toString());
	prefs.set("show_all_day_evts", setdoc.getElementById("show_all_day_evts").checked.toString());
	prefs.set("one_day_as_timed", setdoc.getElementById("one_day_as_timed").checked.toString());
	prefs.set("multi_day_as_timed", setdoc.getElementById("multi_day_as_timed").checked.toString());
	prefs.set("show_timed_evts", setdoc.getElementById("show_timed_evts").checked.toString());
	prefs.set("multi_day_as_all_day", setdoc.getElementById("multi_day_as_all_day").checked.toString());
	prefs.set("all_day_evt_width_chars", setdoc.getElementById("all_day_evt_width_chars").value);
*/

	window.setTimeout(reload_calendar, 1000);
}

function reload_calendar()
{
	window.top.location.replace("https://www.google.com/calendar/render");
}
