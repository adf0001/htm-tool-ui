
/*
	htm-tool ui module.
	
	example:

		var ht= require( "htm-tool-ui" );
		ht.showLog('my message');
*/

"use strict";


var ht= require( "htm-tool" );

var globalVarRef="window[\'"+ht.globalVarName+"\']";

/*
//////////////////////////////////////////////////////////////////////////////////////////
// tab control

	example:

		<div class='ht-tab-group'>
			<span class='ht-tab-item ht-tab-item-selected' id='spTab1' onclick="htm_tool.selectTabItem('top','spTab1','divTab1')">Tab1</span>
			<span class='ht-tab-item' id='spTab2' onclick="htm_tool.selectTabItem('top','spTab2','divTab2')">Tab2</span>
		</div>
		<div id='divTab1'><b>tab1 content</b></div>
		<div id='divTab2' style='display:none;'><i>tab2 content</i></div>

		//init tab state
		htm_tool('spTab1').click();
*/

var tabGroup= null;	//map group name to [idTab,idPanel]

var selectTabItem= function ( group, idTab, idPanel ){
	
	//init
	if( ! tabGroup ){
		tabGroup={};
		
		ht.addCssText(
			".ht-tab-group{"+
				"border-bottom:1px solid black;"+
				"margin-bottom:0.5em;"+
			"}"+
			".ht-tab-item{"+
				"display:inline-block;"+
				"padding:0.2em 0.5em;"+
				"margin-left:0.5em;"+
				"position:relative;"+
				"left:0px;"+
				"top:0px;"+
				"background:#eee;"+
				"cursor:pointer;"+
				"border-left:1px solid #eee;"+
				"border-top:0px solid #eee;"+
				"border-right:1px solid #eee;"+
			"}"+
			".ht-tab-item-selected{"+
				"background:white;"+
				"top:1px;"+
				"cursor:default;"+
				"border-left:1px solid black;"+
				"border-top:1px solid black;"+
				"border-right:1px solid black;"+
			"}"
		);
	}
	
	//----------------------------------------------------------------------------------------
	
	var lastTabItem= tabGroup[group];
	if( !lastTabItem ){
		lastTabItem= tabGroup[group]= ["",""];
	}
	
	if( lastTabItem[0]==idTab && lastTabItem[1]==idPanel ) return;
	
	//hide last
	if( lastTabItem[0] ){
		ht(lastTabItem[0]).classList.remove("ht-tab-item-selected");
	}
	if( lastTabItem[1] ){
		ht(lastTabItem[1]).style.display="none";
	}
	
	//show selected
	ht(idTab).classList.add("ht-tab-item-selected");
	if( idPanel ) ht(idPanel).style.display="";
	
	lastTabItem[0]= idTab;
	lastTabItem[1]= idPanel;
}

/*
//////////////////////////////////////////////////////////////////////////////////////////
// log control

	example:
		
		htm_tool.showLog("some log message");
*/

var tmidLog= null;	//log timer id
var elidLog= null;	//element id

var showLog= function( s ){
	
	//init
	var elLog= ht(elidLog);
	if( ! elLog ){
		elLog= ht.appendBodyHtml(
			"<div style='position:fixed;right:0.5em;bottom:0.5em;width:auto;height:auto;max-width:500px;background:white;border:1px solid gray;font-size:9pt;padding:0.5em;cursor:default;' onclick=\""+globalVarRef+".showLog();\">"+
				"<span name='close' class='ht-cmd' style='float:right;text-decoration:none;padding:0em 0.3em;' onclick=\"setTimeout( function(){ "+globalVarRef+".showLog(false);}, 0 );\" title='关闭'>&times;</span>"+
				"<span name='minimize' class='ht-cmd' style='display:none;float:right;text-decoration:none;padding:0em 0.3em;' onclick=\"setTimeout( function(){ "+globalVarRef+".showLog(null);}, 0 );\" title='最小化'>&minus;</span>"+
				"<b>日志</b>"+
				"<div name='content' style='display:none;'></div>"+
			"</div>"
		);
		elidLog= ht.eleId(elLog);
	}
	
	//----------------------------------------------------------------------------------------
	
	var el= ht.queryByName(elLog,'content');
	var elMinimize= ht.queryByName(elLog,'minimize');
	var elClose= ht.queryByName(elLog,'close');
	
	elLog.style.display="";
	
	if( s ){
		while(el.childNodes.length>=10){
			el.removeChild(el.firstChild);
		}
		
		var tms= dateString19();
		el.innerHTML+="<div>* <span class='ht-cmd' onclick=\"this.textContent=this.title;this.style.color='green';this.onclick=this.className=this.title='';\" title='"+tms+"'>" + tms.slice(-8) + "</span> " + s + "</div>";
		el.style.display= elMinimize.style.display= elClose.style.display= "";
	}
	else{
		if( s===null || s===false ){ el.style.display= elMinimize.style.display= elClose.style.display= "none"; if(s===false) elLog.style.display= "none"; }
		else if( el.style.display=="none" && el.childNodes.length>0 ){ el.style.display= elMinimize.style.display= elClose.style.display= ""; }
	}
	
	if( el.style.display!="none" ){
		if( tmidLog ) { clearTimeout(tmidLog); tmidLog=null; }
		tmidLog=setTimeout( function(){ el.style.display= elMinimize.style.display= elClose.style.display= "none"; tmidLog= null; }, 5000 );
	}
}

