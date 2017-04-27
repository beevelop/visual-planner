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

	window.onresize = updateLayout;

	for (var x=0; x < 8; x++)
	{
		var col = document.createElement('div');
		col.className = "vipcol";

		document.getElementById("vipgrid").appendChild(col);

		for (var y=0; y < 30; y++)
		{
			var cell = document.createElement('div');
			cell.className = "vipcell";
			col.appendChild(cell);

			var cellnum = document.createElement('div');
			cellnum.className = "vipcellnum";
			cellnum.textContent = y;
			cell.appendChild(cellnum);

			if (x==3)
			if (y==4)
			{
				var cellevt = document.createElement('div');
				cellevt.className = "vipcellevent";
				cellevt.style.backgroundColor = "lightgrey";
				cell.appendChild(cellevt);
				
				var red_evt = document.createElement('div');
				red_evt.className = "vipeventmarker";
				red_evt.style.width = "25%";
				red_evt.style.backgroundColor = "red";
				cellevt.appendChild(red_evt);
				
				var blue_evt = document.createElement('div');
				blue_evt.className = "vipeventmarker";
				blue_evt.style.width = "75%";
				blue_evt.style.backgroundColor = "blue";
				cellevt.appendChild(blue_evt);
			}

			if (x==4)
			if (y==14)
			{
				var cellevt = document.createElement('div');
				cellevt.className = "vipcellevent";
				cell.appendChild(cellevt);
				
				var short_evt = document.createElement('div');
				short_evt.className = "vipevent";
				short_evt.style.width = "25%";
				cellevt.appendChild(short_evt);
				
				var red_evt = document.createElement('div');
				red_evt.className = "vipeventmarker";
				red_evt.style.width = "1.2ch";
				red_evt.style.backgroundColor = "red";
				short_evt.appendChild(red_evt);
				
				var short_evt_txt = document.createElement('div');
				short_evt_txt.className = "vipeventtext";
				short_evt_txt.style.width = "calc(100% - 1.2ch)";
				short_evt_txt.textContent = "short";
				short_evt.appendChild(short_evt_txt);
				
				var long_evt = document.createElement('div');
				long_evt.className = "vipevent";
				long_evt.style.width = "75%";
				cellevt.appendChild(long_evt);
				
				var blue_evt = document.createElement('div');
				blue_evt.className = "vipeventmarker";
				blue_evt.style.width = "1.2ch";
				blue_evt.style.backgroundColor = "blue";
				long_evt.appendChild(blue_evt);
				
				var long_evt_txt = document.createElement('div');
				long_evt_txt.className = "vipeventtext";
				long_evt_txt.style.width = "calc(100% - 1.2ch)";
				long_evt_txt.textContent = "this is a very long event";
				long_evt.appendChild(long_evt_txt);
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
	var vipgrid = document.getElementById("vipgrid");
	
	var x = (vipgrid.offsetWidth / 8);
	var y = Math.floor(vipgrid.offsetHeight / 40);

	vipgrid.style.fontSize = ((y / 17) * 0.64) + "em";
	vipcolcss.style.width = x + "px";
	vipcellcss.style.height = y + "px";
	vipcellcss.style.lineHeight = (y-2) + "px";
}
