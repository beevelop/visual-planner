var vipcolcss;
var vipcellcss;

function createGrid()
{
	var css = document.createElement('style');
	document.body.appendChild(css);

	css.sheet.insertRule(".vipcol {}", 0);
	vipcolcss = css.sheet.cssRules[0];

	css.sheet.insertRule(".vipcell {}", 1);
	vipcellcss = css.sheet.cssRules[1];

	document.body.onresize = updateLayout;

	var first_cell = true;
	for (var x=0; x < 8; x++)
	{
		var col = document.createElement('div');
		col.className = "vipcol";

		document.getElementById("grid").appendChild(col);

		for (var y=0; y < 30; y++)
		{
			var cell = document.createElement('div');
			cell.className = "vipcell";
			col.appendChild(cell);

			var cellnum = document.createElement('div');
			cellnum.className = "vipcellnum";
			cellnum.textContent = y;
			cell.appendChild(cellnum);

			if (first_cell)
			{
				first_cell = false;
				
				var cellevt = document.createElement('div');
				cellevt.className = "vipcellevent";
				cell.appendChild(cellevt);
				
				var red_evt = document.createElement('div');
				red_evt.className = "vipevent";
				red_evt.style.width = "25%";
				red_evt.style.backgroundColor = "red";
				cellevt.appendChild(red_evt);
				
				var blue_evt = document.createElement('div');
				blue_evt.className = "vipevent";
				blue_evt.style.width = "75%";
				blue_evt.style.backgroundColor = "blue";
				cellevt.appendChild(blue_evt);
			}
		}
	}

	updateLayout();

	// printing
	if (window.matchMedia)
	{
		var mql = window.matchMedia("print");

		if (mql)
			mql.addListener(onMediaChange);
	}
}

function onMediaChange(mql)
{
	updateLayout();

	//if (mql.matches)
		//ga_hit('media', 'print');
}

function updateLayout()
{
	var grid = document.getElementById("grid");
	grid.style.height = "calc(100vh - " + grid.offsetTop + "px)";
	
	var x = (grid.offsetWidth / 8);
	var y = Math.floor(grid.offsetHeight / 40);

	vipcolcss.style.width = x + "px";
	vipcellcss.style.height = y + "px";
	vipcellcss.style.lineHeight = (y-2) + "px";
	grid.style.fontSize = ((y / 18) * 0.64) + "em";
}
