function vip_init()
{
	var so = "n/a";
	if (screen.orientation)
	if (screen.orientation.type)
		so = screen.orientation.type;
	if (screen.msOrientation)  // edge, ie
		so = screen.msOrientation;

	var portrait = so.includes("portrait");

	var banner = document.getElementById("banner");
	var grid = document.getElementById("grid");

	banner.style.fontSize = portrait ? "1.5em" : "0.6em";
	vip.layout.font_scale = portrait ? 1.2 : 0.5;
	vip.layout.col_count = portrait ? 4 : 8;

	vip_init_grid(document.getElementById("grid"));
	vip.grid.create();
}
