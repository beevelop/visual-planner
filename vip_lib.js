//////////////////////////////////////////////////////////////////////

function VipObject()
{
}

VipObject.prototype.createChildDiv = function(container_element, cls)
{
	var div = document.createElement('div');

	if (cls)
		div.className = cls;

	//div.style.pointerEvents = "none";
	//div.style.MozUserSelect = "none";  // ff fix
	div.vipobj = this;

	this.div = div;
	this.parent = null;
	
	container_element.appendChild(div);
}

VipObject.prototype.createChild = function(parent, cls)
{
	this.createChildDiv(parent.div, cls);
	this.parent = parent;
}

VipObject.prototype.addClass = function(cls)
{
	this.div.className += (" " + cls);
}

VipObject.prototype.ClearContent = function()
{
	if (this.div)
		this.div.innerHTML = "";
}

VipObject.prototype.First = function()
{
	var element = this.div.firstChild;
	
	if (element)
		return element.vipobj;

	return null;
}

VipObject.prototype.Last = function()
{
	var element = this.div.lastChild;
	
	if (element)
		return element.vipobj;

	return null;
}

VipObject.prototype.Next = function()
{
	var sib = this.div.nextSibling;
	
	if (sib)
		return sib.vipobj;
	
	return null;
}

VipObject.prototype.Prev = function()
{
	var sib = this.div.previousSibling;
	
	if (sib)
		return sib.vipobj;
	
	return null;
}

VipObject.prototype.setText = function(txt)
{
	this.div.textContent = txt;
}

VipObject.prototype.Show = function(showdiv)
{
	this.div.style.visibility = showdiv ? "visible" : "hidden";
}

VipObject.prototype.Align = function(cell_start, cell_end)
{
	if (cell_start && cell_end)
	{
		this.div.style.top = (cell_start.div.offsetTop) + "px";
		this.div.style.height = ((cell_end.div.offsetTop - cell_start.div.offsetTop) + cell_end.div.offsetHeight - 1) + "px";
		this.Show(true);
	}
	else
		this.Show(false);
}

VipObject.prototype.MoveLastBefore = function(vipsib)
{
	if (vipsib)
		this.div.insertBefore(this.div.removeChild(this.div.lastChild), vipsib.div);  // move last child
}



//////////////////////////////////////////////////////////////////////

function VipDiv(parent, id)
{
	this.createChild(parent, id);
}

VipDiv.prototype = new VipObject;



//////////////////////////////////////////////////////////////////////

function VipEventInfo()
{
	this.calendar_name = undefined;
	this.id = undefined;
	this.title = undefined;
	this.colour = undefined;
	this.timed = undefined;
	this.duration = undefined;
	this.vdtStart = undefined;
	this.vtmStart = undefined;
	this.vtmEnd = undefined;
}



//////////////////////////////////////////////////////////////////////

function VipGrid(container_element)
{
	this.createChildDiv(container_element, "vipgrid");

	this.cellmax = 31;
	this.col_header = true;
	this.scrolling_disabled = false;
	this.time_24hr = true;
	this.onloadVipCol = function() {};

	// user settings
	this.multi_col_count = 8;
	this.auto_scroll = true;
	this.auto_scroll_offset = -1;
	this.open_standalone = false;
	this.banner_text = "visual-planner";
	this.show_weekends = true;
	this.align_weekends = true;
	this.font_scale = 64;
	this.past_transparency = 30;
	this.show_event_time = true;
	this.show_event_title = true;
	this.show_event_marker = true;
	this.colour_event_title = false;
	this.proportional_events = false;
	this.proportional_start_hour = 8;
	this.proportional_end_hour = 20;
	this.multi_day_with_first_single_day = false;
	this.multi_day_as_single_day = false;
	this.all_day_single_day_as_multi_day = false;
	this.marker_width = 0.58;
	this.marker_transparency = 20;
	this.auto_refresh = false;
}

VipGrid.prototype = new VipObject;

