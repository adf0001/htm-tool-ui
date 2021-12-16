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
var MAX_LOG_LINE = 16;	//max log line

var tmidLog = null;	//log timer id
var elidLog = null;	//element id

var onTimeSpanClick = function () {
	if (!this.onclick) return;

	var repeatCount = parseInt(this.getAttribute("repeatCount"));

	var aTm = this.title.split('\n');
	this.innerHTML = aTm[aTm.length - 1] + ((repeatCount > 1) ? (" <b>(" + repeatCount + ")</b>") : "");

	this.style.color = 'green';
	this.onclick = null;
	this.className = '';
}

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
		var tms = tmkt.toString19();

		var elLast = el.lastChild;
		if (elLast && elLast.querySelector("span:nth-child(2)").textContent == s) {
			var elTm = elLast.querySelector("span");

			//repeatCount
			var repeatCount = parseInt(elTm.getAttribute("repeatCount")) + 1;
			elTm.setAttribute("repeatCount", repeatCount);

			//repeat list
			var aTm = elTm.title.split("\n");
			aTm[aTm.length] = tms;
			while (aTm.length > MAX_LOG_LINE) { aTm.shift(); }

			elTm.title = ((repeatCount > aTm.length) ? "...\n" : "") + aTm.join("\n");

			//show last
			elTm.innerHTML = (elTm.onclick ? tms.slice(-8) : tms) + " <b>(" + repeatCount + ")</b>";
		}
		else {
			elLast = dom_document_tool.appendHtml(el,
				"<div>* " +
				"<span class='ht-cmd' title='" + tms + "' repeatCount='1'>" + tms.slice(-8) + "</span> " +
				"<span></span>" +
				"</div>"
			);
			elLast.querySelector("span").onclick = onTimeSpanClick;
			elLast.querySelector("span:nth-child(2)").textContent = s;

			while (el.childNodes.length > MAX_LOG_LINE) { el.removeChild(el.firstChild); }
		}

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