function vip_init()
{
	var ivipgrid = document.getElementById("grid").contentWindow.IVipGrid;

	ivipgrid.layout.col_count = 8;
	//ivipgrid.layout.font_scale = 1;
	//ivipgrid.layout.col_offset = false;
	//ivipgrid.layout.highlight_weekends = false;

	ivipgrid.create();
}