VipGrid.prototype.createMultiCol = function()
{
	var vdt_start = new VipDate.Today();
	vdt_start.MoveToStartOfMonth();

	if (this.auto_scroll)
		vdt_start.MoveMonths(this.auto_scroll_offset);
	else
		vdt_start.MoveToStartOfYear();

	var vdt_end = new VipDate(vdt_start);

	var colcount = this.multi_col_count;
	if (this.isPortrait())
		colcount /= 2;

	for (var c=0; c < colcount; c++)
	{
		vdt_end.MoveMonths(1);

		var vipcol = new VipCol(this, vdt_start, vdt_end);
		
		vdt_start.MoveMonths(1);
	}

	this.updateLayout();
}

VipGrid.prototype.createSingleCol = function()
{
	this.cellmax = 28;
	this.col_header = false;
	this.align_weekends = false;
	this.scrolling_disabled = true;

	var vdt_start = new VipDate.Today();
	vdt_start.MoveToStartOfWeek(1);  // monday this week

	var vdt_end = new VipDate(vdt_start);
	vdt_end.MoveDays(28);
	
	var vipcol = new VipCol(this, vdt_start, vdt_end);
	vipcol.addClass("indicator");

	this.updateLayout();
}

VipGrid.prototype.updateLayout = function()
{
	if (this.div.childElementCount == 0)
		return;

	var c = this.cellmax;
	if (this.col_header) c++;
	if (this.align_weekends) c += 6;

	var colheight = this.First().div.offsetHeight;
	var cellheight = Math.floor(colheight/c);
	var cellnumpadding = Math.floor(cellheight/10);

	this.div.style.fontSize = (cellheight/16) * (this.font_scale/100) + "em";
	this.div.style.lineHeight = (cellheight - (cellnumpadding*2)) + "px";

	var fontsize = parseFloat(window.getComputedStyle(this.div).fontSize);
	
	this.div.style.setProperty('--cellheight', cellheight + "px");
	this.div.style.setProperty('--cellnumpadding', cellnumpadding + "px");
	this.div.style.setProperty('--markerwidth', Math.floor(fontsize*0.8) + "px");
	this.div.style.setProperty('--markerpadding', Math.floor(cellheight*0.2) + "px");
}

VipGrid.prototype.scroll_col = function(offset)
{
	if (this.scrolling_disabled)
		return;

	var cols = this.div;
	var ltor = (offset > 0);  // scroll direction
	var count = ltor ? offset : -offset;
	
	for (var c=0; c < count; c++)
		cols.removeChild(ltor ? cols.firstChild : cols.lastChild);

	var vipcol_prev = ltor ? cols.lastChild.vipobj : cols.firstChild.vipobj;
	var vdt_start = new VipDate(vipcol_prev.vdt_month);

	for (var c=0; c < count; c++)
	{
		vdt_start.MoveMonths(ltor ? 1:-1);

		var vdt_end = new VipDate(vdt_start);
		vdt_end.MoveMonths(1);

		var vipcol = new VipCol(this, vdt_start, vdt_end);

		if (!ltor)
			this.MoveLastBefore(this.First());  // move col to left
	}
}

VipGrid.prototype.isPortrait = function()
{
	var so = "n/a";
	if (screen.orientation)
	if (screen.orientation.type)
		so = screen.orientation.type;
	if (screen.msOrientation)  // edge, ie
		so = screen.msOrientation;

	if (so.includes("portrait"))
		return true;

	return false;
}

VipGrid.prototype.getVipCell = function(vdt)
{
	var div = document.getElementById(vdt.Datestamp());
	
	if (div)
	if (div.vipobj instanceof VipCell)
		return div.vipobj;

	return null;
}

VipGrid.prototype.addEvent = function(info)
{
	if (info.duration == 1)
	{
		var vipcell = this.getVipCell(info.vdtStart);
		
		if (vipcell)
		{
			if (info.timed)
			{
				vipcell.addEvent(info);
			}
			else
			{
				if (this.all_day_single_day_as_multi_day)
					vipcell.addColEvent(info);
				else
					vipcell.addEvent(info);
			}
		}
	}
	else
	{
		var vdtNext = new VipDate(info.vdtStart);
		var c=0;
		
		while (c < info.duration)
		{
			var vipcell = this.getVipCell(vdtNext);

			if (vipcell)
			{
				if (this.multi_day_as_single_day)
				{
					vipcell.addEvent(info);
				}
				else
				{
					vipcell.addColEvent(info);
					
					if (this.multi_day_with_first_single_day)
					if (c == 0)
						vipcell.addEvent(info);
				}
			}

			vdtNext.MoveDays(1);
			c++;
		}
	}
}

