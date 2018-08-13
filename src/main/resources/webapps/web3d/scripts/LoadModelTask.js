// LoadModel.js
var _viewer = null;     // the viewer
var _savedGlobalCamera = null;
var _loadedDocument = null;

var _curUnitId="";
var _isWholeModel = false;
var _curUnitId = "";
var _curMajor = "";


// initialize the viewer into the HTML placeholder
function initializeViewer() {
    
    if (_viewer !== null) {
        //_viewer.uninitialize();
        _viewer.finish();
        _viewer = null;
        _savedGlobalCamera = null;
        _savedViewerStates = [];
    }

    var viewerElement = document.getElementById("viewer");  // placeholder in HTML to stick the viewer
    _viewer = new Autodesk.Viewing.Private.GuiViewer3D(viewerElement, {});
   //_viewer =new Autodesk.Viewing.Private.GuiViewer3D ($("#viewer") [0], {}) ; // With toolbar
   
    var retCode = _viewer.initialize();
    if (retCode !== 0) {
        alert("ERROR: Couldn't initialize viewer!");
        console.log("ERROR Code: " + retCode);      // TBD: do real error handling here
    }
    _viewer.loadExtension('Autodesk.ADN.Viewing.Extension.SampleTask');   //显示属性页 !!!!!!
}


// load a specific document into the intialized viewer
function loadDocument(urnStr) {
    
    _loadedDocument = null; // reset to null if reloading
	
	 selElevations="";
	 selPbtypes="";
	
    if (!urnStr || (0 === urnStr.length)) {
        alert("没有对应模型文件!");
        return;
    }
	
	initializeViewer();
	
	
    var fullUrnStr =  urnStr;
    
    _viewer.load(fullUrnStr);

	_viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, function(e) {
		
		if (_viewer.model) {
			_viewer.model.getObjectTree(function (objTree) {

			
		});
	 }
	 
	   getpbstatuslist();
	});
	
	_viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, onSelectedCallback);
	_viewer.setGhosting(false); 
	//getDbid2ElementId();
}

function onSelectedCallback(event) {
	// display a message if an element is selected
	var msg = "";
	
	if (event.dbIdArray.length > 0) {
		getpbproperty(event.dbIdArray[0]);
		
	} 
}

function getpbproperty(dbId){
	$.ajax({
	  type:"get",
	  url:"/task/modelview/getpbproperty",
	  cache:false,
	  dataType:"json",
	  data:{"dbId": dbId,"curUnitId": _curUnitId,},
	  success: function(data){
		if(data.issuc=="true")
		{
			$("#pbnumber").text(data.pbnumber);
			$("#pbtype").text(data.pbtype);
			$("#pbtask").text(data.task);
			$("#pbstatus").text(data.pbstatus);
			$("#pbvolume").text(data.pbvolume);
			$("#pbvolumeunit").text(3);
			$("#pbelevation").text(data.pbelevation);
			//var traceurl='/task/goujian/trace/?pbid='+data.pbid;
			var traceurl="javascript:TracePbStatus("+data.pbid+");";
			
			$("#pbtrace").attr('href',traceurl); 
		}
		else
		{
			$("#pbnumber").text("无构件信息");	
			$("#pbtype").text("");
			$("#pbtask").text("");
			$("#pbstatus").text("");
			$("#pbvolume").text("");
			$("#pbvolumeunit").text("");
			$("#pbelevation").text("");
			$("#pbqrcode").attr('href','');
			$("#pbtrace").attr('href',''); 
		}

	  }
	});
}