/*
//////////////////////////////////////////////////////////////////////////////////////////
// drag tool, support mouse and multiple touches.

	example:
		
		<div onmousedown="htm_tool.startDrag( arguments[0], this )" ontouchstart="htm_tool.startDrag( arguments[0], this )">...</div>
*/

var dragObject= {
	
	dragSet: null,	//map drag start-key to drag start item; drag item: {itemArray,pageX0,pageY0,from,elStart,key}
	dragSetCount: 0,
	
	moveChanged: false,		//move changed flag
	
	init: function(){		//manually called constructor
		this.dragSet= {};
		this.dragSetCount= 0;
		this._onMove= this._onStop= this._onKey= null;		//clear binding from prototype
		
		//this.startDrag= this.start.bind(this);		//binding function for start()		//not usually, cancelled.
	},
	
	//start: function ( evt, el1, el2, ..., elN )
	start: function ( evt, el1) {
		if (arguments.length < 2) return false;
		if( !evt ) evt= window.event;
		
		//check if target is an input
		if( evt.target.tagName.match( /^(input|button|textarea|select|option.*|a|label)$/i ) ||
			evt.target.classList.contains("ht-input") || evt.target.classList.contains("ht-cmd") ){ return false; }
		
		//unify event and drag-data
		var dragEvt, dragItem, evtKey;
		if( evt.type=="mousedown" ){
			dragEvt= evt;
			dragItem= { from:"mouse", elStart: evt.target, key:"mouse", };
			
			if ("mouse" in this.dragSet) this.onStop({type:"mouseup"});
		}
		else if( evt.type=="touchstart" ){
			dragEvt= evt.targetTouches[0];	//only the 1st
			evtKey= "touch-"+dragEvt.identifier;
			dragItem= { from:"touch", elStart: evt.target, key: evtKey, };
			
			if ( evtKey in this.dragSet) this.onStop({type:"touchend",changedTouches:[{identifier:dragEvt.identifier}]});
		}
		else{ return false; }	//unknown event
		
		//init drag-data
		dragItem.pageX0 = dragEvt.pageX;
		dragItem.pageY0 = dragEvt.pageY;
		
		dragItem.itemArray = [];
		var i, imax = arguments.length, el;
		for (i = 1; i < imax; i++) {
			el = arguments[i];
			dragItem.itemArray.push([el, parseInt(el.style.left)||0, parseInt(el.style.top)||0]);
		}
		
		this.dragSet[dragItem.key]= dragItem;
		this.dragSetCount++;

		if( this.dragSetCount===1 ){
			//global listener
			document.addEventListener("mousemove", this._onMove || (this._onMove=this.onMove.bind(this)), false);
			document.addEventListener("mouseup", this._onStop || (this._onStop=this.onStop.bind(this)), false);
			document.addEventListener("keyup", this._onKey || (this._onKey=this.onKey.bind(this)), false);
			document.addEventListener('touchmove',this._onMove,{passive:false});
			document.addEventListener('touchend',this._onStop,false);
		}
		
		this.moveChanged=false;
	},
	
	//return pairs array of [ evt1, dragItem1, evt2, dragItem2, ... ]
	getEventList: function( evt ){
		var list=[];
		var keyType= evt.type.slice(0,5);
		
		if( keyType=="mouse" ){
			list.push( evt, this.dragSet["mouse"] );
		}
		else if( keyType=="touch" ){
			var touchList= (evt.type=="touchend") ? evt.changedTouches : evt.targetTouches;
			var i,imax= touchList.length,k;
			for(i=0;i<imax;i++){
				k= "touch-" + touchList[i].identifier;
				if(k in this.dragSet) list.push( touchList[i], this.dragSet[k] );
			}
		}
		else{ return null; }	//unknown event
		
		return (list.length>0)?list:null;
	},
	
	onStop: function ( evt ) {
		//reset all
		if( evt===false ){
			for( var i in this.dragSet ){
				var dragItem= this.dragSet[i];
				var j,jmax=dragItem.itemArray.length,ai;
				for(j=0;j<jmax;j++){
					ai = dragItem.itemArray[j];
					ai[0].style.left = ai[1] + "px";
					ai[0].style.top = ai[2] + "px";
				}
			}
		}
		
		if( evt ){
			var list= this.getEventList( evt );
			if( !list ) return false;
			
			var i,imax= list.length,dragItem;
			for(i=0;i<imax;i+=2){
				dragItem= list[i+1];
				if( dragItem.key in this.dragSet ){
					delete this.dragSet[dragItem.key];
					this.dragSetCount--;
				}
			}
		}
		else{
			//stop all
			this.dragSet={};
			this.dragSetCount=0;
		}
		
		if( this.dragSetCount<1 ){
			//remove global listener
			//console.log("release drag listener");
			document.removeEventListener("mousemove", this._onMove, false);
			document.removeEventListener("mouseup", this._onStop, false);
			document.removeEventListener("keyup", this._onKey, false);
			document.removeEventListener('touchmove',this._onMove,{passive:false});
			document.removeEventListener('touchend',this._onStop,false);
		}
		
		if( this.dragSetCount<0 ){
			console.error("dragSetCount abnormal, "+ this.dragSetCount);
			this.onStop(false);	//stop all
			this.dragSetCount=0;
		}
	},
	
	onFirstMove: null,	//function (evt) {},
	
	onMove: function (evt) {
		var list= this.getEventList( evt );
		if( !list ) return false;
		
		var i,imax= list.length,dragItem,changed;
		for(i=0;i<imax;i+=2){
			dragItem= list[i+1];
			
			var dx = list[i].pageX - dragItem.pageX0;
			var dy = list[i].pageY - dragItem.pageY0;
			if( dx||dy) changed=1;
			
			var j, jmax = dragItem.itemArray.length, ai;
			for (j = 0; j < jmax; j++) {
				ai = dragItem.itemArray[j];
				ai[0].style.left = (ai[1] + dx) + "px";
				ai[0].style.top = (ai[2] + dy) + "px";
			}
		}
		
		if( evt.type=="touchmove" ){ evt.preventDefault(); }
		
		//console.log("move "+ list[0].pageX +","+ list[0].pageY );
		
		if( !this.moveChanged && changed ){
			this.moveChanged= true;
			if( this.onFirstMove ) this.onFirstMove(evt);
		}
		
	},
	
	onKey: function (evt) {
		var keyCode= evt.keyCode||evt.which||evt.charCode;
		
		if (keyCode==27){ this.onStop( false ); }		//ESC to reset
		else{ this.onStop(); }		//others to stop
	},
	
};

