function vip_init()
{
	document.body.style.margin = "0px";
	document.body.style.height = "100vh";
	document.body.style.display = "flex";
	document.body.style.flexDirection = "column";

	var banner = document.getElementById("banner");
	banner.style.margin = "3px 0px";
	banner.style.backgroundColor = "#DAE4EB";
	banner.style.lineHeight = "2.5em";

	var grid = document.getElementById("grid");
	grid.style.height = "100%";
	grid.style.display = "flex";
	grid.style.border = "0px";
	grid.scrolling = "no";
	grid.onload = onGridLoad;
	grid.src="vip_grid.html";
}

function onGridLoad()
{
	var ivipgrid = document.getElementById("grid").contentWindow.IVipGrid;
	ivipgrid.layout.col_count = 8;
	ivipgrid.layout.font_scale = 0.5;

	var banner = document.getElementById("banner");
	banner.style.fontSize = "0.6em";

	var so = "n/a";
	if (screen.orientation)
	if (screen.orientation.type)
		so = screen.orientation.type;
	if (screen.msOrientation)  // edge, ie
		so = screen.msOrientation;

	if (so.includes("portrait"))
	{
		banner.style.fontSize = "1.5em";
		ivipgrid.layout.font_scale = 1.2;
	}

	ivipgrid.create();
}