function getpbstatuslist(){
	
	var timerange=$("#timerange").val();
	$.ajax({
	  type:"get",
	  url:"/task/projecttask/getstatus",
	  cache:false,
	  dataType:"json",
	  data:{"curUnitId": _curUnitId,"curMajor": _curMajor,"timerange": timerange},
	  success: function(data){
		if(data.issuc=="true")
		{
			_viewer.clearThemingColors();
			
			for(var each in data.pbstatuslist){ 
				for(var eachpb in data.pbstatuslist[each].pblist){
		
					var color;
					if(data.pbstatuslist[each].name=="wancheng")
					{
						 color = new THREE.Vector4(0,1,0,0.5); // r, g, b, intensity
					}
					else if(data.pbstatuslist[each].name=="afterwancheng")
					{
						 color = new THREE.Vector4(1,0.6,0,0.5); // r, g, b, intensity
					}
					else if(data.pbstatuslist[each].name=="beforewancheng")
					{
						 color = new THREE.Vector4(0,0,1,0.5); // r, g, b, intensity
					}
					_viewer.setThemingColor(parseInt(data.pbstatuslist[each].pblist[eachpb].lvmdbid), color);
				}
			}
			
			Drawpbstatuslist(data);
		}
		else
		{
			alert(data.error);
		}
	  }
	});
}


function Drawpbstatuslist(data){
	var total = data.listcount;
	var rate_wancheng = (parseFloat( data.wancheng.value / total ).toFixed(4)) ;
    var rate_beforewancheng = (parseFloat( data.beforewancheng.value / total ).toFixed(4)) ;
    var rate_afterwancheng = (parseFloat( data.afterwancheng.value / total ).toFixed(4)) ;

	rate_wancheng = (rate_wancheng*100).toFixed(2);
	rate_beforewancheng = (rate_beforewancheng*100).toFixed(2);
	rate_afterwancheng = (rate_afterwancheng*100).toFixed(2);
	
	var colors = ["#00FF00","#FF9900","#0000FF"];
	
//	colors.push(data.wancheng.color);
//	colors.push(data.jiagongzhong.color);
//	colors.push(data.weijiagong.color);
	
	var plotdata= [	{label: '按时完成比例', data: rate_wancheng }, 
				{label: '滞后完成比例', data: rate_afterwancheng },
				{label: '提前完成比例', data: rate_beforewancheng },
			  ] ;

          
    $.plot($("#item-donut"), plotdata, {  
         series: {  
                pie: {   
                      show: true //显示饼图  
                 }  
            },  
            legend: {  
                   show: false //不显示图例  
            } ,
				colors: colors,
     });  

	 
	 var progressdsc = "";
	 progressdsc +="总计需要完成构件数量："+total+"<br>";
	 if(total>0)
	 {
	 	progressdsc +="提前完成数量："+data.beforewancheng.value+"   占比："+rate_beforewancheng+"%<br>";
		progressdsc +="按时完成数量："+data.wancheng.value+"   占比："+rate_wancheng+"%<br>";
		progressdsc +="滞后完成数量："+data.afterwancheng.value+"   占比："+rate_afterwancheng+"%<br>";
	 }

	 $("#progressdsc").html(progressdsc);
}

function loadInitialModel() {

	$.ajax({
		type: "get",
		url: "/task/modelview/getinitialmodel",
		cache: false,
		dataType: "json",
		data: {},
		success: function(data) {
			if(data.issuc == "true") {
				var options = {};
				options.env = "Local"; // AutodeskProduction, AutodeskStaging, or AutodeskDevelopment (set in global var in this project)
				options.document = data.modelfile;
				_curUnitId = data.unitid;
				_curMajor = data.majorid;
				_isWholeModel = data.iswhole;
					
				Autodesk.Viewing.Initializer(options, function() {
					loadDocument(options.document); // load first entry by default
				});
			}
		}
	});
}
	
function getModelFile() {

	var selUnitId = $("#selUnitproject").val();
	var selMajor = $("#selMajor").val();
	
	if(_curUnitId == selUnitId && _curMajor == selMajor) {
		alert("不需要切换！");
		return;
	}
	
	_curUnitId = selUnitId;
	_curMajor = selMajor;
	
	$.ajax({
		type: "get",
		url: "/task/modelview/getmodelfile",
		cache: false,
		dataType: "json",
		data: {
			"_curMajor": _curMajor,
			"_curUnitId": _curUnitId,
		},
		success: function(data) {
			if(data.issuc == "true") {
				_isWholeModel = data.iswhole;
				loadDocument(data.modelfile); // load first entry by default
			} else {
				alert("没有对应单位工程专业模型！");
			}
		}
	});
}