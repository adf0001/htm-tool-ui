
/*
width splitter

	example:

		<div style='position:relative;width:300px;height:300px;'>
			<div id='div1' style='position:absolute;left:0px;top:0px;bottom:0px;width:30%;background:#FFeeee;'></div>
			<div id='div2' style='position:absolute;left:0px;top:0px;bottom:0px;width:70%;background:#eeFFee;'></div>
			<div id='splitter1' style='z-index:1;position:absolute;left:100px;width:10px;top:20px;bottom:30px;'></div>
		</div>
		
		<div id='div3' style='width:100px;height:100px;background:#eeeeFF;'></div>

		//init width splitter
		htm_tool_ui.width_splitter('splitter1',['div1','div3'],'div2',10);

*/

var ele = require("element-tool");

var drag_object = require("./drag-object.js");
var to_px_by_offset = require("./to-px-by-offset.js");

var widthSplitterDragObject = new drag_object.class({

	option: {},
	leftList: null,
	rightList: null,

	el1: null,
	top0: null,
	left0: null,
	leftWidth0: null,
	rightWidth0: null,

	start: function (evt, el1) {
		drag_object.start.apply(this, arguments);

		this.el1 = el1;
		this.top0 = el1.style.top;
		this.left0 = to_px_by_offset.left(el1);

		//leftWidth0
		var i, imax, wa;
		this.leftWidth0 = wa = [];
		imax = this.leftList.length;
		for (i = 0; i < imax; i++) {
			wa[wa.length] = to_px_by_offset.width(ele(this.leftList[i]));
		}

		//rightWidth0
		this.rightWidth0 = wa = [];
		imax = this.rightList.length;
		for (i = 0; i < imax; i++) {
			wa[wa.length] = to_px_by_offset.width(ele(this.rightList[i]));
		}

		this.el1.style.background = 'lightgrey';
	},

	onStop: function (evt) {
		drag_object.onStop.apply(this, arguments);
		this.el1.style.background = '';
		this.el1 = null;
	},
	onMove: function (evt) {
		drag_object.onMove.apply(this, arguments);
		if (!this.moveChanged) return;

		this.el1.style.top = this.top0;	//restore top
		var dx = parseInt(this.el1.style.left) - this.left0;

		var i, imax, w, option = this.option, dx0 = dx;

		//check dx

		imax = this.leftList.length;
		for (i = 0; i < imax; i++) {
			w = this.leftWidth0[i] + dx;
			if (w < option.minLeft) dx = option.minLeft - this.leftWidth0[i];
			if (option.maxLeft && w > option.maxLeft) dx = option.maxLeft - this.leftWidth0[i];
		}

		imax = this.rightList.length;
		for (i = 0; i < imax; i++) {
			w = this.rightWidth0[i] - dx;
			if (w < option.minRight) dx = -(option.minRight - this.rightWidth0[i]);
			if (option.maxRight && w > option.maxRight) dx = -(option.maxRight - this.rightWidth0[i]);
		}

		//update width
		imax = this.leftList.length;
		for (i = 0; i < imax; i++) {
			ele(this.leftList[i]).style.width = (this.leftWidth0[i] + dx) + "px";
		}

		imax = this.rightList.length;
		for (i = 0; i < imax; i++) {
			ele(this.rightList[i]).style.width = (this.rightWidth0[i] - dx) + "px";
		}

		if (dx != dx0) this.el1.style.left = (dx + this.left0) + "px";

		if (option.callback) option.callback(dx);
	},

});

widthSplitterDragObject.init();

/*
	option:
		.minLeft		min width of left side, default 0;
		.maxLeft		max width of left side;
		.minRight		min width of right side, default 0;
		.maxRight		max width of right side;
		.min			min width of both left and right side;		//shortcut when `option` is number
		.max			max width of both left and right side;
		.cb/.callback	callback function after the width is changed.	//shortcut when `option` is function

*/

widthSplitterDragObject.class = function (elsplitter, leftList, rightList, option) {
	//option
	var typeofOption = typeof option;
	if (typeofOption === "function") option = { callback: option };
	else if (typeofOption === "number") option = { min: option };
	else if (!option) option = {};


	option.minLeft = option.minLeft || option.min || 0;
	option.maxLeft = option.maxLeft || option.max || 0;
	option.minRight = option.minRight || option.min || 0;
	option.maxRight = option.maxRight || option.max || 0;

	option.callback = option.callback || option.cb;

	if (!(leftList instanceof Array)) leftList = leftList ? [leftList] : [];
	if (!(rightList instanceof Array)) rightList = rightList ? [rightList] : [];

	//init
	elsplitter = ele(elsplitter);
	elsplitter.style.cursor = "ew-resize";

	var o = Object.create(widthSplitterDragObject);
	o.init();

	o.option = option;
	o.leftList = leftList;
	o.rightList = rightList;

	elsplitter.onmousedown = function () { o.start(arguments[0], this); }
	elsplitter.ontouchstart = elsplitter.onmousedown;

	return o;
}

// module

module.exports = function (elsplitter, leftList, rightList, option) {
	return new widthSplitterDragObject.class(elsplitter, leftList, rightList, option);
};