VipGrid.prototype.reloadEvents = function()
{
	var vipcol = this.First();
	while (vipcol)
	{
		vipcol.vipevts.ClearContent();
		
		var vipcell = vipcol.vipcells.First();
		while (vipcell)
		{
			vipcell.vipevts.ClearContent();
			vipcell.updateTooltip();

			vipcell = vipcell.Next();
		}

		this.onloadVipCol(vipcol);

		vipcol = vipcol.Next();
	}
}



//////////////////////////////////////////////////////////////////////

function VipCol(parent, vdt_start, vdt_end)
{
	this.createChild(parent, "vipcol");

	this.vdt_month = new VipDate(vdt_start);

	if (vip.grid.col_header)
	{
		this.viphdr = new VipDiv(this, "vipmonthhdr");
		this.viphdr.setText(this.vdt_month.MonthTitle());
		this.viphdr.div.onclick = onclickVipMonthHeader;

		if (this.vdt_month.isPastMonth())
			this.div.style.opacity = ((100 - vip.grid.past_transparency) / 100);
	}

	this.vipcoloffset = new VipDiv(this, "vipcoloffset");
	if (vip.grid.align_weekends)
		this.vipcoloffset.div.style.setProperty('--offsetday', this.vdt_month.DayOfWeek());

	this.vipcells = new VipDiv(this.vipcoloffset, "vipcells");
	
	var cellindex=0;
	var vdt_day = new VipDate(vdt_start);
	while (vdt_day.dt < vdt_end.dt)
	{
		var vipcell = new VipCell(this.vipcells, this, vdt_day);
		vipcell.vipindex = cellindex;

		vdt_day.MoveDays(1);
		cellindex++;
	}

	this.vipsel = new VipDiv(this.vipcoloffset, "vipsel");
	this.vipsel.Show(false);

	this.vipseltip = new VipDiv(this.vipcoloffset, "vipseltip");
	this.vipseltip.Show(false);

	this.vipind = new VipDiv(this.vipcoloffset, "vipind");
	this.vipind.Show(false);
	
	this.vipevts = new VipDiv(this.vipcoloffset, "vipcolevts");

	this.firstcell = this.vipcells.First();
	this.lastcell = this.vipcells.Last();
	this.datespan = {start: new VipDate(vdt_start), end: new VipDate(vdt_end)};
	
	vip.grid.onloadVipCol(this);
}

VipCol.prototype = new VipObject;

VipCol.prototype.updateSelectionTip = function(vipcell_start, vipcell_end)
{
	this.vipseltip.Show(false);

	if (!vipcell_start) return;
	if (!vipcell_end) return;
	if (vipcell_start === vipcell_end) return;

	this.vipseltip.div.style.lineHeight = vipcell_end.div.offsetHeight + "px";
	this.vipseltip.setText(vipcell_start.vipdate.TimespanTo(vipcell_end.vipdate));
	this.vipseltip.Align(vipcell_end, vipcell_end);
	this.vipseltip.Show(true);
}

VipCol.prototype.addEvent = function(info, vipcell)
{
	var vipevt = null;

	var vipsib = this.vipevts.First();
	while (vipsib)
	{
		if (info.id == vipsib.info.id)
		{
			vipevt = vipsib;
			break;
		}

		if (vipcell.vipdate.dt < vipsib.vipcell_start.vipdate.dt)  // sort in date order
			break;

		vipsib = vipsib.Next();
	}

	if (!vipevt)
	{
		vipevt = new VipMultiDayEvent(this.vipevts, info, vipcell);
		this.vipevts.MoveLastBefore(vipsib);
	}

	vipevt.extend(vipcell);
	this.findFreeSlot(vipevt);
}

VipCol.prototype.findFreeSlot = function(evt)
{
	var sib = this.vipevts.First();
	while (sib)
	{
		if (evt === sib) {}
		else
		{
			if (this.intersection(sib, evt))
			{
				evt.nextSlot();
				this.findFreeSlot(evt);
				return;
			}
		}

		sib = sib.Next();
	}
}

