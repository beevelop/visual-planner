function vip_init()
{
	document.body.style.margin = "0px";
	document.body.style.height = "100vh";
	document.body.style.display = "flex";
	document.body.style.flexDirection = "column";

	var banner = document.getElementById("banner");
	banner.style.margin = "3px 0px";
	banner.style.paddingLeft = "10px";
	banner.style.backgroundColor = "#DAE4EB";
	banner.style.lineHeight = "2.5em";
	banner.style.fontSize = "1.2em";

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

	//ivipgrid.layout.col_count = 10;
	ivipgrid.layout.font_scale = 1;
	ivipgrid.create();
}
