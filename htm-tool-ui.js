
// htm-tool-ui @ htm-tool ui module.

"use strict";

var add_css_text = require("add-css-text");
var ele = require("element-tool");
var query_by_name_path = require("query-by-name-path");
var tmkt = require("tmkt");
var dom_document_tool = require("dom-document-tool");
var add_event_listeners = require("add-event-listeners");
var htm_tool_css = require("htm-tool-css");

/*
//////////////////////////////////////////////////////////////////////////////////////////
// tab control

	example:

		<div class='ht-tab-group'>
			<span class='ht-tab-item ht-tab-item-selected' id='spTab1'>Tab1</span>
			<span class='ht-tab-item' id='spTab2'>Tab2</span>
		</div>
		<div id='divTab1'><b>tab1 content</b></div>
		<div id='divTab2' style='display:none;'><i>tab2 content</i></div>

		//init tab control
		htm_tool_ui.initTabControl({'spTab1':'divTab1','spTab2':'divTab2'},'spTab1');
		//or tab/view pair array
		htm_tool_ui.initTabControl(['spTab1', 'divTab1', 'spTab2', 'divTab2'], 'spTab1');

		//get last tab id
		assert(htm_tool_ui.getLastTabId('spTab1') === htm_tool_ui.getLastTabId('spTab2'));

*/

