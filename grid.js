function init()
{
	document.body.style.margin = "0px";
	document.body.style.height = "100%";
	//document.body.style.display = "flex";
	//document.body.style.flexDirection = "column";

	var banner = document.getElementById("banner");
	banner.style.margin = "3px 0px";
	//banner.style.paddingLeft = "10px";
	banner.style.backgroundColor = "#DAE4EB";
	banner.style.lineHeight = "2.5em";
	banner.style.fontSize = "0.8em";

	var grid = document.getElementById("grid");
	//grid.style.fontSize = "0.64em";
	//grid.style.display = "flex";
	//grid.style.flexDirection = "row";
	grid.style.width = "100vw";
	//grid.style.height = "80%";

	var col1 = document.getElementById("col1");
	//col1.style.display = "flex";
	//col1.style.flexDirection = "column";
	col1.style.backgroundColor = "green";
	col1.style.width = "33.3vw";
	col1.style.height = "80vh";
	//col1.style.marginRight = "1px";
	col1.style.cssFloat = "left";
	//col1.style.position = "relative";
	//col1.style.left = "1px";

/*
	var cell1 = document.getElementById("cell1");
	cell1.style.backgroundColor = "grey";
	cell1.style.height = "100px";
	cell1.style.marginBottom = "1px";

	var cell2 = document.getElementById("cell2");
	cell2.style.backgroundColor = "grey";
	cell2.style.height = "100px";
	cell2.style.marginBottom = "1px";

	var cell3 = document.getElementById("cell3");
	cell3.style.backgroundColor = "grey";
	cell3.style.height = "100px";
	cell3.style.marginBottom = "1px";
*/

	var col2 = document.getElementById("col2");
	col2.style.backgroundColor = "blue";
	col2.style.width = "33.3vw";
	col2.style.height = "80vh";
	//col2.style.marginRight = "1px";
	col2.style.cssFloat = "left";
	//col2.style.position = "relative";
	//col2.style.left = "1px";

	var col3 = document.getElementById("col3");
	col3.style.backgroundColor = "orange";
	col3.style.width = "33.3vw";
	col3.style.height = "80vh";
	//col3.style.marginRight = "1px";
	col3.style.cssFloat = "left";
	//col3.style.position = "relative";
	//col3.style.left = "1px";
}