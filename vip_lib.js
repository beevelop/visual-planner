//////////////////////////////////////////////////////////////////////

function VipObject()
{
}

VipObject.prototype.createChildDiv = function(container_element, id)
{
	var div = document.createElement('div');

	if (id)
		div.id = id;

	div.style.width = "100%";
	div.style.height = "100%";
	div.style.position = "absolute";
	div.style.pointerEvents = "none";
	div.style.MozUserSelect = "none";  // ff fix
	div.vipobj = this;

	this.div = div;
	this.parent = null;
	
	container_element.appendChild(div);
}

VipObject.prototype.createChild = function(parent, id)
{
	this.createChildDiv(parent.div, id);
	this.parent = parent;
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
	this.div.innerHTML = txt;
}

VipObject.prototype.Show = function(showdiv)
{
	this.div.style.visibility = showdiv ? "visible" : "hidden";
}

VipObject.prototype.Align = function(cell_start, cell_end)
{
	if (cell_start && cell_end)
	{
		this.div.style.top = px(cell_start.div.offsetTop);
		this.div.style.height = px((cell_end.div.offsetTop - cell_start.div.offsetTop) + cell_end.div.offsetHeight);
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

function VipGrid(container_element)
{
	this.createChildDiv(container_element, "vipgrid");

	this.colcount = 8;
	this.cellcount = 31;
	this.font_scale = 0.64;
	this.autoscroll = true;
	this.autoscroll_offset = -1;
	this.col_header = true;
	this.offset_col = true;
	this.highlight_weekend = true;
	this.past_transparency = 30;
	this.scrolling_disabled = false;
	this.date_indicator = false;
	this.onloadVipCol = function() {};

	this.events = {
		time_24hr: true,
		proportional: {show: false, start_hour:8, end_hour:20},
		title: {show: true, time: true, colour: false, hide_marker: false},
		marker: {hide: false, width: 0.58},
		timed: {show: true, multi_day_as_all_day: true},
		allday: {show: true, one_day_as_timed: true, multi_day_as_timed: false, width_chars: 1}
	};
}

VipGrid.prototype = new VipObject;

VipGrid.prototype.create = function()
{
	var vdt_start = new VipDate.Today();
	vdt_start.MoveToStartOfMonth();

	if (this.autoscroll)
		vdt_start.MoveMonths(this.autoscroll_offset);
	else
		vdt_start.MoveToStartOfYear();

	var vdt_end = new VipDate(vdt_start);

	for (var c=0; c < this.colcount; c++)
	{
		vdt_end.MoveMonths(1);

		var vipcol = new VipCol(this, vdt_start, vdt_end);
		
		vdt_start.MoveMonths(1);
	}
	
	this.updateLayout();
}

VipGrid.prototype.createSingleCol = function()
{
	this.colcount = 1;
	this.cellcount = 28;
	this.col_header = false;
	this.offset_col = false;
	this.scrolling_disabled = true;
	this.date_indicator = true;

	var vdt_start = new VipDate.Today();
	vdt_start.MoveToStartOfWeek(1);  // monday this week

	var vdt_end = new VipDate(vdt_start);
	vdt_end.MoveDays(28);
	
	var vipcol = new VipCol(this, vdt_start, vdt_end);

	this.updateLayout();
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

	var xpx = 0;
	var vipcol = this.First();
	while(vipcol)
	{
		vipcol.div.style.left = px(xpx);
		
		if (vipcol.div.style.width != this.colwidth)
		{
			vipcol.div.style.width = this.colwidth;
			vipcol.updateLayout();
		}

		xpx += this.colspacing;
		vipcol = vipcol.Next();
	}
}

VipGrid.prototype.updateLayout = function()
{
	this.colspacing = Math.floor(this.div.offsetWidth/this.div.childElementCount);
	this.colwidth = px(this.colspacing-1);
	
	var xpx = 0;

	var vipcol = this.First();
	while(vipcol)
	{
		vipcol.div.style.left = px(xpx);
		vipcol.div.style.width = this.colwidth;
		vipcol.updateLayout();

		xpx += this.colspacing;
		vipcol = vipcol.Next();
	}
}

VipGrid.prototype.getVipCell = function(vdt)
{
	var div = document.getElementById(vdt.Datestamp());
	
	if (div)
	if (div.vipobj instanceof VipCell)
		return div.vipobj;

	return null;
}



//////////////////////////////////////////////////////////////////////

function VipCol(parent, vdt_start, vdt_end)
{
	this.createChild(parent, "vipcol");

	this.div.style.fontSize = fmt("^em", vip.grid.font_scale);
	this.vdt_month = new VipDate(vdt_start);

	if (vip.grid.col_header)
	{
		this.viphdr = new VipDiv(this, "vipmonthhdr");
		this.viphdr.setText(this.vdt_month.MonthTitle());

		var hdr = this.viphdr.div;
		hdr.style.textAlign = "center";
		hdr.style.height = "2em";
		hdr.style.lineHeight = "2em"
		hdr.style.pointerEvents = "all";
		hdr.style.cursor = "pointer";
		hdr.onclick = onclickVipMonthHeader;

		if (this.vdt_month.isPastMonth())
			this.div.style.opacity = ((100 - vip.grid.past_transparency) / 100);
	}
	
	this.vipcelloffset = new VipDiv(this, "vipcelloffset");
	this.vipcells = new VipCells(this.vipcelloffset, this, vdt_start, vdt_end);
	this.vipevts = new VipDiv(this.vipcelloffset, "vipevts");

	this.vipsel = new VipDiv(this.vipcelloffset, "vipsel");
	this.vipsel.div.style.backgroundColor = "rgba(255,255,127,0.6)";
	this.vipsel.Show(false);

	if (vip.grid.date_indicator)
	{
		this.vipind = new VipDiv(this.vipcelloffset, "vipind");
		this.vipind.div.style.backgroundColor = "rgba(0,0,0,0.3)";
		this.vipind.Show(false);
	}

	this.vipseltip = new VipDiv(this.vipcelloffset, "vipseltip");
	this.vipseltip.div.style.fontSize = "0.8em";
	this.vipseltip.div.style.textAlign = "center";
	this.vipseltip.div.style.lineHeight = "2em";
	this.vipseltip.Show(false);

	this.vipsel.div.style.zIndex = "10";
	this.vipseltip.div.style.zIndex = "10";

	this.firstcell = this.vipcells.First();
	this.lastcell = this.vipcells.Last();
	this.datespan = {start: new VipDate(vdt_start), end: new VipDate(vdt_end)};
	
	vip.grid.onloadVipCol(this);
}

VipCol.prototype = new VipObject;

VipCol.prototype.updateLayout = function()
{
	var c = vip.grid.cellcount;
	if (vip.grid.offset_col)
		c += 6;
	
	var offset = this.viphdr ? this.viphdr.div.offsetHeight : 0;

	var cellspace = Math.floor((this.div.offsetHeight-offset)/c);
	var cellheight = px(cellspace-1);

	if (vip.grid.offset_col)
		offset += (cellspace * this.vdt_month.DayOfWeek());

	this.vipcelloffset.div.style.top = px(offset);
	this.vipcelloffset.div.style.height = px(cellspace * this.vipcells.div.childElementCount);

	var celltop=0;
	var vipcell = this.vipcells.First();
	while(vipcell)
	{
		vipcell.div.style.top = px(celltop);
		vipcell.div.style.height = cellheight;
		vipcell.div.style.lineHeight = cellheight;
		celltop += cellspace;
		
		vipcell.updateLayout();

		vipcell = vipcell.Next();
	}

	var vipcell = this.vipcells.First();
	this.vipevts.div.style.left = vipcell.vipevts.div.style.left;
	this.vipevts.div.style.width = vipcell.vipevts.div.style.width;

	if (this.vipind)
	{
		this.vipind.div.style.left = this.vipevts.div.offsetLeft;
		this.vipind.div.style.width = px(1);

		this.vipevts.div.style.left = px(this.vipevts.div.offsetLeft + 2);
		this.vipevts.div.style.width = px(this.vipevts.div.offsetWidth - 2);

		var vipcell = this.vipcells.First();
		while(vipcell)
		{
			vipcell.vipevts.div.style.left = px(vipcell.vipevts.div.offsetLeft + 2);
			vipcell.vipevts.div.style.width = px(vipcell.vipevts.div.offsetWidth - 2);

			vipcell = vipcell.Next();
		}
	}

	this.updateEventLayout();
}

VipCol.prototype.updateSelectionTip = function(vipcell_start, vipcell_end)
{
	this.vipseltip.Show(false);

	if (!vipcell_start) return;
	if (!vipcell_end) return;
	if (vipcell_start === vipcell_end) return;

	this.vipseltip.setText(vipcell_start.vipdate.TimespanTo(vipcell_end.vipdate));
	this.vipseltip.Align(vipcell_end, vipcell_end);
	this.vipseltip.Show(true);
}

VipCol.prototype.addEvent = function(event, vipcell)
{
	var vipevt = null;

	var vipsib = this.vipevts.First();
	while (vipsib)
	{
		if (event.id == vipsib.evt_id)
		{
			vipevt = vipsib;
			break;
		}

		if (vipcell.vipdate.dt < vipsib.vipcell_start.vipdate.dt)
			break;

		vipsib = vipsib.Next();
	}

	if (!vipevt)
	{
		vipevt = new VipMultiDayEvent(this.vipevts, event, vipcell);
		this.vipevts.MoveLastBefore(vipsib);
	}

	vipevt.extend(vipcell);
	vipcell.updateEventInfo();
	this.updateEventLayout();
}

VipCol.prototype.updateEventLayout = function()
{
	var fixed = [];

	var vipsib = this.vipevts.First();
	while (vipsib)
	{
		vipsib.updateLayout();

		var x_off = (vipsib.div.offsetWidth + 2);
		vipsib.div.style.left = px(this.vipevts.div.offsetWidth - x_off);
		
		while(true)
		{
			var shift = false;

			for (var i=0; i < fixed.length; i++)
			{
				if (this.intersection(vipsib, fixed[i]))
				{
					shift = true;
					break;
				}
			}
			
			if (shift)
				vipsib.div.style.left = px(vipsib.div.offsetLeft - x_off);
			else
				break;
		}

		fixed.push(vipsib);

		vipsib = vipsib.Next();
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

function VipCells(parent, vipcol, vdt_start, vdt_end)
{
	this.createChild(parent, "vipcells");
	
	var vdt_day = new VipDate(vdt_start);
	while (vdt_day.dt < vdt_end.dt)
	{
		var vipcell = new VipCell(this, vipcol, vdt_day);
		vdt_day.MoveDays(1);
	}
}

VipCells.prototype = new VipObject;



//////////////////////////////////////////////////////////////////////

function VipCell(parent, col, vdt)
{
	this.createChild(parent, vdt.Datestamp());
	this.vipcol = col;
	this.vipdate = new VipDate(vdt);

	this.div.style.pointerEvents = "all";
	this.div.style.backgroundColor = "#eaeaea";

	if (vip.grid.highlight_weekend)
	if (vdt.isWeekend())
		this.div.style.backgroundColor = "#d8d8d8";

	this.vipnum = new VipDiv(this, "vipnum");
	this.vipnum.setText(vdt.DayOfMonth());

	var num = this.vipnum.div;
	num.style.textAlign = "center";
	num.style.cursor = "pointer";
	num.style.pointerEvents = "all";
	num.onclick = onclickVipDayNumber;

	if (vdt.isToday())
	{
		num.style.fontWeight = "bold";
		num.style.color = "white";
		num.style.backgroundColor = "red";
	}
	
	this.vipevts = new VipDiv(this, "vipevts");
}

VipCell.prototype = new VipObject;

VipCell.prototype.updateLayout = function()
{
	var prev = this.Prev();
	
	if (prev)
	{
		this.vipnum.div.style.left = prev.vipnum.div.style.left;
		this.vipnum.div.style.top = prev.vipnum.div.style.top;
		this.vipnum.div.style.width = prev.vipnum.div.style.width;
		this.vipnum.div.style.height = prev.vipnum.div.style.height;
		this.vipnum.div.style.lineHeight = prev.vipnum.div.style.lineHeight;

		this.vipevts.div.style.left = prev.vipevts.div.style.left;
		this.vipevts.div.style.width = prev.vipevts.div.style.width;
	}
	else
	{
		var num = this.vipnum.div;
		num.style.height = "100%";
		var h = num.offsetHeight;
		num.style.height = "1.3em";
		var m = Math.floor((h - num.offsetHeight)/2);
		num.style.left = px(0);
		num.style.top = px(m);
		num.style.width = "1.6em";
		num.style.height = px(h-(2*m));
		num.style.lineHeight = num.style.height;

		this.vipevts.div.style.left = px(this.vipnum.div.offsetWidth + 1);
		this.vipevts.div.style.width = px(this.div.offsetWidth - this.vipevts.div.offsetLeft - 1);
	}
	
	this.updateEventLayout();
}

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

VipCell.prototype.addEvent = function(event)
{
	var timestamp = event.vtmStart.Timestamp();

	var vipsib = this.vipevts.First();
	while (vipsib)
	{
		if (event.id == vipsib.evt_id)
			return;

		if (timestamp < vipsib.evt_timestamp)
			break;

		vipsib = vipsib.Next();
	}

	var vipevt = new VipSingleDayEvent(this, event);
	this.vipevts.MoveLastBefore(vipsib);  // sort in time order

	this.updateEventInfo();
	this.updateEventLayout();
}

VipCell.prototype.updateEventLayout = function()
{
	var vipevt = this.vipevts.First();
	while (vipevt)
	{
		vipevt.div.style.width = "";

		if (vip.grid.events.proportional.show)
			vipevt.setProportionalWidth(this.vipevts.div.offsetWidth);

		vipevt = vipevt.Next();
	}

	if (vip.grid.events.proportional.show)
		return;

	while (true)
	{
		var x_off = 0;
		var longest = this.vipevts.First();

		var vipevt = this.vipevts.First();
		while (vipevt)
		{
			if (x_off > 0)
				x_off += 1;
			
			vipevt.div.style.left = px(x_off);
			x_off += vipevt.div.offsetWidth;
			
			if (vipevt.div.offsetWidth > longest.div.offsetWidth)
				longest = vipevt;

			vipevt = vipevt.Next();
		}

		if (x_off > this.vipevts.div.offsetWidth)
		{
			longest.truncate(5);
			continue;
		}
			
		break;
	}
}

VipCell.prototype.updateEventInfo = function()
{
	var str_tooltip = "";

	var vipevt = this.vipcol.vipevts.First();
	while (vipevt)
	{
		if (this.inRange(vipevt.vipcell_start, vipevt.vipcell_end))
		{
			if (str_tooltip.length > 0)
				str_tooltip += '\n';
			
			str_tooltip += vipevt.tooltip;
		}

		vipevt = vipevt.Next();
	}

	vipevt = this.vipevts.First();
	while (vipevt)
	{
		if (str_tooltip.length > 0)
			str_tooltip += '\n';
		
		str_tooltip += vipevt.tooltip;

		vipevt = vipevt.Next();
	}

	this.div.title = str_tooltip;
}



//////////////////////////////////////////////////////////////////////

function VipMultiDayEvent(parent, event, vipcell)
{
	this.createChild(parent, "vipmultidayevent");
	this.evt_id = event.id;
	this.evt_title = html2txt(event.title);
	this.vipcell_start = vipcell;
	this.vipcell_end = vipcell;
	this.div.style.zIndex = "1";

	var evt = this.div;
	evt.style.width = fmt("^em", vip.grid.events.marker.width);
	evt.style.backgroundColor = event.palette.medium;

	if (event.calendar)
		this.tooltip = fmt("^ - ^", event.calendar, this.evt_title);
	else
		this.tooltip = this.evt_title;
}

VipMultiDayEvent.prototype = new VipObject;

VipMultiDayEvent.prototype.extend = function(vipcell)
{
	this.vipcell_end = vipcell;
}

VipMultiDayEvent.prototype.updateLayout = function()
{
	this.Align(this.vipcell_start, this.vipcell_end);
}



//////////////////////////////////////////////////////////////////////

function VipSingleDayEvent(vipcell, event)
{
	this.createChild(vipcell.vipevts, "vipsingledayevent");
	this.evt_id = event.id;
	this.evt_datestamp = event.vdtStart.Datestamp();
	this.evt_timestamp = event.vtmStart.Timestamp();
	this.evt_title = html2txt(event.title);
	this.evt_timed = !event.allDay;
	this.vdtStart = event.vdtStart;
	this.vdtEnd = event.vdtEnd;
	this.vdmStart = event.vdmStart;
	this.vdmEnd = event.vdmEnd;
	this.div.style.zIndex = "2";
	this.div.style.width = "";
	this.padding=0;

	this.evt_start_seconds = event.vtmStart.toSeconds();
	this.evt_end_seconds = event.vdtStart.isSameDay(event.vdtEnd) ? event.vtmEnd.toSeconds() : (new VipTime.HourMin(24, 0)).toSeconds();
	
	this.evt_title_time = "";
	if (this.evt_timed)
	if (this.evt_datestamp == vipcell.vipdate.Datestamp())
		this.evt_title_time = event.vtmStart.TimeTitle() + " ";

	this.tooltip = this.evt_title_time;
	if (event.calendar)
		this.tooltip += fmt("^ - ", event.calendar);
	this.tooltip += this.evt_title;

	if (!vip.grid.events.title.show || !vip.grid.events.title.hide_marker || vip.grid.events.proportional.show)
	{
		this.vipmarker = new VipDiv(this, "vipevtmarker");
		this.vipmarker.div.style.backgroundColor = event.palette.medium;
		
		var h = this.vipmarker.div.offsetHeight;
		this.vipmarker.div.style.height = "1em";
		var m = Math.floor((h - this.vipmarker.div.offsetHeight)/2);

		this.vipmarker.div.style.left = px(0);
		this.vipmarker.div.style.top = px(m);
		this.vipmarker.div.style.width = fmt("^em", vip.grid.events.marker.width);
		this.vipmarker.div.style.height = px(h-(2*m));
		
		this.padding = (this.vipmarker.div.offsetWidth + 1);
	}

	if (vip.grid.events.title.show)
	{
		this.div.appendChild(document.createTextNode(this.evt_title_time + this.evt_title));

		this.div.style.whiteSpace = "nowrap";
		this.div.style.overflow = "hidden";
		this.div.style.textOverflow = "ellipsis";
		this.div.style.lineHeight = px(vipcell.div.offsetHeight);
		this.div.style.paddingLeft = px(this.padding);

		if (vip.grid.events.title.colour)
			this.div.style.color = event.palette.medium;
	}
}

VipSingleDayEvent.prototype = new VipObject;

VipSingleDayEvent.prototype.truncate = function(x)
{
	this.div.style.width = px(this.div.offsetWidth - (this.padding + x));
}

VipSingleDayEvent.prototype.setProportionalWidth = function(max_width)
{
	var m_duration = ((this.evt_end_seconds - this.evt_start_seconds) / 60);
	var m_start = (this.evt_start_seconds / 60);
	var m_range_start = (vip.grid.events.proportional.start_hour * 60);
	var m_range_end = (vip.grid.events.proportional.end_hour * 60);
	var m_per_px = ((m_range_end - m_range_start)/max_width);

	this.vipmarker.div.style.left = px(Math.round((m_start - m_range_start) / m_per_px));
	this.vipmarker.div.style.width = px(Math.round(m_duration / m_per_px));

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
	var s = Math.abs(Date.UTC(this.dt.getFullYear(), this.dt.getMonth(), this.dt.getDate()) - Date.UTC(vdt_end.dt.getFullYear(), vdt_end.dt.getMonth(), vdt_end.dt.getDate()));
	var c = Math.floor(s/86400000);
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

	if (vip.grid.events.time_24hr)
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

function px(n)
{
	return "" + n + "px";
}

function html2txt(html)
{
	var tag = document.createElement('span');
	tag.innerHTML = html;
	return tag.textContent;
}