VipCol.prototype.intersection = function(evt1, evt2)
{
	if (evt1.div.offsetLeft == evt2.div.offsetLeft)
	if (evt1.div.offsetTop < (evt2.div.offsetTop + evt2.div.offsetHeight + 2))
	if ((evt1.div.offsetTop + evt1.div.offsetHeight + 2) > evt2.div.offsetTop)
		return true;

	return false;
}



//////////////////////////////////////////////////////////////////////

function VipMultiDayEvent(parent, info, vipcell)
{
	this.createChild(parent, "vipmultidayevent");

	this.info = info;
	this.div.style.backgroundColor = info.colour;
	this.div.style.setProperty('--start', vipcell.vipindex);
	this.vipcell_start = vipcell;
	this.vipcell_end = vipcell;
	this.setExtent(1);
	this.setSlot(1);
	
	var evt_title = html2txt(info.title);

	var cal_title = "";
	if (info.calendar_name)
		cal_title = info.calendar_name + " - ";

	this.div.title = cal_title + evt_title;
}

VipMultiDayEvent.prototype = new VipObject;

VipMultiDayEvent.prototype.setExtent = function(i)
{
	this.extent = i;
	this.div.style.setProperty('--extent', this.extent);
}

VipMultiDayEvent.prototype.extend = function(vipcell)
{
	this.vipcell_end = vipcell;
	this.setExtent(this.vipcell_end.vipindex - this.vipcell_start.vipindex + 1);
}

VipMultiDayEvent.prototype.setSlot = function(i)
{
	this.slot = i;
	this.div.style.setProperty('--slot', this.slot);
}

VipMultiDayEvent.prototype.nextSlot = function()
{
	this.setSlot(this.slot + 1);
}



//////////////////////////////////////////////////////////////////////

function VipCell(parent, vipcol, vdt)
{
	this.createChild(parent, "vipcell");
	this.vipcol = vipcol;
	this.vipdate = new VipDate(vdt);
	this.div.id = vdt.Datestamp();

	if (vip.grid.show_weekends)
	if (vdt.isWeekend())
		this.addClass("weekend");

	this.vipnum = new VipDiv(this, "vipcellnum");
	this.vipnum.setText(vdt.DayOfMonth());
	this.vipnum.div.onclick = onclickVipDayNumber;

	if (vdt.isToday())
		this.vipnum.addClass("today");
	
	this.vipevts = new VipDiv(this, "vipcellevts");
}

VipCell.prototype = new VipObject;

VipCell.prototype.isBefore = function(vipcell)
{
	return (this.div.id < vipcell.div.id);
}

VipCell.prototype.inRange = function(locell, hicell)
{
	if (this.div.id >= locell.div.id)
	if (this.div.id <= hicell.div.id)
		return true;

	return false;
}

VipCell.prototype.inDateRange = function(vdt_lo, vdt_hi)
{
	if (this.vipdate.dt >= vdt_lo.dt)
	if (this.vipdate.dt <= vdt_hi.dt)
		return true;

	return false;
}

VipCell.prototype.addColEvent = function(info)
{
	this.vipcol.addEvent(info, this);
	this.updateTooltip();
}

VipCell.prototype.addEvent = function(info)
{
	var vipsib = this.vipevts.First();
	while (vipsib)
	{
		if (info.id == vipsib.info.id)
			return;

		vipsib = vipsib.Next();
	}

	var vipevt = new VipSingleDayEvent(this, info);

	var vipsib = this.vipevts.First();
	while (vipsib)
	{
		if (vipevt.timestamp < vipsib.timestamp)
			break;

		vipsib = vipsib.Next();
	}

	this.vipevts.MoveLastBefore(vipsib);  // sort in time order

	this.updateTooltip();
}

VipCell.prototype.updateTooltip = function()
{
	var evtlist = [];

	var vipevt = this.vipcol.vipevts.First();
	while (vipevt)
	{
		if (this.inRange(vipevt.vipcell_start, vipevt.vipcell_end))
			evtlist.push(vipevt);

		vipevt = vipevt.Next();
	}

	var vipevt = this.vipevts.First();
	while (vipevt)
	{
		for (var i=0; i < evtlist.length; i++)
		{
			if (vipevt.info.id == evtlist[i].info.id)
			{
				evtlist.splice(i, 1);  // remove duplicate
				break;
			}
		}
		
		evtlist.push(vipevt);

		vipevt = vipevt.Next();
	}

	var str_tooltip = "";
	for (var i=0; i < evtlist.length; i++)
	{
		if (str_tooltip.length > 0)
			str_tooltip += '\n';
		
		str_tooltip += evtlist[i].div.title;
	}

	this.div.title = str_tooltip;
}



