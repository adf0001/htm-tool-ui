
var ele_id = require("ele-id");
var popup = require("./popup.js");
var query_by_name_path = require("query-by-name-path");
var htm_tool_css = require("htm-tool-css");
var dom_document_tool = require("dom-document-tool");
var insert_adjacent_return = require("insert-adjacent-return");

//options: { modal, cb, cbThis } | modal | cb
//return the popup element
var alert = function (message, options, cb) {
	var elPopup = popup.showHtml(require("./popup-common/alert.htm"), options, cb);

	query_by_name_path(elPopup, ".message").innerHTML = message;
	query_by_name_path(elPopup, ".ok").addEventListener("click", popup.closeListener);

	return elPopup;
}

//options: { modal, cb, cbThis } | modal | cb
//return the popup element
var confirm = function (message, options, cb) {
	var elPopup = popup.showHtml(require("./popup-common/confirm.htm"), options, cb);

	query_by_name_path(elPopup, ".message").innerHTML = message;
	query_by_name_path(elPopup, ".ok").addEventListener("click", popup.closeByNameListener);
	query_by_name_path(elPopup, ".cancel").addEventListener("click", popup.closeListener);

	return elPopup;
}

//options: { modal, cb, cbThis } | modal | cb
//return the popup element
var confirmYnc = function (message, options, cb) {
	var elPopup = popup.showHtml(require("./popup-common/confirm-ync.htm"), options, cb);

	query_by_name_path(elPopup, ".message").innerHTML = message;
	query_by_name_path(elPopup, ".yes").addEventListener("click", popup.closeByNameListener);
	query_by_name_path(elPopup, ".no").addEventListener("click", popup.closeByNameListener);
	query_by_name_path(elPopup, ".cancel").addEventListener("click", popup.closeListener);

	return elPopup;
}

//----------------------------------------------------------------------------------------

var promptListener = function () {
	popup.hide(this, query_by_name_path(this.parentNode.parentNode, '.input').value);
}

//options: { modal, cb, cbThis } | modal | cb
//return the popup element
var prompt = function (message, defaultValue, options, cb) {
	var elPopup = popup.showHtml(require("./popup-common/prompt.htm"), options, cb);

	query_by_name_path(elPopup, ".message").innerHTML = message;
	query_by_name_path(elPopup, ".ok").addEventListener("click", promptListener);
	query_by_name_path(elPopup, ".cancel").addEventListener("click", popup.closeListener);

	if (defaultValue) query_by_name_path(elPopup, '.input').value = defaultValue;

	return elPopup;
}

//----------------------------------------------------------------------------------------

var selectRadioChangeListener = function () {
	if (!this.checked) return;

	var elInput = this.parentNode.parentNode;

	var oldv = elInput.getAttribute('value');
	var oldel = dom_document_tool.querySelectorByAttr(elInput, 'input', 'value', oldv);
	htm_tool_css.setEl("selected", this.parentNode, oldel && oldel.parentNode);
	elInput.setAttribute('value', this.value);
}

var selectRadioListener = function () {
	var elInput = query_by_name_path(this.parentNode.parentNode, '.input');
	//if no radio is checked, process will be stopped by error.
	popup.hide(this, elInput.querySelector('input:checked').value);
}

//options: { modal, cb, cbThis, maxHeight } | modal | cb
//return the popup element
//item: [value,text], or single string for both value and text.
var selectRadioList = function (message, itemList, defaultValue, options, cb) {
	var elPopup = popup.showHtml(require("./popup-common/select-list.htm"), options, cb);

	query_by_name_path(elPopup, ".message").innerHTML = message;
	query_by_name_path(elPopup, ".ok").addEventListener("click", selectRadioListener);
	query_by_name_path(elPopup, ".cancel").addEventListener("click", popup.closeListener);

	var elInput = query_by_name_path(elPopup, '.input');
	if (defaultValue) elInput.setAttribute("value", defaultValue);
	if (options && options.maxHeight) elInput.style["max-height"] = options.maxHeight;

	var nm = ele_id(null, "ht-select-radio-");
	var i, imax = itemList.length, v, elItem, elRadio, isSelected, sep = false;
	for (i = 0; i < imax; i++) {
		v = itemList[i];

		if (!v) continue;	//skip empty

		if (v === "-") {	//separator flag
			sep = true;
			continue;
		}

		if (!(v instanceof Array)) v = [v, v];

		elItem = insert_adjacent_return.append(elInput,
			"<label class='ht hover' style='width:100%;display:block;margin-bottom:1px;" + (sep ? "margin-top:1em;" : "") + "'></label>");
		sep = false;
		elItem.innerHTML = " " + v[1];
		isSelected = (v[0] == defaultValue);
		if (isSelected) htm_tool_css(elItem, "selected");

		elRadio = insert_adjacent_return.prepend(elItem, "<input type='radio' name='" + nm + "'></input> ");
		elRadio.value = v[0];
		if (isSelected) elRadio.checked = true;

		elRadio.addEventListener("change", selectRadioChangeListener);
	}

	return elPopup;
}

