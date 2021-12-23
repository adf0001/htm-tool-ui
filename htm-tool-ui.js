
// htm-tool-ui @ htm-tool ui module set.

"use strict";

var popup_common = require("./lib/popup-common.js");
var show_log = require("./lib/show-log.js");
var radio_group = require("./lib/radio-group.js");
var popup = require("./lib/popup.js");
var width_splitter = require("./lib/width-splitter.js");

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
	drag: require("./lib/drag-object.js"),

	//popup
	popup: popup,

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

};
