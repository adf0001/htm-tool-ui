
/*
radio group

	example:
		//don't set name attribute of radio control, to avoid outside name duplication.

		<label id='group1'><input type='radio' checked value='a'></input>aaa</label><br>
		<span id='group2'>
			<label><input type='radio' value='b'></input>bbb</label><br>
			<label><input type='radio' value='c' disabled></input>ccc</label><br>
		</span>

		//init radio group
		htm_tool_ui.radio_group.init(['group1','group2'],'b');

		//get value
		assert(htm_tool_ui.radio_group.getValue('group1') === htm_tool_ui.radio_group.getValue('group2'));

*/

var ele = require("element-tool");

var getSubRadios = function (el) {
	el = ele(el);
	return (el.tagName.toUpperCase() == "INPUT" && el.type == "radio") ? el :
		el.querySelectorAll("input[type='radio']");
}

var onRadioGroupClick = function () {
	this.checked = true;		//keep checked

	var groupId = this.getAttribute("ht-ui-radio-group");
	var elGroup = ele(groupId);
	var lastId = elGroup.getAttribute("ht-ui-radio-group-last");

	var thisId = ele.id(this);
	if (lastId == thisId) return;

	//uncheck last
	if (lastId) { ele(lastId).checked = false; }

	elGroup.setAttribute("ht-ui-radio-group-last", thisId);
}

//return groupId
var init = function (groupArray, defaultValue, elGroup) {
	if (!(groupArray instanceof Array)) groupArray = [groupArray];

	//prepare group id
	if (!elGroup) elGroup = groupArray[0];
	var groupId = ele.id(ele(elGroup));

	var i, j, elList, elRadio, elSelected;
	for (var i = 0; i < groupArray.length; i++) {
		elList = getSubRadios(groupArray[i]);

		for (j = 0; j < elList.length; j++) {
			elRadio = elList[j];
			if (!elSelected) elSelected = elRadio;	//if no defaultValue, select the 1st.

			elRadio.setAttribute("ht-ui-radio-group", groupId);
			elRadio.addEventListener("click", onRadioGroupClick);
			elRadio.checked = (elRadio.getAttribute("value") === defaultValue);
			if (elRadio.checked) elSelected = elRadio;
		}
	}

	onRadioGroupClick.apply(elSelected);

	return groupId;
}

//groupId: any groupId or radio id
var getValue = function (groupId) {
	var el = ele(groupId);
	var lastId = el.getAttribute("ht-ui-radio-group-last");
	if (!lastId) {
		//try get from radio
		groupId = getSubRadios(el)[0].getAttribute("ht-ui-radio-group");
		if (!groupId) return null;
		lastId = ele(groupId).getAttribute("ht-ui-radio-group-last");
		if (!lastId) return null;
	}
	return ele(lastId).getAttribute("value");
}

// module

module.exports = {
	init: init,
	getValue: getValue,
};
