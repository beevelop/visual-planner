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
	banner.style.fontSize = portrait ? "1.5em" : "0.6em";

	var grid = document.getElementById("grid");
	vip_init_grid(grid);
	vip.grid.font_scale = portrait ? 1.2 : 0.5;
	vip.grid.colcount = portrait ? 4 : 8;
	vip.grid.create();
}
