function vip_init()
{
	vip_init_grid(document.getElementById("grid"));

	//vip.grid.proportional_events = true;
	//vip.grid.show_event_title = false;

	vip.grid.create();
	
	evt_test();
}

var dt_start = new Date;
while (dt_start.getDay() != 1)
	dt_start.setDate(dt_start.getDate() - 1);

function create_evt(evt_id, evt_allday, evt_title, time_start, time_end, evt_colour)
{
	var dt_evt_start = new Date(dt_start);
	dt_evt_start.setDate(dt_evt_start.getDate() + time_start.dayoff);

	var dt_evt_end = new Date(dt_start);
	dt_evt_end.setDate(dt_evt_end.getDate() + time_end.dayoff);

	return {
		id: evt_id,
		allDay: evt_allday,
		title: evt_title,
		startTime: {year: dt_evt_start.getFullYear(), month: (dt_evt_start.getMonth() + 1), day: dt_evt_start.getDate(), hour: time_start.hour, minute: time_start.min, second: 0},
		endTime: {year: dt_evt_end.getFullYear(), month: (dt_evt_end.getMonth() + 1), day: dt_evt_end.getDate(), hour: time_end.hour, minute: time_end.min, second: 0},
		palette: {medium: evt_colour}
	};
}

function evt_test()
{
	//update_events();

    receive_events(
	[
		{ // cal data
			name: "test calendar",
		    events: [
				create_evt("mdt", false, "multi-day timed", {dayoff:5, hour:10, min:0}, {dayoff:9, hour:13, min:15}, 'orange'),
				create_evt("one1", false, "very extremely long event's title", {dayoff:2, hour:1, min:30}, {dayoff:2, hour:13, min:0}, 'red'),
				create_evt("ad1", true, "all day &#39;1&#39;", {dayoff:4, hour:0, min:0}, {dayoff:14, hour:0, min:0}, 'blue'),
				create_evt("two2", false, "e2 &#39;timed&#39;", {dayoff:12, hour:9, min:30}, {dayoff:12, hour:12, min:0}, 'blue'),
				create_evt("three3", false, "e3abc 1234567890", {dayoff:12, hour:8, min:0}, {dayoff:12, hour:8, min:15}, 'magenta'),
				create_evt("four4", false, "e4 timed", {dayoff:12, hour:10, min:30}, {dayoff:12, hour:12, min:0}, 'red'),
				create_evt("five5", false, "e5", {dayoff:12, hour:9, min:0}, {dayoff:12, hour:12, min:0}, 'green'),
				create_evt("six", true, "e-six", {dayoff:2, hour:0, min:0}, {dayoff:3, hour:0, min:0}, 'grey'),
				create_evt("mcol_id", true, "multi-col", {dayoff:23, hour:0, min:0}, {dayoff:84, hour:0, min:0}, 'yellow'),
				create_evt("arseid", false, "&#39;arse&#39;", {dayoff:24, hour:11, min:45}, {dayoff:25, hour:13, min:15}, 'magenta'),
				create_evt("prop1", false, "proportional 1", {dayoff:26, hour:12, min:45}, {dayoff:26, hour:17, min:30}, 'coral'),
				create_evt("oneeventid", true, "one event", {dayoff:28, hour:0, min:0}, {dayoff:29, hour:0, min:0}, 'gold'),
				create_evt("twoeventid", true, "two event", {dayoff:28, hour:0, min:0}, {dayoff:29, hour:0, min:0}, 'gold')
		    ]
		}
	]
	);
};

function receive_events(data)
// callback when event data received
{
	//vip.event_req.pending = false;
	//request_events();

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

			info.vdtStart = new VipDate.YMD(calevt.startTime.year, calevt.startTime.month, calevt.startTime.day);
			info.vdtEnd = new VipDate.YMD(calevt.endTime.year, calevt.endTime.month, calevt.endTime.day);
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