//////////////////////////////////////////////////////////////////////

function VipSingleDayEvent(vipcell, info)
{
	this.createChild(vipcell.vipevts, "vipsingledayevent");

	this.info = info;
	this.timestamp = info.timed ? info.vtmStart.Timestamp() : 0;
	this.firstday = (vipcell.vipdate.DayCount() == info.vdtStart.DayCount());
	this.lastday = (vipcell.vipdate.DayCount() == (info.vdtStart.DayCount() + info.duration - 1));
	
	var evt_title = html2txt(info.title);

	var time_title = "";
	if (this.info.timed)
	if (this.firstday)
	if (vip.grid.show_event_time)
		time_title = info.vtmStart.TimeTitle() + " ";

	var cal_title = "";
	if (info.calendar_name)
		cal_title = info.calendar_name + " - ";

	this.div.title = time_title + cal_title + evt_title;

	if (vip.grid.proportional_events)
	{
		this.vipmarker = new VipDiv(this, "vipeventmarker");
		this.vipmarker.addClass("proportional");
		this.calcProportionalMarker();
	}
	else
	{
		if (vip.grid.show_event_marker)
			this.vipmarker = new VipDiv(this, "vipeventmarker");

		if (vip.grid.show_event_title)
		{
			this.vipevttext = new VipDiv(this, "vipeventtext");
			this.vipevttext.setText(time_title + evt_title);

			if (vip.grid.colour_event_title)
				this.vipevttext.div.style.color = info.colour;
		}
	}
	
	if (this.vipmarker)
		this.vipmarker.div.style.backgroundColor = info.colour;
}

VipSingleDayEvent.prototype = new VipObject;

VipSingleDayEvent.prototype.calcProportionalMarker = function()
{
	var s_range_start = (vip.grid.proportional_start_hour * 3600);
	var s_range_end = (vip.grid.proportional_end_hour * 3600);
	var s_range = (s_range_end - s_range_start);

	var s_evt_start = s_range_start;
	var s_evt_end = s_range_end;

	if (this.firstday && this.info.vtmStart)
	{
		s_evt_start = this.info.vtmStart.toSeconds();

		if (s_evt_start < s_range_start)
			s_evt_start = s_range_start;
	}

	if (this.lastday && this.info.vtmEnd)
	{
		s_evt_end = this.info.vtmEnd.toSeconds();

		if (s_evt_end > s_range_end)
			s_evt_end = s_range_end;
	}

	this.vipmarker.div.style.left = (((s_evt_start - s_range_start) / s_range) * 100) + "%";
	this.vipmarker.div.style.width = (((s_evt_end - s_evt_start) / s_range) * 100) + "%";

/*
	var off_right = (this.vipmarker.div.offsetLeft + this.vipmarker.div.offsetWidth);
	if ((off_right <= 0) || (this.vipmarker.div.offsetLeft >= vipcell.vipevts.div.offsetWidth))
	{
		var viphidden = new VipDiv(this, "viphiddenevt");
		viphidden.setPos(0, y_off);
		viphidden.setText("...");
	}
*/
}



//////////////////////////////////////////////////////////////////////

function VipDate(vdt)
{
	if (vdt instanceof VipDate)
		this.dt = new Date(vdt.dt);  // make a copy
}

VipDate.prototype.dt_today = new Date;
VipDate.prototype.dt_today.setHours(0,0,0,0);

VipDate.prototype.constructor.Today = function()
{
	var vdt = new VipDate;
	vdt.dt = new Date(vdt.dt_today);
	return vdt;
}

VipDate.prototype.constructor.YMD = function(yyyy, mm, dd)
{
	var vdt = new VipDate;
	vdt.dt = new Date(yyyy, mm-1, dd);
	return vdt;
}

