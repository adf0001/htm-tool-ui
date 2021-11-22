
/*
tab control

	example:

		<div class='ht-tab-group'>
			<span class='ht-tab-item ht-tab-item-selected' id='spTab1'>Tab1</span>
			<span class='ht-tab-item' id='spTab2'>Tab2</span>
		</div>
		<div id='divTab1'><b>tab1 content</b></div>
		<div id='divTab2' style='display:none;'><i>tab2 content</i></div>

		//init tab control
		htm_tool_ui.tab.init({'spTab1':'divTab1','spTab2':'divTab2'},'spTab1');
		//or tab/view pair array
		htm_tool_ui.tab.init(['spTab1', 'divTab1', ['spTab2', 'divTab2'] ], 'spTab1');
		//or
		htm_tool_ui.tab(['spTab1', 'divTab1', ['spTab2', 'divTab2'] ], 'spTab1');	//shortcut for .init()

		//get last tab id
		assert(htm_tool_ui.tab.getSelected('spTab1') === htm_tool_ui.tab.getSelected('spTab2'));

*/

var ele = require("element-tool");
var add_css_text = require("add-css-text");

var initialized = false;		//tab initialized flag

var onTabClick = function () {
	var groupId = this.getAttribute("ht-ui-tab-group");
	var idTab = ele.id(this);
	var idPannel = this.getAttribute("ht-ui-tab-pannel");

	var elGroup = ele(groupId);
	var lastTab = elGroup.getAttribute("ht-ui-tab-last-tab");
	var lastView = elGroup.getAttribute("ht-ui-tab-last-view");

	if (lastTab == idTab && lastView == idPannel) return;

	//hide last
	if (lastTab) { ele(lastTab).classList.remove("ht-tab-item-selected"); }
	if (lastView) { ele(lastView).style.display = "none"; }

	//show selected
	ele(idTab).classList.add("ht-tab-item-selected");
	if (idPannel) ele(idPannel).style.display = "";

	elGroup.setAttribute("ht-ui-tab-last-tab", idTab);
	elGroup.setAttribute("ht-ui-tab-last-view", idPannel);
}

//return groupId
var init = function (tabPairArray, tabSelected, elGroup) {
	//init css
	if (!initialized) {
		initialized = true;
		add_css_text(require("./tab.css"), "ht-ui-tab-css");
	}

	var i;
	if (!(tabPairArray instanceof Array)) {
		var a = [];
		for (i in tabPairArray) a.push(i, tabPairArray[i]);
		tabPairArray = a;
	}
	else {
		//flat array
		tabPairArray = Array.prototype.concat.apply([], tabPairArray);
	}

	//prepare group
	if (!elGroup) elGroup = ele(tabPairArray[0]);
	var groupId = ele.id(elGroup, "tab-group-");

	//init
	var i, elTab, elView;
	for (i = 0; i < tabPairArray.length; i += 2) {
		elTab = ele(tabPairArray[i]);
		elTab.setAttribute("ht-ui-tab-group", groupId);
		elTab.addEventListener("click", onTabClick);
		elTab.classList.add("ht-tab-item");

		if (i == tabSelected) { elTab.classList.add("ht-tab-item-selected"); }
		else { elTab.classList.remove("ht-tab-item-selected"); }

		elView = ele(tabPairArray[i + 1]);
		elView.style.display = (i == tabSelected) ? "" : "none";

		elTab.setAttribute("ht-ui-tab-pannel", ele.id(elView));
	}

	if (tabSelected) onTabClick.apply(ele(tabSelected));

	return groupId;
}

/*
To get selected tab id
groupId: any groupId, or any tab id
*/
var getSelected = function (groupId) {
	var el = ele(groupId);
	var lastId = el.getAttribute("ht-ui-tab-last-tab");
	if (!lastId) {
		//try get from tab
		groupId = el.getAttribute("ht-ui-tab-group");
		if (!groupId) return null;
		lastId = ele(groupId).getAttribute("ht-ui-tab-last-tab");
		if (!lastId) return null;
	}
	return lastId;
}

// module

module.exports = exports = init;

exports.init = init;
exports.getSelected = getSelected;