dragObject.init();

/*
//////////////////////////////////////////////////////////////////////////////////////////
// popup panel tool

	example:
		<div id='divPopup1' class='ht-popup' style='display:none;'>
			<div class='ht-popup-body' onmousedown='htm_tool.startDrag( arguments[0], this )' ontouchstart='htm_tool.startDrag( arguments[0], this )'>
				popup-1<hr>This is popup-1.
			</div>
		</div>
		
		htm_tool.showPopup('divPopup1');
*/

var popupStack= null;	//item: [el, cb ]

var showPopup= function( el, modal, cb ){
	
	//init
	if( ! popupStack ) {
		popupStack= [];
		
		ht.addCssText(
			".ht-popup{"+
				"position:fixed;"+
				"left:0px;"+
				"top:0px;"+
				"right:0px;"+
				"bottom:0px;"+
				"text-align:center;"+
			"}"+
			".ht-popup-back{"+
				"position:absolute;"+
				"left:0px;"+
				"top:0px;"+
				"right:0px;"+
				"bottom:0px;"+
				"background:#eee;"+
				"opacity:0.5;"+
			"}"+
			".ht-popup-body{"+
				"display:inline-block;"+
				"position:relative;"+
				"margin-top:10%;"+
				"background:white;"+
				"border:1px solid gray;"+
				"border-radius:1em;"+
				"padding:0.5em;"+
				"box-shadow:0 0 30px gray;"+
				"text-align:left;"+
			"}"+
			".ht-popup-modal{"+
				"border-radius:0px;"+
			"}"
		);

	}
	
	//----------------------------------------------------------------------------------------
	
	el= ele(el);
	
	//check closed
	while( popupStack.length>0 ){
		if( popupStack[popupStack.length-1][0].style.display=="none") popupStack.pop();
		else break;
	}
	
	//don't re-open
	var i,imax=popupStack.length;
	for(i=0;i<imax;i++) {
		if( popupStack[i][0]===el ) {
			console.error("fail to re-open popup, " + (el.id||""));
			return;
		}
	}
	
	//check body
	var elBody= el.querySelector(".ht-popup-body");
	if( ! elBody ){
		console.error("popup-body unfound, " + (el.id||""));
		return;
	}
	
	//add back
	if( ! el.querySelector(".ht-popup-back") ){
		ht.prependHtml( el, "<div class='ht-popup-back' onclick=\"if(!this.parentNode.querySelector('.ht-popup-body').classList.contains('ht-popup-modal'))"+globalVarRef+".hidePopup(this);\"></div>" );
	}
	
	//add close button
	var elClose= elBody.querySelector("span[name='ht-popup-close']");
	if( !elClose ){
		elClose= ht.prependHtml( elBody, "<span name='ht-popup-close' style='float:right;text-decoration:none;padding:0em 0.3em;' class='ht-cmd' onclick=\""+globalVarRef+".hidePopup(this);\" title='关闭'>x</span>" );
	}
	
	//modal setting
	if( modal ){
		elBody.classList.add("ht-popup-modal");
		elClose.innerHTML="[&times;]";
	}
	else{
		elBody.classList.remove("ht-popup-modal");
		elClose.innerHTML="(&times;)";
	}
	
	el.style.display="";
	
	el.style.zIndex= 10+ popupStack.length;
	
	popupStack.push([el,cb]);
}

