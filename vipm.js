function vip_init()
{
	var so = "n/a";
	if (screen.orientation)
	if (screen.orientation.type)
		so = screen.orientation.type;
	if (screen.msOrientation)  // edge, ie
		so = screen.msOrientation;

	var banner = document.getElementById("banner");
	var ivipgrid = document.getElementById("grid").contentWindow.IVipGrid;

	banner.style.fontSize = "0.6em";
	ivipgrid.layout.col_count = 8;
	ivipgrid.layout.font_scale = 0.5;

	if (so.includes("portrait"))
	{
		banner.style.fontSize = "1.5em";
		ivipgrid.layout.font_scale = 1.2;
	}

	ivipgrid.create();
}
