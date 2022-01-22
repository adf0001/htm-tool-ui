/*
drag tool, support mouse and multiple touches.

	example:
		
		<div onmousedown="htm_tool_ui.drag.start( arguments[0], this )" ontouchstart="htm_tool_ui.drag.start( arguments[0], this )">...</div>
*/

var create_assign = require("create-assign");
var ele = require("element-tool");

var dragObject = {

	dragSet: null,	//map drag start-key to drag start item; drag item: {itemArray,pageX0,pageY0,from,elStart,key}
	dragSetCount: 0,

	moveChanged: false,		//move changed flag

	init: function () {		//manually called constructor
		this.dragSet = {};
		this.dragSetCount = 0;
		this._onMove = this._onStop = this._onKey = null;		//clear binding from prototype

		//this.startDrag= this.start.bind(this);		//binding function for start()		//not usually, cancelled.
	},

	//start: function ( evt, el1, el2, ..., elN )
	start: function (evt, el1) {
		if (arguments.length < 2) return false;
		if (!evt) evt = window.event;

		//check if target is an input
		if (evt.target.tagName.match(/^(input|button|textarea|select|option.*|a|label)$/i) ||
			evt.target.classList.contains("input") || evt.target.classList.contains("cmd")) { return false; }

		//unify event and drag-data
		var dragEvt, dragItem, evtKey;
		if (evt.type == "mousedown") {
			dragEvt = evt;
			dragItem = { from: "mouse", elStart: evt.target, key: "mouse", };

			if ("mouse" in this.dragSet) this.onStop({ type: "mouseup" });
		}
		else if (evt.type == "touchstart") {
			dragEvt = evt.targetTouches[0];	//only the 1st
			evtKey = "touch-" + dragEvt.identifier;
			dragItem = { from: "touch", elStart: evt.target, key: evtKey, };

			if (evtKey in this.dragSet) this.onStop({ type: "touchend", changedTouches: [{ identifier: dragEvt.identifier }] });
		}
		else { return false; }	//unknown event

		//init drag-data
		dragItem.pageX0 = dragEvt.pageX;
		dragItem.pageY0 = dragEvt.pageY;

		dragItem.itemArray = [];
		var i, imax = arguments.length, el;
		for (i = 1; i < imax; i++) {
			el = ele(arguments[i]);
			dragItem.itemArray.push([el, parseInt(el.style.left) || 0, parseInt(el.style.top) || 0]);
		}

		this.dragSet[dragItem.key] = dragItem;
		this.dragSetCount++;

		if (this.dragSetCount === 1) {
			//global listener
			document.addEventListener("mousemove", this._onMove || (this._onMove = this.onMove.bind(this)), false);
			document.addEventListener("mouseup", this._onStop || (this._onStop = this.onStop.bind(this)), false);
			document.addEventListener("keyup", this._onKey || (this._onKey = this.onKey.bind(this)), false);
			document.addEventListener('touchmove', this._onMove, { passive: false });
			document.addEventListener('touchend', this._onStop, false);
		}

		this.moveChanged = false;
	},

	//return pairs array of [ evt1, dragItem1, evt2, dragItem2, ... ]
	getEventList: function (evt) {
		var list = [];
		var keyType = evt.type.slice(0, 5);

		if (keyType == "mouse") {
			list.push(evt, this.dragSet["mouse"]);
		}
		else if (keyType == "touch") {
			var touchList = (evt.type == "touchend") ? evt.changedTouches : evt.targetTouches;
			var i, imax = touchList.length, k;
			for (i = 0; i < imax; i++) {
				k = "touch-" + touchList[i].identifier;
				if (k in this.dragSet) list.push(touchList[i], this.dragSet[k]);
			}
		}
		else { return null; }	//unknown event

		return (list.length > 0) ? list : null;
	},

	onStop: function (evt) {
		//reset all
		if (evt === false) {
			for (var i in this.dragSet) {
				var dragItem = this.dragSet[i];
				var j, jmax = dragItem.itemArray.length, ai;
				for (j = 0; j < jmax; j++) {
					ai = dragItem.itemArray[j];
					ai[0].style.left = ai[1] + "px";
					ai[0].style.top = ai[2] + "px";
				}
			}
		}

		if (evt) {
			var list = this.getEventList(evt);
			if (!list) return false;

			var i, imax = list.length, dragItem;
			for (i = 0; i < imax; i += 2) {
				dragItem = list[i + 1];
				if (dragItem.key in this.dragSet) {
					delete this.dragSet[dragItem.key];
					this.dragSetCount--;
				}
			}
		}
		else {
			//stop all
			this.dragSet = {};
			this.dragSetCount = 0;
		}

		if (this.dragSetCount < 1) {
			//remove global listener
			//console.log("release drag listener");
			document.removeEventListener("mousemove", this._onMove, false);
			document.removeEventListener("mouseup", this._onStop, false);
			document.removeEventListener("keyup", this._onKey, false);
			document.removeEventListener('touchmove', this._onMove, { passive: false });
			document.removeEventListener('touchend', this._onStop, false);
		}

		if (this.dragSetCount < 0) {
			console.error("dragSetCount abnormal, " + this.dragSetCount);
			this.onStop(false);	//stop all
			this.dragSetCount = 0;
		}
	},

	onFirstMove: null,	//function (evt) {},

	onMove: function (evt) {
		var list = this.getEventList(evt);
		if (!list) return false;

		var i, imax = list.length, dragItem, changed;
		for (i = 0; i < imax; i += 2) {
			dragItem = list[i + 1];

			var dx = list[i].pageX - dragItem.pageX0;
			var dy = list[i].pageY - dragItem.pageY0;
			if (dx || dy) changed = 1;

			var j, jmax = dragItem.itemArray.length, ai;
			for (j = 0; j < jmax; j++) {
				ai = dragItem.itemArray[j];
				ai[0].style.left = (ai[1] + dx) + "px";
				ai[0].style.top = (ai[2] + dy) + "px";
			}
		}

		if (evt.type == "touchmove") { evt.preventDefault(); }

		//console.log("move "+ list[0].pageX +","+ list[0].pageY );

		if (!this.moveChanged && changed) {
			this.moveChanged = true;
			if (this.onFirstMove) this.onFirstMove(evt);
		}

	},

	onKey: function (evt) {
		var keyCode = evt.keyCode || evt.which || evt.charCode;

		if (keyCode == 27) { this.onStop(false); }		//ESC to reset
		else { this.onStop(); }		//others to stop
	},

	//listener tool
	startListener: function () {
		dragObject.start(arguments[0], this);
	},
	startListenerForParent: function () {
		dragObject.start(arguments[0], this.parentNode);
	},

};

dragObject.init();

// module

module.exports = exports = dragObject;

exports.class = function (extraProperties) {
	var o = create_assign(dragObject, extraProperties);
	o.init();
	return o;
};
