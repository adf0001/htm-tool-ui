
setHtmlPage("htm-tool-ui","10em");	//html page setting

var ht= ( typeof module==="object" && module.exports ) ? require("../htm-tool-ui.js") : require( "htm-tool-ui" );

testData={		//global variable
	"tab-control": function(done){
		ht('divResult2').innerHTML=
			"<div class='ht-tab-group'>"+
				"<span class='ht-tab-item ht-tab-item-selected' id='spTab1' onclick=\"ht.selectTabItem('top','spTab1','divTab1')\">Tab1</span>"+
				"<span class='ht-tab-item' id='spTab2' onclick=\"ht.selectTabItem('top','spTab2','divTab2')\">Tab2</span>"+
			"</div>"+
			"<div id='divTab1'><b>tab1 content</b></div>"+
			"<div id='divTab2' style='display:none;'><i>tab2 content</i></div>";
		
		ht('spTab1').click();
		
		return 'ui test';
	},
	"showLog()": function(done){
		ht.showLog('some log message');
		return 'log ui';
	},
	"startDrag()": function(done){
		return "<span style='position:relative;border:1px solid gray;' id='spDrag1' "+
					"onmousedown='ht.startDrag( arguments[0], this )' ontouchstart='ht.startDrag( arguments[0], this )'>drag 1</span> "+
				"<span style='position:relative;border:1px solid gray;' id='spDrag2' "+
					"onmousedown=\"ht.startDrag( arguments[0], this )\" ontouchstart=\"ht.startDrag( arguments[0], this )\">drag 2</span> "+
				"<span style='position:relative;border:1px solid gray;' id='spDrag3' "+
					"onmousedown=\"ht.startDrag( arguments[0], this, ht('spDrag1'), ht('spDrag2') )\" "+
					"ontouchstart=\"ht.startDrag( arguments[0], this, ht('spDrag1'), ht('spDrag2') )\">drag 3</span>";
	},
	"dragObject/derive": function(done){
		myDragObject= ht.deriveObject( ht.dragObject, {
			el1:null,
			start: function ( evt, el1){
				ht.dragObject.start.apply( this, arguments );
				this.el1=el1;
				this.el1.style.background='yellow';
			},
			
			onStop: function ( evt ) {
				ht.dragObject.onStop.apply( this, arguments );
				this.el1.style.background='';
			},
			
			onFirstMove: function (evt) {
				this.el1.style.background='lime';
			},
			onMove: function (evt) {
				ht.dragObject.onMove.apply( this, arguments );
				if(this.moveChanged)this.el1.textContent=this.el1.offsetLeft+','+this.el1.offsetTop;
			},
		});
		myDragObject.init();

		return "<span style='position:relative;border:1px solid gray;' id='spDrag1' "+
					"onmousedown='myDragObject.start( arguments[0], this )' ontouchstart='myDragObject.start( arguments[0], this )'>drag 1</span> "+
				"<span style='position:relative;border:1px solid gray;' id='spDrag2' "+
					"onmousedown=\"myDragObject.start( arguments[0], this )\" ontouchstart=\"myDragObject.start( arguments[0], this )\">drag 2</span> "+
				"<span style='position:relative;border:1px solid gray;' id='spDrag3' "+
					"onmousedown=\"myDragObject.start( arguments[0], this, ht('spDrag1'), ht('spDrag2') )\" "+
					"ontouchstart=\"myDragObject.start( arguments[0], this, ht('spDrag1'), ht('spDrag2') )\">drag 3</span>";
	},
	"showPopup() & hidePopup()": function(done){
		ht('divResult2').innerHTML=
			"<div id='divPopup1' class='ht-popup' style='display:none;'>"+
				"<div class='ht-popup-body' onmousedown='ht.startDrag( arguments[0], this )' ontouchstart='ht.startDrag( arguments[0], this )'>"+
					"popup-1<hr>This is popup-1."+
				"</div>"+
			"</div>"+
			"<div id='divPopup2' class='ht-popup' style='display:none;'>"+
				"<div class='ht-popup-body' onmousedown='ht.startDrag( arguments[0], this )' ontouchstart='ht.startDrag( arguments[0], this )'>"+
					"popup-2<hr>This is popup-2, modal. <br> "+
						"<span class='ht-cmd' onclick=\"ht.showPopup('divPopup1')\">popup1</span> <br> "+
						"<span class='ht-cmd' onclick=\"ht.showPopup('divPopup2',1)\">popup2</span>, will fail <br> "+
						"<span class='ht-cmd' onclick=\"ht.showPopup('divPopup3',1)\">popup3</span>, maybe fail <br> "+
					"<center><button onclick=\"ht.hidePopup('divPopup2')\">close</button></center>"+
				"</div>"+
			"</div>"+
			"<div id='divPopup3' class='ht-popup' style='display:none;'>"+
				"<div class='ht-popup-body' onmousedown='ht.startDrag( arguments[0], this )' ontouchstart='ht.startDrag( arguments[0], this )'>"+
					"popup-3<hr>This is popup-3, stack. <br> "+
						"<span class='ht-cmd' onclick=\"ht.showPopup('divPopup1')\">popup1</span> <br> "+
						"<span class='ht-cmd' onclick=\"ht.showPopup('divPopup2')\">popup2</span>, modaless, maybe fail <br> "+
						"<span class='ht-cmd' onclick=\"ht.showPopup('divPopup3',1)\">popup3</span>, will fail <br> "+
					"<center><button onclick=\"ht.hidePopup('divPopup3','fromClose')\">close</button></center>"+
				"</div>"+
			"</div>"+
			"<button id='btnOpenPopup1' onclick=\"ht.showPopup('divPopup1')\">popup-1</button> "+
			"<button id='btnOpenPopup2' onclick=\"ht.showPopup('divPopup2',1)\">popup-2, modal</button> "+
			"<button id='btnOpenPopup3' onclick=\"ht.showPopup('divPopup3',1,function(err,data){if(err||data)alert('popup3 at btn returned: error='+err+', data='+data);})\">popup-3, stack</button> "+
			"";

		ht('btnOpenPopup1').click();
		return 'ui test';
	},
	"showPopupHtml()": function(done){
		ht('divResult2').innerHTML=
			"<label><input id='chkModaless' type='checkbox' checked></input>modal / default</label><br>"+
			"<button id='btnOpenPopup1' onclick=\"ht.showPopupHtml('title-1<hr>message-1',ht('chkModaless').checked)\">showPopupHtml()</button> "+
			"<button id='btnOpenPopup2' onclick=\"ht.alert('message-2',ht('chkModaless').checked )\">alert()</button> "+
			"<button id='btnOpenPopup3' onclick=\"ht.confirm('message-3',ht('chkModaless').checked,function(err,data){if(err||data)alert('returned: error='+err+', data='+data);})\">confirm()</button> "+
			"<button id='btnOpenPopup4' onclick=\"ht.confirmYnc('message-4',ht('chkModaless').checked,function(err,data){if(err||data)alert('returned: error='+err+', data='+data);})\">confirmYnc()</button> "+
			"<button id='btnOpenPopup5' onclick=\"ht.prompt('message-5','default-value',ht('chkModaless').checked,function(err,data){if(err||data)alert('returned: error='+err+', data='+data);})\">prompt()</button> "+
			"<button id='btnOpenPopupS' onclick=\"ht.showPopupHtml(popupHtmlStackHtml+'<br>'+(new Date()),ht('chkModaless').checked)\">showPopupHtml-stack</button> "+
			"<button id='btnOpenPopupSelect' onclick=\"ht.selectRadioList('select message 1',['aaa',['bbb','文本bbb'],'ccc'],'bbb',ht('chkModaless').checked,function(err,data){if(err||data)alert('returned: error='+err+', data='+data);})\">selectRadioList()</button> "+
			"<button id='btnOpenPopupSelect-2' onclick=\"ht.selectRadioList('select message 1',['aaa',['bbb','文本bbb'],'ccc'],'',ht('chkModaless').checked,function(err,data){if(err||data)alert('returned: error='+err+', data='+data);})\" title='if select void, exception raise and stop the process'>selectRadioList()-2/void</button> "+
			"<button id='btnOpenPopupSelect2' onclick=\"ht.selectCheckboxList('select message 2',['aaa',['bbb','文本bbb'],'ccc'],['bbb','ccc'],ht('chkModaless').checked,function(err,data){if(err||data)alert('returned: error='+err+', data='+data);})\">selectCheckboxList()</button> "+
			"<button id='btnOpenPopupSelect2-2' onclick=\"ht.selectCheckboxList('select message 2',['aaa',['bbb','文本bbb'],'ccc'],null,ht('chkModaless').checked,function(err,data){if(err||data)alert('returned: error='+err+', data='+data);})\" title='if select void, return empty list'>selectCheckboxList()-2/void</button> "+
			"<button id='btnOpenPopupSelect2-3' onclick=\"ht.selectCheckboxList('select message 2',['aaa',['bbb','文本bbb 文本bbb 文本bbb 文本bbb 文本bbb 文本bbb 文本bbb 文本bbb 文本bbb 文本bbb '],'ccc','ccc2','ccc3','ccc4','ccc5','ccc6','ccc7','ccc8','ccc9','ccc10','ccc11','ccc12','ccc13','ccc14'],['bbb','ccc'],ht('chkModaless').checked,function(err,data){if(err||data)alert('returned: error='+err+', data='+data);})\">selectCheckboxList()-3</button> "+
			"";

		window.popupHtmlStackHtml= "title-S<hr>message-S <span class='ht-cmd' onclick='openPopupHtmlStack()'>open another</span>";

		window.openPopupHtmlStack= function(){ht('btnOpenPopupS').click();};

		return 'ui test';
	},
	
	
	/*
	//code template
	"": function(done){
		return 

	},
	*/
};
