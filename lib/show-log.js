/*
log control

	example:
		
		htm_tool_ui.ui.show_log("some log message");
*/

var ele = require("element-tool");
var tmkt = require("tmkt");
var dom_document_tool = require("dom-document-tool");
var query_by_name_path = require("query-by-name-path");

var LOG_HIDE_DELAY = 5000;	//log hide delay, in ms.

var tmidLog = null;	//log timer id
var elidLog = null;	//element id

var showLog = function (s) {

	//init
	var elLog = ele(elidLog);
	if (!elLog) {
		elLog = dom_document_tool.appendBodyHtml(require("./show-log.htm"));
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

// module

module.exports = showLog;
