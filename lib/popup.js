
/*
popup pannel tool

	example:
		<div id='divPopup1' class='ht popup' style='display:none;'>
			<div class='ht popup-body'>
				popup-1<hr>This is popup-1.
			</div>
		</div>
		
		htm_tool_ui.popup.show('divPopup1');
*/

var ele = require("element-tool");
var add_css_text = require("add-css-text");
var options_from_options = require("options-from-options");
var insert_adjacent_return = require("insert-adjacent-return");
var htm_tool_css = require("htm-tool-css");

var drag_object = require("./drag-object.js");

var popupStack = null;	//item: [el, cb ]

var backClickListener = function () {
	if (!this.parentNode.querySelector('.ht.popup-body').classList.contains('popup-modal'))
		hide(this);
}
var closeListener = function () {
	hide(this);
}
var closeByNameListener = function () {
	hide(this, this.getAttribute("name"));
}
var maxListener = function (evt, restore) {
	var el = this;
	//find .ht-popup-body
	while (el && !el.classList.contains("popup-body")) { el = el.parentNode; }
	if (!el) {
		console.error("top ht.popup-body unfound");
		return;
	}
	if (el.style.position == "absolute") {
		//restore
		el.style.position = "relative";
		el.style.marginTop = null;
		var saveLeftTop = el.getAttribute("saveLeftTop");
		if (saveLeftTop) {
			saveLeftTop = saveLeftTop.split(",");
			el.style.left = saveLeftTop[0];
			el.style.top = saveLeftTop[1];
		}
		else {
			el.style.left = el.style.top = "auto";
		}
		el.style.bottom = el.style.right = "auto";

		this.style.background = "";
	}
	else if (!restore) {
		//maximize
		el.style.position = "absolute";
		el.style.marginTop = "0";
		el.setAttribute("saveLeftTop", el.style.left ? (el.style.left + "," + el.style.top) : "");
		el.style.left = el.style.top = el.style.bottom = el.style.right = "16px";

		this.style.background = "lime";
		this.style.backgroundClip = "content-box";
	}
}

//options: { modal, cb, cbThis, dragMode, maximizeButton, maximized } | modal | cb
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
	var elBody = el.querySelector(".ht.popup-body");
	if (!elBody) {
		console.error("popup-body unfound, " + (el.id || ""));
		return;
	}

	//==============================
	//init element

	if (!el.classList.contains("popup")){
		htm_tool_css(el,["ht","popup"])		//ensure popup base
	}

	//add back
	if (!el.querySelector(".ht.popup-back")) {
		var elBack = insert_adjacent_return.prepend(el, "<div class='ht popup-back'></div>");
		elBack.addEventListener("click", backClickListener);
	}

	//add close button
	var elClose = elBody.querySelector("span[name='ht-popup-close']"), elTool;
	if (!elClose) {
		elTool = insert_adjacent_return.prepend(elBody, "<span style='float:right;'></span>");
		elClose = insert_adjacent_return.prepend(elTool,
			"<span name='ht-popup-close' style='text-decoration:none;padding:0em 0.3em;' " +
			"class='ht cmd' title='Close'>x</span>");
		elClose.addEventListener("click", closeListener);
	}
	else elTool = elClose.parentNode;

	//maximizeButton
	var elMax = elTool.querySelector("span[name='ht-popup-max']");
	if (options.maximizeButton || options.maximized) {
		if (!elMax) {
			elMax = insert_adjacent_return.prepend(elTool,
				"<span name='ht-popup-max' style='text-decoration:none;padding:0em 0.3em;' " +
				"class='ht cmd' title='Maximize'>&and;</span>");
			elMax.addEventListener("click", maxListener);
		}
		else { elMax.style.display = ""; }

		if (options.maximized) setTimeout(function () { maxListener.call(elMax); }, 0);
	}
	else {
		if (elMax) { elMax.style.display = "none"; }
	}
	//------------------------------

	//drag handler
	var dragMode = options.dragMode;

	if (dragMode === "user-defined") {	//untouch
	}
	else if (dragMode === "none") {
		elBody.onmousedown = elBody.ontouchstart = null;
		if (elTool.nextElementSibling) {
			elTool.nextElementSibling.onmousedown = elTool.nextElementSibling.ontouchstart = null;
		}
	}
	else if (dragMode === "first") {
		elBody.onmousedown = elBody.ontouchstart = null;
		if (elTool.nextElementSibling) {
			elTool.nextElementSibling.onmousedown = elTool.nextElementSibling.ontouchstart = drag_object.startListenerForParent;
		}
	}
	else {
		elBody.onmousedown = elBody.ontouchstart = drag_object.startListener;
		if (elTool.nextElementSibling) {
			elTool.nextElementSibling.onmousedown = elTool.nextElementSibling.ontouchstart = null;
		}
	}

	//modal setting
	if (options.modal) {
		elBody.classList.add("popup-modal");
		elClose.innerHTML = "[&times;]";
		if (elMax) elMax.innerHTML = "[&and;]";
	}
	else {
		elBody.classList.remove("popup-modal");
		elClose.innerHTML = "(&times;)";
		if (elMax) elMax.innerHTML = "(&and;)";
	}

	el.style.display = "";

	el.style.zIndex = 10 + popupStack.length;

	popupStack.push([el, options]);

	return el;
}

var hide = function (el, data) {
	el = ele(el);

	//find .ht.popup
	while (el && !(el.classList.contains("ht") && el.classList.contains("popup"))) { el = el.parentNode; }
	if (!el) {
		console.error("top ht.popup unfound");
		return;
	}

	//restore maximized
	var elMax = el.querySelector("span[name='ht-popup-max']");
	if (elMax) { maxListener.call(elMax, null, true); }

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
		elPopup = insert_adjacent_return.append(
			document.body,
			"<div id='" + nm + "' class='ht popup' style='display:none;'>" +
			"<div class='ht popup-body'></div>" +
			"</div>"
		);
	}

	elBody = elPopup.querySelector(".ht.popup-body");
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
