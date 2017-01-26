function vip_init()
{
	var so = "n/a";
	if (screen.orientation)
	if (screen.orientation.type)
		so = screen.orientation.type;
	if (screen.msOrientation)  // edge, ie
		so = screen.msOrientation;

	var banner = document.getElementById("banner");
	var grid = document.getElementById("grid");

	banner.style.fontSize = "0.6em";
	grid.style.fontSize = "0.5em";
	//vip.layout.col_count = 8;

	if (so.includes("portrait"))
	{
		banner.style.fontSize = "1.5em";
		grid.style.fontSize = "1.2em";
	}

	vip.grid.create();
}