var hidePopup= function( el, data ){
	el= ele(el);
	
	//find .ht-popup
	while( el && ! el.classList.contains("ht-popup") ) { el=el.parentNode; }
	if( !el ){
		console.error( "top ht-popup unfound" );
		return;
	}
	
	var i,psi;
	for(i= popupStack.length-1; i>=0;i-- ){
		psi= popupStack[i];
		if( el===psi[0] ){
			el.style.display="none";
			popupStack.pop();
			if( psi[1] ) psi[1](null, data);
			return;
		}
		
		if( psi[0].style.display=="none"){
			popupStack.pop();
			continue;
		}
		
		break;	//fail
	}
	
	if( !popupStack.length ) return;
	
	//abnormal popup, close all.
	console.error( "abnormal popup, close all." );
	while( popupStack.length>0 ){
		popupStack.pop()[0].style.display="none";
	}
}

var POPUP_HTML_COUNT_MAX= 10;

var showPopupHtml= function( bodyHtml, modal, cb ){
	
	//find empty html
	var i,nm,el;
	for(i=1;i<=POPUP_HTML_COUNT_MAX;i++){
		nm= "ht-popup-html-" + i;
		el= ht(nm);
		if( !el ) break;
		if( el.style.display=="none" ) break;
	}
	
	if(i>POPUP_HTML_COUNT_MAX ) {
		console.error( "popup-html stack overflow, max " + POPUP_HTML_COUNT_MAX );
		return;
	}
	
	//init
	if( ! ht(nm) ){
		ht.appendBodyHtml(
			"<div id='"+nm+"' class='ht-popup' style='display:none;'>"+
				"<div class='ht-popup-body' onmousedown=\""+globalVarRef+".startDrag( arguments[0], this )\" ontouchstart=\""+globalVarRef+".startDrag( arguments[0], this )\"></div>"+
			"</div>"
		);
	}
	var elBody= ht(nm).querySelector(".ht-popup-body");
	elBody.innerHTML= bodyHtml;
	
	showPopup( nm, (typeof modal==="undefined")?1:modal, cb );
}

