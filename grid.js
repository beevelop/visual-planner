function init()
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
	banner.style.fontSize = "0.8em";

	var grid = document.getElementById("grid");
	grid.style.fontSize = "0.64em";
	grid.style.display = "flex";
	grid.style.flexDirection = "row";
	grid.style.height = "100%";

	var col1 = document.getElementById("col1");
	col1.style.display = "flex";
	col1.style.flexDirection = "column";
	col1.style.width = "33.33%";
	col1.style.marginRight = "1px";

	var cell1 = document.getElementById("cell1");
	cell1.style.backgroundColor = "yellow";
	cell1.style.height = "30%";
	cell1.style.display = "flex";
	cell1.style.flexDirection = "row";
	cell1.style.marginBottom = "1px";

	var evt1 = document.getElementById("evt1");
	evt1.style.whiteSpace = "nowrap";
	evt1.style.overflow = "hidden";
	evt1.style.textOverflow = "ellipsis";

	var evt2 = document.getElementById("evt2");
	evt2.style.whiteSpace = "nowrap";
	evt2.style.overflow = "hidden";
	evt2.style.textOverflow = "ellipsis";

	var evt3 = document.getElementById("evt3");
	evt3.style.whiteSpace = "nowrap";
	evt3.style.overflow = "hidden";
	evt3.style.textOverflow = "ellipsis";

	var cell2 = document.getElementById("cell2");
	cell2.style.backgroundColor = "yellow";
	cell2.style.height = "30%";
	cell2.style.marginBottom = "1px";

	var cell3 = document.getElementById("cell3");
	cell3.style.backgroundColor = "yellow";
	cell3.style.height = "30%";

	var col2 = document.getElementById("col2");
	col2.style.backgroundColor = "blue";
	col2.style.width = "33.33%";
	col2.style.marginRight = "1px";

	var col3 = document.getElementById("col3");
	col3.style.backgroundColor = "orange";
	col3.style.width = "33.33%";
}