//----------------------------------------------------------------------------------------

var selectCheckboxChangeListener = function () {
	htm_tool_css(this.parentNode, this.checked ? "selected" : "", this.checked ? "" : "selected");
}

var selectCheckboxListener = function () {
	var items = query_by_name_path(this.parentNode.parentNode, '.input').querySelectorAll('input:checked');
	var i, a = [];		//return empty array if nothing selected
	for (i = 0; i < items.length; i++) {
		a[i] = items[i].value;
	};
	popup.hide(this, a);
}

//options: { modal, cb, cbThis, maxHeight } | modal | cb
//return the popup element
var selectCheckboxList = function (message, itemList, defaultValueList, options, cb) {
	var elPopup = popup.showHtml(require("./popup-common/select-list.htm"), options, cb);

	query_by_name_path(elPopup, ".message").innerHTML = message;
	query_by_name_path(elPopup, ".ok").addEventListener("click", selectCheckboxListener);
	query_by_name_path(elPopup, ".cancel").addEventListener("click", popup.closeListener);

	if (!defaultValueList || typeof defaultValueList == "string") defaultValueList = [defaultValueList];
	var elInput = query_by_name_path(elPopup, '.input');
	if (options && options.maxHeight) elInput.style["max-height"] = options.maxHeight;

	var i, imax = itemList.length, v, elItem, elCheck, isSelected, sep = false;
	for (i = 0; i < imax; i++) {
		v = itemList[i];

		if (!v) continue;	//skip empty

		if (v === "-") {	//separator flag
			sep = true;
			continue;
		}

		if (!(v instanceof Array)) v = [v, v];

		elItem = insert_adjacent_return.append(elInput,
			"<label class='ht hover' style='width:100%;display:block;margin-bottom:1px;" + (sep ? "margin-top:1em;" : "") + "'></label>");
		sep = false;
		elItem.innerHTML = " " + v[1];
		isSelected = (defaultValueList.indexOf(v[0]) >= 0);
		if (isSelected) htm_tool_css(elItem, "selected");

		elCheck = insert_adjacent_return.prepend(elItem, "<input type='checkbox'></input> ");
		elCheck.value = v[0];
		if (isSelected) elCheck.checked = true;

		elCheck.addEventListener("change", selectCheckboxChangeListener);
	}

	return elPopup;
}

//----------------------------------------------------------------------------------------

//options: { modal, cb, cbThis, maxHeight } | modal | cb
//return the popup element
var selectButtonList = function (message, itemList, options, cb) {
	var elPopup = popup.showHtml(require("./popup-common/button-list.htm"), options, cb);

	query_by_name_path(elPopup, ".message").innerHTML = message;

	var elInput = query_by_name_path(elPopup, '.input');
	if (options && options.maxHeight) elInput.style["max-height"] = options.maxHeight;

	var i, imax = itemList.length, v, elItem, sep = false;
	for (i = 0; i < imax; i++) {
		v = itemList[i];

		if (!v) continue;	//skip empty

		if (v === "-") {	//separator flag
			sep = true;
			continue;
		}

		if (!(v instanceof Array)) v = [v, v];

		elItem = insert_adjacent_return.append(elInput,
			"<button style='width:100%;display:block;margin-bottom:0.5em;" + (sep ? "margin-top:1em;" : "") + "'></button>");
		sep = false;
		elItem.innerHTML = v[1];
		elItem.setAttribute("name", v[0]);

		elItem.addEventListener("click", popup.closeByNameListener);
	}
	//add last cancel
	elItem = insert_adjacent_return.append(elInput,
		"<button style='width:100%;display:block;margin-bottom:1px;margin-top:1em;'>Cancel</button>");
	elItem.addEventListener("click", popup.closeListener);

	return elPopup;
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