var alert= function( message, modal, cb ){
	showPopupHtml( "<div style='min-width:200px;'>"+message+"</div><br><span style='float:right'><button onclick=\""+globalVarRef+".hidePopup(this)\">确定</button></span>",modal, cb );
}
var confirm= function( message, modal, cb ){
	showPopupHtml( "<div style='min-width:200px;'>"+message+"</div><br><span style='float:right'><button onclick=\""+globalVarRef+".hidePopup(this,'ok')\">确定</button> <button onclick=\""+globalVarRef+".hidePopup(this)\">取消</button></span>",modal, cb );
}
var confirmYnc= function( message, modal, cb ){
	showPopupHtml( "<div style='min-width:200px;'>"+message+"</div><br><span style='float:right'><button onclick=\""+globalVarRef+".hidePopup(this,'yes')\">是</button> <button onclick=\""+globalVarRef+".hidePopup(this,'no')\">否</button> <button onclick=\""+globalVarRef+".hidePopup(this)\">取消</button></span>",modal, cb );
}
var prompt= function( message, defaultValue, modal, cb ){
	showPopupHtml( "<div style='min-width:200px;'>"+message+"<br><input type='text' style='width:100%;'></input></div><br><span style='float:right'><button onclick=\""+globalVarRef+".hidePopup(this,this.parentNode.parentNode.querySelector('input').value);\">确定</button> <button onclick=\""+globalVarRef+".hidePopup(this)\">取消</button></span>",modal, cb );
	if(defaultValue) popupStack[popupStack.length-1][0].querySelector('input').value= defaultValue;
}
var selectRadioList= function( message, itemList, defaultValue, modal, cb ){
	//var nm= "ht-select-radio="+(++seed);
	var nm= ht.eleId(null,"ht-select-radio-");
	showPopupHtml( "<div style='min-width:200px;'>"+message+"<div class='ht-input' value='' style='border:1px solid #ccc;padding:0.2em;max-height:10em;overflow:auto;max-width:500px;'>"+itemList.map(function(v){if(!(v instanceof Array))v=[v,v]; return "<label class='ht-hover"+((v[0]===defaultValue)?" ht-selected":"")+"' style='width:100%;display:block;margin-bottom:1px;'><input type='radio' name='"+nm+"' value='"+v[0]+"'"+((v[0]===defaultValue)?" checked":"")+" onchange=\"if(!this.checked)return; var oldv= this.parentNode.parentNode.getAttribute('value'); var oldel="+globalVarRef+".querySelectorByAttr(this.parentNode.parentNode,'input','value',oldv); "+globalVarRef+".setSelected(this.parentNode,oldel && oldel.parentNode,true);this.parentNode.parentNode.setAttribute('value',this.value)\"></input> "+v[1]+"</label>";}).join("")+"</div></div><br><span style='float:right'><button onclick=\""+globalVarRef+".hidePopup(this,this.parentNode.parentNode.querySelector('input:checked').value);\">确定</button> <button onclick=\""+globalVarRef+".hidePopup(this)\">取消</button></span>",modal, cb );
	if(defaultValue) popupStack[popupStack.length-1][0].querySelector('div.ht-input').setAttribute("value", defaultValue);
}
var selectCheckboxList= function( message, itemList, defaultValueList, modal, cb ){
	if( ! defaultValueList || typeof defaultValueList=="string" ) defaultValueList=[defaultValueList];
	showPopupHtml( "<div style='min-width:200px;'>"+message+"<div class='ht-input' style='border:1px solid #ccc;padding:0.2em;max-height:10em;overflow:auto;max-width:500px;'>"+itemList.map(function(v){if(!(v instanceof Array))v=[v,v]; return "<label class='ht-hover"+((defaultValueList.indexOf(v[0])>=0)?" ht-selected":"")+"' style='width:100%;display:block;margin-bottom:1px;'><input type='checkbox' value='"+v[0]+"'"+((defaultValueList.indexOf(v[0])>=0)?" checked":"")+" onchange=\""+globalVarRef+".setSelected(this.parentNode,null,this.checked)\"></input> "+v[1]+"</label>";}).join("")+"</div></div><br><span style='float:right'><button onclick=\"var items=this.parentNode.parentNode.querySelectorAll('input:checked');var a=[];for(i=0;i<items.length;i++){a[i]=items[i].value;};"+globalVarRef+".hidePopup(this,a);\">确定</button> <button onclick=\""+globalVarRef+".hidePopup(this)\">取消</button></span>",modal, cb );
}

//////////////////////////////////////////////////////////////////////////////////////////
// export module

module.exports= Object.assign(
	ht,
	{
		//ui
		selectTabItem: selectTabItem,
		showLog: showLog,
		startDrag: dragObject.start.bind(dragObject),
		
		//ui object
		dragObject: dragObject,
		
		//popup
		showPopup: showPopup,
		hidePopup: hidePopup,
		showPopupHtml: showPopupHtml,
		alert: alert,
		confirm: confirm,
		confirmYnc: confirmYnc,
		prompt: prompt,
		selectRadioList: selectRadioList,
		selectCheckboxList: selectCheckboxList,
		
	}
);

