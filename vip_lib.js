//////////////////////////////////////////////////////////////////////

function VipObject()
{
}

VipObject.prototype.createChildDiv = function(container_element, id)
{
	if (this.div) console.error("vip: div element already created");
	
	var div = document.createElement('div');

	if (id)
		div.id = id;

	div.style.position = "absolute";
	div.style.width = "100%";
	div.style.height = "100%";
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
		this.div.style.top = fmt("^px", cell_start.div.offsetTop);
		this.div.style.height = fmt("^px", (cell_end.div.offsetTop - cell_start.div.offsetTop) + cell_end.div.offsetHeight);
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
}

VipGrid.prototype = new VipObject;

VipGrid.prototype.create = function()
{
	var colcount = vip.layout.col_count;

	var so = "n/a";
	if (screen.orientation)
	if (screen.orientation.type)
		so = screen.orientation.type;
	if (screen.msOrientation)  // edge, ie
		so = screen.msOrientation;
	if (so.includes("portrait"))
		colcount = (vip.layout.col_count / 2);

	var vdt_start = new VipDate.Today();
	vdt_start.MoveToStartOfMonth();

	if (vip.multi_col.auto_scroll)
		vdt_start.MoveMonths(vip.multi_col.offset);
	else
		vdt_start.MoveToStartOfYear();

	var vdt_end = new VipDate(vdt_start);

	for (var c=0; c < colcount; c++)
	{
		vdt_end.MoveMonths(1);

		var vipcol = new VipCol(this, vdt_start, vdt_end);
		
		vdt_start.MoveMonths(1);
	}
	
	this.updateLayout(true);
}

VipGrid.prototype.scroll_col = function(offset, ui_event)
{
	//if (this.SingleCol) return;

	//ga_hit('scroll', ui_event);

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
		vipcol.updateLayout();

		if (!ltor)
			this.MoveLastBefore(this.First());  // move col to left
	}

	this.updateLayout(false);
}

VipGrid.prototype.updateLayout = function(update_cols)
{
	var xpx = 0;
	var wpx = Math.floor(this.div.offsetWidth/this.div.childElementCount);
	
	var vipcol = this.First();
	
	while(vipcol)
	{
		vipcol.div.style.width = fmt("^px", wpx-1);
		vipcol.div.style.left = fmt("^px", xpx);
		xpx += wpx;
		
		if (update_cols)
			vipcol.updateLayout();

		vipcol = vipcol.Next();
	}
}



//////////////////////////////////////////////////////////////////////

function VipCol(parent, vdt_start, vdt_end)
{
	this.createChild(parent, "vipcol");

	this.vdt_month = new VipDate(vdt_start);

	if (vip.layout.col_header)
	{
		this.viphdr = new VipDiv(this, "vipmonthhdr");
		this.viphdr.setText(this.vdt_month.MonthTitle());

		var hdr = this.viphdr.div;
		hdr.style.textAlign = "center";
		hdr.style.height = "2em";
		hdr.style.lineHeight = "2em"
		hdr.style.pointerEvents = "all";
		hdr.style.cursor = "pointer";
		hdr.onclick = onclick_month_header;

		if (this.vdt_month.isPastMonth())
			this.div.style.opacity = ((100 - vip.multi_col.past_transparency) / 100);
	}
	
	this.vipcelloffset = new VipDiv(this, "vipcelloffset");
	this.vipcells = new VipCells(this.vipcelloffset, this, vdt_start, vdt_end);

	this.vipevts = new VipDiv(this.vipcelloffset, "vipevts");

	this.vipsel = new VipDiv(this.vipcelloffset, "vipsel");
	this.vipsel.div.style.backgroundColor = "rgba(255,255,127,0.6)";
	this.vipsel.Show(false);

	this.vipind = new VipDiv(this.vipcelloffset, "vipind");
	this.vipind.div.style.backgroundColor = "rgba(0,0,0,0.3)";
	this.vipind.Show(false);

	this.vipseltip = new VipDiv(this.vipcelloffset, "vipseltip");
	this.vipseltip.div.style.fontSize = "0.8em";
	this.vipseltip.div.style.textAlign = "center";
	this.vipseltip.Show(false);

	this.vipsel.div.style.zIndex = "10";
	this.vipseltip.div.style.zIndex = "10";

	this.firstcell = this.vipcells.First();
	this.lastcell = this.vipcells.Last();
	this.datespan = {start: new VipDate(vdt_start), end: new VipDate(vdt_end)};
	
	//vip.event_req.add(this);
}

VipCol.prototype = new VipObject;

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

VipCol.prototype.updateLayout = function()
{
	var cellcount = 31;
	if (vip.layout.col_offset)
		cellcount += 6;
	
	var offset = this.viphdr ? this.viphdr.div.offsetHeight : 0;

	var cellspace = Math.floor((this.div.offsetHeight-offset)/cellcount);
	var cellheight = fmt("^px", cellspace-1);

	if (vip.layout.col_offset)
		offset += (cellspace * this.vdt_month.DayOfWeek());

	this.vipcelloffset.div.style.top = fmt("^px", offset);
	this.vipcelloffset.div.style.height = fmt("^px", (cellspace * this.vipcells.div.childElementCount));
	
	this.vipseltip.div.style.lineHeight = cellheight;
	
	var celltop=0;
	var vipcell = this.vipcells.First();
	while(vipcell)
	{
		vipcell.div.style.top = fmt("^px", celltop);
		vipcell.div.style.height = cellheight;
		vipcell.div.style.lineHeight = cellheight;
		celltop += cellspace;

		vipcell = vipcell.Next();
	}
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

	if (vip.layout.highlight_weekend)
	if (vdt.isWeekend())
		this.div.style.backgroundColor = "#d8d8d8";

	var vipnum = new VipDiv(this, "vipnum");
	vipnum.setText(vdt.DayOfMonth());

	var num = vipnum.div;
	num.style.width = "2em";
	num.style.textAlign = "center";
	num.style.cursor = "pointer";
	num.style.pointerEvents = "all";
	num.onclick = onclick_day_number;

	if (vdt.isToday())
	{
		num.style.fontWeight = "bold";
		num.style.color = "white";
		num.style.backgroundColor = "red";
	}
	
/*
	this.vipevts = new VipDiv(this, "vipevts");
	this.vipevts.setPos(vip.cell.margin, 0);
	this.vipevts.setSize((this.div.offsetWidth - vip.cell.margin), this.div.offsetHeight);
	this.vipevts.div.style.overflow = "hidden";
*/
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

/*
VipDate.prototype.constructor.GCal = function(gdt)
{
	var dt = google.calendar.utils.toDate(gdt);
	var vdt = new VipDate.YMD(dt.getFullYear(), dt.getMonth()+1, dt.getDate());
	return vdt;
}
*/

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

/*
VipDate.prototype.GCalDate = function()
{
	return google.calendar.utils.fromDate(this.dt);
}
*/

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

VipDate.prototype.ShowInCalendar = function()
{
	//google.calendar.showDate(this.dt.getFullYear(), (this.dt.getMonth() + 1), this.dt.getDate());
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

/*
VipTime.prototype.constructor.GCal = function(gdt)
{
	var dt = google.calendar.utils.toDate(gdt);

	var vtm = new VipTime;
	vtm.hh = dt.getHours();
	vtm.mm = dt.getMinutes();

	return vtm;
}
*/

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

	if (vip.events.time_24hr)
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