var tabInitialized = false;		//tab initialized flag

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
var initTabControl = function (tabPairArray, tabSelected, elGroup) {
	//init css
	if (!tabInitialized) {
		tabInitialized = true;
		add_css_text(require("./res/tab.css"), "ht-ui-tab-css");
	}

	var i;
	if (!(tabPairArray instanceof Array)) {
		var a = [];
		for (i in tabPairArray) a.push(i, tabPairArray[i]);
		tabPairArray = a;
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

//groupId: groupId or tab id
var getLastTabId = function (groupId) {
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

/*
//////////////////////////////////////////////////////////////////////////////////////////
// radio group

	example:
		//don't set name attribute of radio control, to avoid outside name duplication.

		<label id='id1'><input type='radio' value='a'></input>aaa</label><br>
		<label id='id2'><input type='radio' value='b' checked></input>bbb</label><br>
		<label id='id3'><input type='radio' value='c' disabled></input>ccc</label><br>

		//init radio group
		htm_tool_ui.initRadioGroup(['id1','id2','id3'],'id1');

		//get value
		assert(htm_tool_ui.getRadioGroupValue('id1') === htm_tool_ui.getRadioGroupValue('id2'));

*/

var getSubRadio = function (el) {
	el = ele(el);
	return (el.tagName.toUpperCase() == "INPUT" && el.type == "radio") ? el :
		el.querySelector("input[type='radio']");
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
var initRadioGroup = function (radioArray, radioSelected, elGroup) {
	//prepare group id
	if (!elGroup) elGroup = radioArray[0];
	var groupId = ele.id(ele(elGroup));

	var i, elRadio;
	for (var i = 0; i < radioArray.length; i++) {
		elRadio = getSubRadio(radioArray[i]);

		elRadio.setAttribute("ht-ui-radio-group", groupId);
		elRadio.addEventListener("click", onRadioGroupClick);
		elRadio.checked = (ele(radioSelected) === elRadio);
	}

	if (radioSelected) onRadioGroupClick.apply(getSubRadio(radioSelected));

	return groupId;
}

//groupId: groupId or radio id
var getRadioGroupValue = function (groupId) {
	var el = ele(groupId);
	var lastId = el.getAttribute("ht-ui-radio-group-last");
	if (!lastId) {
		//try get from radio
		groupId = getSubRadio(el).getAttribute("ht-ui-radio-group");
		if (!groupId) return null;
		lastId = ele(groupId).getAttribute("ht-ui-radio-group-last");
		if (!lastId) return null;
	}
	return ele(lastId).getAttribute("value");
}

/*
//////////////////////////////////////////////////////////////////////////////////////////
// log control

	example:
		
		htm_tool_ui.showLog("some log message");
*/

var LOG_HIDE_DELAY = 5000;	//log hide delay, in ms.

var tmidLog = null;	//log timer id
var elidLog = null;	//element id

var showLog = function (s) {

	//init
	var elLog = ele(elidLog);
	if (!elLog) {
		elLog = dom_document_tool.appendBodyHtml(require("./res/log.htm"));
		elLog.addEventListener("click", function () { showLog(); });
		query_by_name_path(elLog, "close").addEventListener("click",
			function () { setTimeout(function () { showLog(false); }, 0); }
		);
		query_by_name_path(elLog, "minimize").addEventListener("click",
			function () { setTimeout(function () { showLog(null); }, 0); }
		);

		elidLog = ele.id(elLog);
	}

	//----------------------------------------------------------------------------------------

	var el = query_by_name_path(elLog, 'content');
	var elMinimize = query_by_name_path(elLog, 'minimize');
	var elClose = query_by_name_path(elLog, 'close');

	elLog.style.display = "";

	if (s) {
		while (el.childNodes.length >= 10) {
			el.removeChild(el.firstChild);
		}

		var tms = tmkt.toString19();
		el.innerHTML += "<div>* <span class='ht-cmd' " +
			"onclick=\"if(!this.title)return;this.textContent=this.title;this.style.color='green';this.onclick=null;this.className=this.title='';\" " +
			"title='" + tms + "'>" + tms.slice(-8) + "</span> " + s + "</div>";
		el.style.display = elMinimize.style.display = elClose.style.display = "";
	}
	else {
		if (s === null || s === false) {
			el.style.display = elMinimize.style.display = elClose.style.display = "none";
			if (s === false) elLog.style.display = "none";
		}
		else if (el.style.display == "none" && el.childNodes.length > 0) {
			el.style.display = elMinimize.style.display = elClose.style.display = "";
		}
	}

	if (el.style.display != "none") {
		if (tmidLog) { clearTimeout(tmidLog); tmidLog = null; }
		tmidLog = setTimeout(
			function () {
				el.style.display = elMinimize.style.display = elClose.style.display = "none";
				tmidLog = null;
			},
			LOG_HIDE_DELAY
		);
	}
}

/*
//////////////////////////////////////////////////////////////////////////////////////////
// drag tool, support mouse and multiple touches.

	example:
		
		<div onmousedown="htm_tool_ui.startDrag( arguments[0], this )" ontouchstart="htm_tool_ui.startDrag( arguments[0], this )">...</div>
*/

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
			evt.target.classList.contains("ht-input") || evt.target.classList.contains("ht-cmd")) { return false; }

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

};

dragObject.init();

var startDragListener = function () {
	dragObject.start(arguments[0], this);
}

/*
//////////////////////////////////////////////////////////////////////////////////////////
// popup pannel tool

	example:
		<div id='divPopup1' class='ht-popup' style='display:none;'>
			<div class='ht-popup-body' onmousedown='htm_tool_ui.startDrag( arguments[0], this )' ontouchstart='htm_tool_ui.startDrag( arguments[0], this )'>
				popup-1<hr>This is popup-1.
			</div>
		</div>
		
		htm_tool_ui.showPopup('divPopup1');
*/

var popupStack = null;	//item: [el, cb ]

var popupBackClickListener = function () {
	if (!this.parentNode.querySelector('.ht-popup-body').classList.contains('ht-popup-modal'))
		hidePopup(this);
}
var popupCloseListener = function () {
	hidePopup(this);
}
var popupCloseByNameListener = function () {
	hidePopup(this, this.getAttribute("name"));
}

var showPopup = function (el, modal, cb) {

	//init
	if (!popupStack) {
		popupStack = [];

		add_css_text(require("./res/popup.css"));
	}

	//----------------------------------------------------------------------------------------

	el = ele(el);

	//check closed
	while (popupStack.length > 0) {
		if (popupStack[popupStack.length - 1][0].style.display == "none") popupStack.pop();
		else break;
	}

	//don't re-open
	var i, imax = popupStack.length;
	for (i = 0; i < imax; i++) {
		if (popupStack[i][0] === el) {
			console.error("fail to re-open popup, " + (el.id || ""));
			return;
		}
	}

	//check body
	var elBody = el.querySelector(".ht-popup-body");
	if (!elBody) {
		console.error("popup-body unfound, " + (el.id || ""));
		return;
	}

	//add back
	if (!el.querySelector(".ht-popup-back")) {
		var elBack = dom_document_tool.prependHtml(el, "<div class='ht-popup-back'></div>");
		elBack.addEventListener("click", popupBackClickListener);
	}

	//add close button
	var elClose = elBody.querySelector("span[name='ht-popup-close']");
	if (!elClose) {
		elClose = dom_document_tool.prependHtml(elBody,
			"<span name='ht-popup-close' style='float:right;text-decoration:none;padding:0em 0.3em;' " +
			"class='ht-cmd' title='关闭'>x</span>");
		elClose.addEventListener("click", popupCloseListener);
	}

	//modal setting
	if (modal) {
		elBody.classList.add("ht-popup-modal");
		elClose.innerHTML = "[&times;]";
	}
	else {
		elBody.classList.remove("ht-popup-modal");
		elClose.innerHTML = "(&times;)";
	}

	el.style.display = "";

	el.style.zIndex = 10 + popupStack.length;

	popupStack.push([el, cb]);

	return el;
}

var hidePopup = function (el, data) {
	el = ele(el);

	//find .ht-popup
	while (el && !el.classList.contains("ht-popup")) { el = el.parentNode; }
	if (!el) {
		console.error("top ht-popup unfound");
		return;
	}

	var i, psi;
	for (i = popupStack.length - 1; i >= 0; i--) {
		psi = popupStack[i];
		if (el === psi[0]) {
			el.style.display = "none";
			popupStack.pop();
			if (psi[1]) psi[1](null, data);
			return;
		}

		if (psi[0].style.display == "none") {
			popupStack.pop();
			continue;
		}

		break;	//fail
	}

	if (!popupStack.length) return;

	//abnormal popup, close all.
	console.error("abnormal popup, close all.");
	while (popupStack.length > 0) {
		popupStack.pop()[0].style.display = "none";
	}
}

//----------------------------------------------------------------------------------------

var POPUP_HTML_COUNT_MAX = 10;

var showPopupHtml = function (bodyHtml, modal, cb) {

	//find empty html
	var i, nm, el;
	for (i = 1; i <= POPUP_HTML_COUNT_MAX; i++) {
		nm = "ht-popup-html-" + i;
		el = ele(nm);
		if (!el) break;
		if (el.style.display == "none") break;
	}

	if (i > POPUP_HTML_COUNT_MAX) {
		console.error("popup-html stack overflow, max " + POPUP_HTML_COUNT_MAX);
		return;
	}

	//init
	var elPopup = ele(nm), elBody;
	if (!elPopup) {
		elPopup = dom_document_tool.appendBodyHtml(
			"<div id='" + nm + "' class='ht-popup' style='display:none;'>" +
			"<div class='ht-popup-body'></div>" +
			"</div>"
		);
		elBody = ele(nm).querySelector(".ht-popup-body");
		add_event_listeners(
			elBody,
			["mousedown", startDragListener],
			["touchstart", startDragListener]
		);
	}
	else {
		elBody = ele(nm).querySelector(".ht-popup-body");
	}
	elBody.innerHTML = bodyHtml;

	return showPopup(nm, (typeof modal === "undefined") ? 1 : modal, cb);
}

var alert = function (message, modal, cb) {
	var elPopup = showPopupHtml(require("./res/alert.htm"), modal, cb);

	query_by_name_path(elPopup, ".message").innerHTML = message;
	query_by_name_path(elPopup, ".ok").addEventListener("click", popupCloseListener);
}
var confirm = function (message, modal, cb) {
	var elPopup = showPopupHtml(require("./res/confirm.htm"), modal, cb);

	query_by_name_path(elPopup, ".message").innerHTML = message;
	query_by_name_path(elPopup, ".ok").addEventListener("click", popupCloseByNameListener);
	query_by_name_path(elPopup, ".cancel").addEventListener("click", popupCloseListener);
}
var confirmYnc = function (message, modal, cb) {
	var elPopup = showPopupHtml(require("./res/confirm-ync.htm"), modal, cb);

	query_by_name_path(elPopup, ".message").innerHTML = message;
	query_by_name_path(elPopup, ".yes").addEventListener("click", popupCloseByNameListener);
	query_by_name_path(elPopup, ".no").addEventListener("click", popupCloseByNameListener);
	query_by_name_path(elPopup, ".cancel").addEventListener("click", popupCloseListener);
}

//----------------------------------------------------------------------------------------

var promptListener = function () {
	hidePopup(this, query_by_name_path(this.parentNode.parentNode, '.input').value);
}

var prompt = function (message, defaultValue, modal, cb) {
	var elPopup = showPopupHtml(require("./res/prompt.htm"), modal, cb);

	query_by_name_path(elPopup, ".message").innerHTML = message;
	query_by_name_path(elPopup, ".ok").addEventListener("click", promptListener);
	query_by_name_path(elPopup, ".cancel").addEventListener("click", popupCloseListener);

	if (defaultValue) query_by_name_path(elPopup, '.input').value = defaultValue;
}

//----------------------------------------------------------------------------------------

var selectRadioChangeListener = function () {
	if (!this.checked) return;

	var elInput = this.parentNode.parentNode;

	var oldv = elInput.getAttribute('value');
	var oldel = dom_document_tool.querySelectorByAttr(elInput, 'input', 'value', oldv);
	htm_tool_css.setSelected(this.parentNode, oldel && oldel.parentNode, true);
	elInput.setAttribute('value', this.value);
}

var selectRadioListener = function () {
	var elInput = query_by_name_path(this.parentNode.parentNode, '.input');
	//if no radio is checked, process will be stopped by error.
	hidePopup(this, elInput.querySelector('input:checked').value);
}

//item: [value,text], or single string for both value and text.
var selectRadioList = function (message, itemList, defaultValue, modal, cb) {
	var elPopup = showPopupHtml(require("./res/select-list.htm"), modal, cb);

	query_by_name_path(elPopup, ".message").innerHTML = message;
	query_by_name_path(elPopup, ".ok").addEventListener("click", selectRadioListener);
	query_by_name_path(elPopup, ".cancel").addEventListener("click", popupCloseListener);

	var elInput = query_by_name_path(elPopup, '.input');
	if (defaultValue) elInput.setAttribute("value", defaultValue);

	var nm = ele.id(null, "ht-select-radio-");
	var i, imax = itemList.length, v, elItem, elRadio, isSelected;
	for (i = 0; i < imax; i++) {
		v = itemList[i];
		if (!(v instanceof Array)) v = [v, v];

		elItem = dom_document_tool.appendHtml(elInput,
			"<label class='ht-hover' style='width:100%;display:block;margin-bottom:1px;'></label>");
		elItem.innerHTML = " " + v[1];
		isSelected = (v[0] == defaultValue);
		if (isSelected) elItem.classList.add("ht-selected");

		elRadio = dom_document_tool.prependHtml(elItem, "<input type='radio' name='" + nm + "'></input> ");
		elRadio.value = v[0];
		if (isSelected) elRadio.checked = true;

		elRadio.addEventListener("change", selectRadioChangeListener);
	}
}

//----------------------------------------------------------------------------------------

var selectCheckboxChangeListener = function () {
	htm_tool_css.setSelected(this.parentNode, null, this.checked);
}

var selectCheckboxListener = function () {
	var items = query_by_name_path(this.parentNode.parentNode, '.input').querySelectorAll('input:checked');
	var i, a = [];		//return empty array if nothing selected
	for (i = 0; i < items.length; i++) {
		a[i] = items[i].value;
	};
	hidePopup(this, a);
}

var selectCheckboxList = function (message, itemList, defaultValueList, modal, cb) {
	var elPopup = showPopupHtml(require("./res/select-list.htm"), modal, cb);

	query_by_name_path(elPopup, ".message").innerHTML = message;
	query_by_name_path(elPopup, ".ok").addEventListener("click", selectCheckboxListener);
	query_by_name_path(elPopup, ".cancel").addEventListener("click", popupCloseListener);

	if (!defaultValueList || typeof defaultValueList == "string") defaultValueList = [defaultValueList];
	var elInput = query_by_name_path(elPopup, '.input');

	var i, imax = itemList.length, v, elItem, elCheck, isSelected;
	for (i = 0; i < imax; i++) {
		v = itemList[i];
		if (!(v instanceof Array)) v = [v, v];

		elItem = dom_document_tool.appendHtml(elInput,
			"<label class='ht-hover' style='width:100%;display:block;margin-bottom:1px;'></label>");
		elItem.innerHTML = " " + v[1];
		isSelected = (defaultValueList.indexOf(v[0]) >= 0);
		if (isSelected) elItem.classList.add("ht-selected");

		elCheck = dom_document_tool.prependHtml(elItem, "<input type='checkbox'></input> ");
		elCheck.value = v[0];
		if (isSelected) elCheck.checked = true;

		elCheck.addEventListener("change", selectCheckboxChangeListener);
	}
}

//----------------------------------------------------------------------------------------

var selectButtonList = function (message, itemList, modal, cb) {
	var elPopup = showPopupHtml(require("./res/button-list.htm"), modal, cb);

	query_by_name_path(elPopup, ".message").innerHTML = message;

	var elInput = query_by_name_path(elPopup, '.input');

	var i, imax = itemList.length, v, elItem;
	for (i = 0; i < imax; i++) {
		v = itemList[i];
		if (!(v instanceof Array)) v = [v, v];

		elItem = dom_document_tool.appendHtml(elInput,
			"<button style='width:100%;display:block;margin-bottom:0.5em;'></button>");
		elItem.innerHTML = v[1];
		elItem.setAttribute("name", v[0]);

		elItem.addEventListener("click", popupCloseByNameListener);
	}
	//add last cancel
	elItem = dom_document_tool.appendHtml(elInput,
		"<button style='width:100%;display:block;margin-bottom:1px;margin-top:1em;'>取消</button>");
	elItem.addEventListener("click", popupCloseListener);
}

// module

module.exports = {
	//tab
	initTabControl: initTabControl,
	getLastTabId: getLastTabId,

	//radio group
	initRadioGroup: initRadioGroup,
	getRadioGroupValue: getRadioGroupValue,

	//log
	showLog: showLog,

	//drag
	dragObject: dragObject,
	startDrag: dragObject.start.bind(dragObject),
	startDragListener: startDragListener,

	//popup
	showPopup: showPopup,
	hidePopup: hidePopup,

	popupCloseListener: popupCloseListener,
	popupCloseByNameListener: popupCloseByNameListener,

	//popup html
	showPopupHtml: showPopupHtml,

	alert: alert,
	confirm: confirm,
	confirmYnc: confirmYnc,
	prompt: prompt,
	selectRadioList: selectRadioList,
	selectCheckboxList: selectCheckboxList,
	selectButtonList: selectButtonList,

};
