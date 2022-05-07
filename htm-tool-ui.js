
// htm-tool-ui @ htm-tool ui module set.

"use strict";

var show_log = require("show-log-tool");
var radio_group = require("radio-group-tool");
var simple_popup_tool = require("simple-popup-tool");
var width_splitter = require("width-splitter");
var htm_tool_css = require("htm-tool-css");
var drag_object = require("drag-object");
var tab_control_tool = require("tab-control-tool");

// module

module.exports = {
	//tab
	tab_control_tool: tab_control_tool,

	tab: tab_control_tool,

	//radio group
	radio_group: radio_group,
	radioGroup: radio_group,

	//show log
	show_log: show_log,
	showLog: show_log,

	//drag
	drag_object: drag_object,
	dragObject: drag_object,

	drag: drag_object,

	//popup
	simple_popup_tool: simple_popup_tool,

	popup: simple_popup_tool,

	showPopup: simple_popup_tool.show,
	hidePopup: simple_popup_tool.hide,

	showPopupHtml: simple_popup_tool.showHtml,

	//popup-common

	alert: simple_popup_tool.alert,
	confirm: simple_popup_tool.confirm,
	confirmYnc: simple_popup_tool.confirmYnc,
	prompt: simple_popup_tool.prompt,
	selectRadioList: simple_popup_tool.selectRadioList,
	selectCheckboxList: simple_popup_tool.selectCheckboxList,
	selectButtonList: simple_popup_tool.selectButtonList,

	//width splitter
	width_splitter: width_splitter,
	widthSplitter: width_splitter,

	//htm_tool_css
	htm_tool_css: htm_tool_css,

	setClass: htm_tool_css,
	setElClass: htm_tool_css.setEl,

};
