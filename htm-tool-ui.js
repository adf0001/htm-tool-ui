
// htm-tool-ui @ htm-tool ui module set.

"use strict";

var popup_common = require("./lib/popup-common.js");
var show_log = require("./lib/show-log.js");
var radio_group = require("radio-group-tool");
var popup = require("./lib/popup.js");
var width_splitter = require("width-splitter");
var htm_tool_css = require("htm-tool-css");

// module

module.exports = {
	//tab
	tab: require("./lib/tab.js"),

	//radio group
	radio_group: radio_group,
	radioGroup: radio_group,

	//show log
	show_log: show_log,
	showLog: show_log,

	//drag
	drag: require("drag-object"),

	//popup
	popup: popup,

	showPopup: popup.show,
	hidePopup: popup.hide,

	showPopupHtml: popup.showHtml,

	//popup-common

	alert: popup_common.alert,
	confirm: popup_common.confirm,
	confirmYnc: popup_common.confirmYnc,
	prompt: popup_common.prompt,
	selectRadioList: popup_common.selectRadioList,
	selectCheckboxList: popup_common.selectCheckboxList,
	selectButtonList: popup_common.selectButtonList,

	//width splitter
	width_splitter: width_splitter,
	widthSplitter: width_splitter,

	//htm_tool_css
	setClass: htm_tool_css,
	setElClass: htm_tool_css.setEl,

};
