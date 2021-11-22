
// htm-tool-ui @ htm-tool ui module set.

"use strict";

var popup_common = require("./lib/popup-common.js");

// module

module.exports = {
	//tab
	tab: require("./lib/tab.js"),

	//radio group
	radio_group: require("./lib/radio-group.js"),

	//show log
	show_log: require("./lib/show-log.js"),

	//drag
	drag: require("./lib/drag-object.js"),

	//popup
	popup: require("./lib/popup.js"),

	//popup-common

	alert: popup_common.alert,
	confirm: popup_common.confirm,
	confirmYnc: popup_common.confirmYnc,
	prompt: popup_common.prompt,
	selectRadioList: popup_common.selectRadioList,
	selectCheckboxList: popup_common.selectCheckboxList,
	selectButtonList: popup_common.selectButtonList,

	//width splitter
	width_splitter: require("./lib/width-splitter.js"),

};
