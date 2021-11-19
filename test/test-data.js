
// global, for html page
htm_tool_ui = require("../htm-tool-ui.js");
ele = require("element-tool");
deriveObject = require("./create-assign.js");

module.exports = {

	"tab-control": function (done) {
		ele('divResult2').innerHTML =
			"<div class='ht-tab-group'>" +
			"	<span class='ht-tab-item ht-tab-item-selected' id='spTab1'>Tab1</span>" +
			"	<span class='ht-tab-item' id='spTab2'>Tab2</span>" +
			"</div>" +
			"<div id='divTab1'><b>tab1 content</b></div>" +
			"<div id='divTab2' style='display:none;'><i>tab2 content</i></div>" +
			"<button onclick=\"alert(htm_tool_ui.getLastTabId('spTab1'))\">get</button>" +
			"<button onclick=\"alert(htm_tool_ui.getLastTabId('spTab2'))\">get2</button>" +
			"";

		var groupId = htm_tool_ui.initTabControl({ 'spTab1': 'divTab1', 'spTab2': 'divTab2' }, 'spTab1');

		return 'ui test, groupId=' + groupId;
	},
	"radio-group": function (done) {
		ele('divResult2').innerHTML =
			"<label id='group1'><input type='radio' checked value='a'></input>aaa</label><br>" +
			"<span id='group2'>" +
			"	<label><input type='radio' value='b'></input>bbb</label><br>" +
			"	<label><input type='radio' disabled value='c'></input>ccc</label><br>" +
			"	<label><input type='radio' value='d'></input>ddd</label><br>" +
			"</span>" +
			"<button onclick=\"alert(htm_tool_ui.getRadioGroupValue('group1'))\">get</button>" +
			"<button onclick=\"alert(htm_tool_ui.getRadioGroupValue('group2'))\">get2</button>" +
			"";

		var groupId = htm_tool_ui.initRadioGroup(['group1', 'group2'], 'b');

		return 'ui test, groupId=' + groupId;
	},
	"showLog()": function (done) {
		htm_tool_ui.showLog('some log message');
		return 'log ui';
	},
	"startDrag()": function (done) {
		return "<span style='position:relative;border:1px solid gray;' id='spDrag1' " +
			"onmousedown='htm_tool_ui.startDrag( arguments[0], this )' ontouchstart='htm_tool_ui.startDrag( arguments[0], this )'>drag 1</span> " +
			"<span style='position:relative;border:1px solid gray;' id='spDrag2' " +
			"onmousedown=\"htm_tool_ui.startDrag( arguments[0], this )\" ontouchstart=\"htm_tool_ui.startDrag( arguments[0], this )\">drag 2</span> " +
			"<span style='position:relative;border:1px solid gray;' id='spDrag3' " +
			"onmousedown=\"htm_tool_ui.startDrag( arguments[0], this, 'spDrag1', 'spDrag2' )\" " +
			"ontouchstart=\"htm_tool_ui.startDrag( arguments[0], this, 'spDrag1', 'spDrag2' )\">drag 3</span>";
	},
	"dragObject/derive": function (done) {
		myDragObject = deriveObject(htm_tool_ui.dragObject, {
			el1: null,
			start: function (evt, el1) {
				htm_tool_ui.dragObject.start.apply(this, arguments);
				this.el1 = el1;
				this.el1.style.background = 'yellow';
			},

			onStop: function (evt) {
				htm_tool_ui.dragObject.onStop.apply(this, arguments);
				this.el1.style.background = '';
			},

			onFirstMove: function (evt) {
				this.el1.style.background = 'lime';
			},
			onMove: function (evt) {
				htm_tool_ui.dragObject.onMove.apply(this, arguments);
				if (this.moveChanged) this.el1.textContent = this.el1.offsetLeft + ',' + this.el1.offsetTop;
			},
		});
		myDragObject.init();

		return "<span style='position:relative;border:1px solid gray;' id='spDrag1' " +
			"onmousedown='myDragObject.start( arguments[0], this )' ontouchstart='myDragObject.start( arguments[0], this )'>drag 1</span> " +
			"<span style='position:relative;border:1px solid gray;' id='spDrag2' " +
			"onmousedown=\"myDragObject.start( arguments[0], this )\" ontouchstart=\"myDragObject.start( arguments[0], this )\">drag 2</span> " +
			"<span style='position:relative;border:1px solid gray;' id='spDrag3' " +
			"onmousedown=\"myDragObject.start( arguments[0], this, 'spDrag1', 'spDrag2' )\" " +
			"ontouchstart=\"myDragObject.start( arguments[0], this, 'spDrag1', 'spDrag2' )\">drag 3</span>";
	},
	"showPopup() & hidePopup()": function (done) {
		ele('divResult2').innerHTML =
			"<div id='divPopup1' class='ht-popup' style='display:none;'>" +
			"<div class='ht-popup-body' onmousedown='htm_tool_ui.startDrag( arguments[0], this )' ontouchstart='htm_tool_ui.startDrag( arguments[0], this )'>" +
			"popup-1<hr>This is popup-1." +
			"</div>" +
			"</div>" +
			"<div id='divPopup2' class='ht-popup' style='display:none;'>" +
			"<div class='ht-popup-body' onmousedown='htm_tool_ui.startDrag( arguments[0], this )' ontouchstart='htm_tool_ui.startDrag( arguments[0], this )'>" +
			"popup-2<hr>This is popup-2, modal. <br> " +
			"<span class='ht-cmd' onclick=\"htm_tool_ui.showPopup('divPopup1')\">popup1</span> <br> " +
			"<span class='ht-cmd' onclick=\"htm_tool_ui.showPopup('divPopup2',1)\">popup2</span>, will fail <br> " +
			"<span class='ht-cmd' onclick=\"htm_tool_ui.showPopup('divPopup3',1)\">popup3</span>, maybe fail <br> " +
			"<center><button onclick=\"htm_tool_ui.hidePopup('divPopup2')\">close</button></center>" +
			"</div>" +
			"</div>" +
			"<div id='divPopup3' class='ht-popup' style='display:none;'>" +
			"<div class='ht-popup-body' onmousedown='htm_tool_ui.startDrag( arguments[0], this )' ontouchstart='htm_tool_ui.startDrag( arguments[0], this )'>" +
			"popup-3<hr>This is popup-3, stack. <br> " +
			"<span class='ht-cmd' onclick=\"htm_tool_ui.showPopup('divPopup1')\">popup1</span> <br> " +
			"<span class='ht-cmd' onclick=\"htm_tool_ui.showPopup('divPopup2')\">popup2</span>, modaless, maybe fail <br> " +
			"<span class='ht-cmd' onclick=\"htm_tool_ui.showPopup('divPopup3',1)\">popup3</span>, will fail <br> " +
			"<center><button onclick=\"htm_tool_ui.hidePopup('divPopup3','fromClose')\">close</button></center>" +
			"</div>" +
			"</div>" +
			"<button id='btnOpenPopup1' onclick=\"htm_tool_ui.showPopup('divPopup1')\">popup-1</button> " +
			"<button id='btnOpenPopup2' onclick=\"htm_tool_ui.showPopup('divPopup2',1)\">popup-2, modal</button> " +
			"<button id='btnOpenPopup3' onclick=\"htm_tool_ui.showPopup('divPopup3',1,function(err,data){if(err||data)alert('popup3 at btn returned: error='+err+', data='+data);})\">popup-3, stack</button> " +
			"";

		ele('btnOpenPopup1').click();
		return 'ui test';
	},
	"showPopupHtml()": function (done) {
		ele('divResult2').innerHTML =
			"<label><input id='chkModaless' type='checkbox' checked></input>modal / default</label><br>" +
			"<button id='btnOpenPopup1' onclick=\"htm_tool_ui.showPopupHtml('title-1<hr>message-1',ele('chkModaless').checked)\">showPopupHtml()</button> " +
			"<button id='btnOpenPopup2' onclick=\"htm_tool_ui.alert('message-2, <span name=ok>ok test</span>',ele('chkModaless').checked )\">alert()</button> " +
			"<button id='btnOpenPopup3' onclick=\"htm_tool_ui.confirm('message-3',ele('chkModaless').checked,function(err,data){if(err||data)alert('returned: error='+err+', data='+data);})\">confirm()</button> " +
			"<button id='btnOpenPopup4' onclick=\"htm_tool_ui.confirmYnc('message-4',ele('chkModaless').checked,function(err,data){if(err||data)alert('returned: error='+err+', data='+data);})\">confirmYnc()</button> " +
			"<button id='btnOpenPopup5' onclick=\"htm_tool_ui.prompt('message-5','default-value',ele('chkModaless').checked,function(err,data){if(err||data)alert('returned: error='+err+', data='+data);})\">prompt()</button> " +
			"<button id='btnOpenPopupS' onclick=\"htm_tool_ui.showPopupHtml(popupHtmlStackHtml+'<br>'+(new Date()),ele('chkModaless').checked)\">showPopupHtml-stack</button> " +
			"<button id='btnOpenPopupSelect' onclick=\"htm_tool_ui.selectRadioList('select message 1',['aaa',['bbb','文本bbb'],'ccc'],'bbb',ele('chkModaless').checked,function(err,data){if(err||data)alert('returned: error='+err+', data='+data);})\">selectRadioList()</button> " +
			"<button id='btnOpenPopupSelect-2' onclick=\"htm_tool_ui.selectRadioList('select message 1',['aaa',['bbb','文本bbb'],'ccc'],'',ele('chkModaless').checked,function(err,data){if(err||data)alert('returned: error='+err+', data='+data);})\" title='if select void, exception raise and stop the process'>selectRadioList()-2/void</button> " +
			"<button id='btnOpenPopupSelect2' onclick=\"htm_tool_ui.selectCheckboxList('select message 2',['aaa',['bbb','文本bbb'],'ccc'],['bbb','ccc'],ele('chkModaless').checked,function(err,data){if(err||data)alert('returned: error='+err+', data='+data);})\">selectCheckboxList()</button> " +
			"<button id='btnOpenPopupSelect2-2' onclick=\"htm_tool_ui.selectCheckboxList('select message 2',['aaa',['bbb','文本bbb'],'ccc'],null,ele('chkModaless').checked,function(err,data){if(err||data)alert('returned: error='+err+', data='+data);})\" title='if select void, return empty list'>selectCheckboxList()-2/void</button> " +
			"<button id='btnOpenPopupSelect2-3' onclick=\"htm_tool_ui.selectCheckboxList('select message 2',['aaa',['bbb','文本bbb 文本bbb 文本bbb 文本bbb 文本bbb 文本bbb 文本bbb 文本bbb 文本bbb 文本bbb '],'ccc','ccc2','ccc3','ccc4','ccc5','ccc6','ccc7','ccc8','ccc9','ccc10','ccc11','ccc12','ccc13','ccc14'],['bbb','ccc'],ele('chkModaless').checked,function(err,data){if(err||data)alert('returned: error='+err+', data='+data);})\">selectCheckboxList()-3</button> " +
			"<button id='btnOpenPopupSelect2-4' onclick=\"htm_tool_ui.selectButtonList('select message 3',['aaa',['bbb','文本bbb'],'ccc'],ele('chkModaless').checked,function(err,data){if(err||data)alert('returned: error='+err+', data='+data);})\">selectButtonList()</button> " +
			"<button id='btnOpenPopupSelect2-5' onclick=\"htm_tool_ui.selectButtonList('select message 2',['aaa',['bbb','文本bbb 文本bbb 文本bbb 文本bbb 文本bbb 文本bbb 文本bbb 文本bbb 文本bbb 文本bbb '],'ccc','ccc2','ccc3','ccc4','ccc5','ccc6','ccc7','ccc8','ccc9','ccc10','ccc11','ccc12','ccc13','ccc14'],ele('chkModaless').checked,function(err,data){if(err||data)alert('returned: error='+err+', data='+data);})\">selectButtonList()-2</button> " +
			"";

		window.popupHtmlStackHtml = "title-S<hr>message-S <span class='ht-cmd' onclick='openPopupHtmlStack()'>open another</span>";

		window.openPopupHtmlStack = function () { ele('btnOpenPopupS').click(); };

		return 'ui test';
	},

};

// for html page
//if (typeof setHtmlPage === "function") setHtmlPage("title", "10em", 1);	//page setting
if (typeof showResult !== "function") showResult = function (text) { console.log(text); }

//for mocha
if (typeof describe === "function") describe('mocha-test', function () { for (var i in module.exports) { it(i, module.exports[i]); } });
