
var ele = require("element-tool");
var popup = require("./popup.js");
var query_by_name_path = require("query-by-name-path");
var htm_tool_css = require("htm-tool-css");
var dom_document_tool = require("dom-document-tool");

var alert = function (message, modal/*optional*/, cb) {
	//args
	if (typeof modal === "function" && !cb) { cb = modal; modal = false; }

	var elPopup = popup.showHtml(require("./popup-common/alert.htm"), modal, cb);

	query_by_name_path(elPopup, ".message").innerHTML = message;
	query_by_name_path(elPopup, ".ok").addEventListener("click", popup.closeListener);
}
var confirm = function (message, modal/*optional*/, cb) {
	//args
	if (typeof modal === "function" && !cb) { cb = modal; modal = false; }

	var elPopup = popup.showHtml(require("./popup-common/confirm.htm"), modal, cb);

	query_by_name_path(elPopup, ".message").innerHTML = message;
	query_by_name_path(elPopup, ".ok").addEventListener("click", popup.closeByNameListener);
	query_by_name_path(elPopup, ".cancel").addEventListener("click", popup.closeListener);
}
var confirmYnc = function (message, modal/*optional*/, cb) {
	//args
	if (typeof modal === "function" && !cb) { cb = modal; modal = false; }

	var elPopup = popup.showHtml(require("./popup-common/confirm-ync.htm"), modal, cb);

	query_by_name_path(elPopup, ".message").innerHTML = message;
	query_by_name_path(elPopup, ".yes").addEventListener("click", popup.closeByNameListener);
	query_by_name_path(elPopup, ".no").addEventListener("click", popup.closeByNameListener);
	query_by_name_path(elPopup, ".cancel").addEventListener("click", popup.closeListener);
}

//----------------------------------------------------------------------------------------

var promptListener = function () {
	popup.hide(this, query_by_name_path(this.parentNode.parentNode, '.input').value);
}

var prompt = function (message, defaultValue/*optional*/, modal/*optional*/, cb) {
	//args
	if (typeof defaultValue === "function" && typeof modal === "undefined" && !cb) { cb = defaultValue; defaultValue = ""; modal = false; }
	else if (typeof modal === "function" && !cb) { cb = modal; modal = false; }

	var elPopup = popup.showHtml(require("./popup-common/prompt.htm"), modal, cb);

	query_by_name_path(elPopup, ".message").innerHTML = message;
	query_by_name_path(elPopup, ".ok").addEventListener("click", promptListener);
	query_by_name_path(elPopup, ".cancel").addEventListener("click", popup.closeListener);

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
	popup.hide(this, elInput.querySelector('input:checked').value);
}

//item: [value,text], or single string for both value and text.
var selectRadioList = function (message, itemList, defaultValue/*optional*/, modal/*optional*/, cb) {
	//args
	if (typeof defaultValue === "function" && typeof modal === "undefined" && !cb) { cb = defaultValue; defaultValue = ""; modal = false; }
	else if (typeof modal === "function" && !cb) { cb = modal; modal = false; }

	var elPopup = popup.showHtml(require("./popup-common/select-list.htm"), modal, cb);

	query_by_name_path(elPopup, ".message").innerHTML = message;
	query_by_name_path(elPopup, ".ok").addEventListener("click", selectRadioListener);
	query_by_name_path(elPopup, ".cancel").addEventListener("click", popup.closeListener);

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
	popup.hide(this, a);
}

var selectCheckboxList = function (message, itemList, defaultValueList/*optional*/, modal/*optional*/, cb) {
	//args
	if (typeof defaultValueList === "function" && typeof modal === "undefined" && !cb) { cb = defaultValueList; defaultValueList = null; modal = false; }
	else if (typeof modal === "function" && !cb) { cb = modal; modal = false; }

	var elPopup = popup.showHtml(require("./popup-common/select-list.htm"), modal, cb);

	query_by_name_path(elPopup, ".message").innerHTML = message;
	query_by_name_path(elPopup, ".ok").addEventListener("click", selectCheckboxListener);
	query_by_name_path(elPopup, ".cancel").addEventListener("click", popup.closeListener);

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

var selectButtonList = function (message, itemList, modal/*optional*/, cb) {
	//args
	if (typeof modal === "function" && !cb) { cb = modal; modal = false; }

	var elPopup = popup.showHtml(require("./popup-common/button-list.htm"), modal, cb);

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

		elItem.addEventListener("click", popup.closeByNameListener);
	}
	//add last cancel
	elItem = dom_document_tool.appendHtml(elInput,
		"<button style='width:100%;display:block;margin-bottom:1px;margin-top:1em;'>取消</button>");
	elItem.addEventListener("click", popup.closeListener);
}

// module

module.exports = {
	alert: alert,
	confirm: confirm,
	confirmYnc: confirmYnc,
	prompt: prompt,
	selectRadioList: selectRadioList,
	selectCheckboxList: selectCheckboxList,
	selectButtonList: selectButtonList,
};