VipDate.prototype.MoveDays = function(offset)
{
	this.dt.setDate(this.dt.getDate() + offset);
}

VipDate.prototype.MoveMonths = function(offset)
{
	this.dt.setMonth(this.dt.getMonth() + offset);
}

VipDate.prototype.MoveToStartOfWeek = function(startday)
{
	while (this.dt.getDay() != startday)
		this.MoveDays(-1);
}

VipDate.prototype.MoveToStartOfMonth = function()
{
	this.dt.setDate(1);
}

VipDate.prototype.MoveToStartOfYear = function()
{
	this.dt.setMonth(0);
}

VipDate.prototype.Datestamp = function()
{
	return ((this.dt.getFullYear()*10000) + ((this.dt.getMonth() + 1)*100) + this.dt.getDate());
}

VipDate.prototype.DayCount = function()
{
	return (Math.floor(this.dt.valueOf()/(1000*3600*24)));
}

VipDate.prototype.DayOfMonth = function()
{
	return this.dt.getDate();
}

VipDate.prototype.DayOfWeek = function()
{
	return this.dt.getDay();
}

VipDate.prototype.MonthTitle = function()
{
	var dt_array = this.dt.toDateString().split(' ');
	return fmt("^ ^", dt_array[1], dt_array[3]);
}

VipDate.prototype.DayTitle = function()
{
	var dt_array = this.dt.toDateString().split(' ');
	return fmt("^ ^ ^", dt_array[0], this.DayOfMonth(), dt_array[1]);
}

VipDate.prototype.isWeekend = function()
{
	return (this.dt.getDay()==0 || this.dt.getDay()==6);
}

VipDate.prototype.isToday = function()
{
	return (this.dt.valueOf() == this.dt_today.valueOf());
}

VipDate.prototype.isSameDay = function(vdt)
{
	return (this.dt.valueOf() == vdt.dt.valueOf());
}

VipDate.prototype.isPastMonth = function()
{
	var vdt_this_month = new VipDate.Today();
	vdt_this_month.MoveToStartOfMonth();
	
	return (this.dt < vdt_this_month.dt);
}

VipDate.prototype.TimespanTo = function(vdt_end)
{
	var c = Math.abs(this.DayCount() - vdt_end.DayCount());
	var w = Math.floor(c/7);
	var d = (c-(w*7));
	
	return (w > 0 ? fmt("^, ^-^", c, w, d) : fmt("^", c));
}



//////////////////////////////////////////////////////////////////////

function VipTime(vtm)
{
	this.hh = 0;
	this.mm = 0;
	this.ss = 0;

	if (vtm instanceof VipTime)
	{
		this.hh = vtm.hh;
		this.mm = vtm.mm;
		this.ss = vtm.ss;
	}
}

VipTime.prototype.constructor.HourMin = function(hh, mm)
{
	var vtm = new VipTime;
	vtm.hh = hh;
	vtm.mm = mm;

	return vtm;
}

VipTime.prototype.Timestamp = function()
{
	return ((this.hh*10000) + (this.mm*100) + this.ss);
}

VipTime.prototype.toSeconds = function()
{
	return ((this.hh*60*60) + (this.mm*60) + this.ss);
}

VipTime.prototype.TimeTitle = function()
{
	var minutes = fmt((this.mm < 10) ? "0^" : "^", this.mm);

	if (vip.grid.time_24hr)
	{
		return fmt("^:^", this.hh, minutes);
	}
	else
	{
		var hours = (this.hh > 12) ? (this.hh-12) : this.hh;
		return fmt((this.hh < 12) ? "^:^am" : "^:^pm", hours, minutes);
	}
}



/////////////////////////////////////////////////////////////////

function fmt(fmtspec)
// returns string consisting of format specification with '^' placeholders
// replaced in sequence by any parameters supplied
{
	var str = "";
	var arg=1;
	for (var i in fmtspec)
	{
		if (fmtspec[i] == '^')
		{
			if (arg < arguments.length)
			{
				str += arguments[arg];
				arg++;
			}
		}
		else
		{
			str += fmtspec[i];
		}
	}

	return str;
}

function html2txt(html)
{
	var tag = document.createElement('span');
	tag.innerHTML = html;
	return tag.textContent;
}
