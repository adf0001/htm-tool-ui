
/*
popup pannel tool

	example:
		<div id='divPopup1' class='ht-popup' style='display:none;'>
			<div class='ht-popup-body'>
				popup-1<hr>This is popup-1.
			</div>
		</div>
		
		htm_tool_ui.popup.show('divPopup1');
*/

var ele = require("element-tool");
var add_css_text = require("add-css-text");
var dom_document_tool = require("dom-document-tool");
var options_from_options = require("options-from-options");

var drag_object = require("./drag-object.js");

var popupStack = null;	//item: [el, cb ]

var backClickListener = function () {
	if (!this.parentNode.querySelector('.ht-popup-body').classList.contains('ht-popup-modal'))
		hide(this);
}
var closeListener = function () {
	hide(this);
}
var closeByNameListener = function () {
	hide(this, this.getAttribute("name"));
}

//options: { modal, cb, cbThis, dragMode } | modal | cb
//dragMode: "all/default"|"none"|"first"|"user-defined"
//return the popup element
var show = function (el, options, cb) {
	//console.log(options);
	options = options_from_options.cb(options, cb, null, "modal");
	//console.log("new options", options);

	//==============================
	//init global
	if (!popupStack) {
		popupStack = [];

		add_css_text(require("./popup.css"));
	}

	//------------------------------

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

	//==============================
	//init element

	if (!el.classList.contains("ht-popup")) el.classList.add("ht-popup");	//ensure popup base

	//add back
	if (!el.querySelector(".ht-popup-back")) {
		var elBack = dom_document_tool.prependHtml(el, "<div class='ht-popup-back'></div>");
		elBack.addEventListener("click", backClickListener);
	}

	//add close button
	var elClose = elBody.querySelector("span[name='ht-popup-close']");
	if (!elClose) {
		elClose = dom_document_tool.prependHtml(elBody,
			"<span name='ht-popup-close' style='float:right;text-decoration:none;padding:0em 0.3em;' " +
			"class='ht-cmd' title='Close'>x</span>");
		elClose.addEventListener("click", closeListener);
	}

	//------------------------------

	//drag handler
	var dragMode = options.dragMode;

	if (dragMode === "user-defined") {	//untouch
	}
	else if (dragMode === "none") {
		elBody.onmousedown = elBody.ontouchstart = null;
		if (elClose.nextElementSibling) {
			elClose.nextElementSibling.onmousedown = elClose.nextElementSibling.ontouchstart = null;
		}
	}
	else if (dragMode === "first") {
		elBody.onmousedown = elBody.ontouchstart = null;
		if (elClose.nextElementSibling) {
			elClose.nextElementSibling.onmousedown = elClose.nextElementSibling.ontouchstart = drag_object.startListenerForParent;
		}
	}
	else {
		elBody.onmousedown = elBody.ontouchstart = drag_object.startListener;
		if (elClose.nextElementSibling) {
			elClose.nextElementSibling.onmousedown = elClose.nextElementSibling.ontouchstart = null;
		}
	}

	//modal setting
	if (options.modal) {
		elBody.classList.add("ht-popup-modal");
		elClose.innerHTML = "[&times;]";
	}
	else {
		elBody.classList.remove("ht-popup-modal");
		elClose.innerHTML = "(&times;)";
	}

	el.style.display = "";

	el.style.zIndex = 10 + popupStack.length;

	popupStack.push([el, options]);

	return el;
}

var hide = function (el, data) {
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
			if (psi[1].cb) psi[1].cb.call(psi[1].cbThis, null, data);
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

//options: { modal, cb, cbThis, dragMode } | modal | cb
//return the popup element
var showHtml = function (html, options, cb) {
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
	}

	elBody = elPopup.querySelector(".ht-popup-body");
	elBody.innerHTML = html;

	return show(nm, options, cb);
}

// module

module.exports = {
	show: show,
	hide: hide,

	closeListener: closeListener,
	closeByNameListener: closeByNameListener,

	showHtml: showHtml,
};
