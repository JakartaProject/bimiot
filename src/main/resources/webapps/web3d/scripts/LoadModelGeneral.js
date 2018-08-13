// LoadModel.js
var _viewer = null;     // the viewer
var _savedGlobalCamera = null;
var _loadedDocument = null;

var _overlayMap = {};
var _colorPbsearch = null;

var nodesToProcess = [];

var _isWholeModel = false;
var _curUnitId="";
var _curMajor="";
var selElevations="";
var selPbtypes="";
var _lastSelectDbid=0;

var mapElemId2DbId = {};
var mapDbId2ElemId = {};

var mapElemId2DbIdSql = "";


// initialize the viewer into the HTML placeholder
function initializeViewer() {
    
    if (_viewer !== null) {
        //_viewer.uninitialize();
        _viewer.finish();
        _viewer = null;
        _savedGlobalCamera = null;
        _savedViewerStates = [];
    }

    //var viewerElement = document.getElementById("viewer");  // placeholder in HTML to stick the viewer
    //_viewer = new Autodesk.Viewing.Private.GuiViewer3D(viewerElement, {});
   _viewer =new Autodesk.Viewing.Private.GuiViewer3D ($("#viewer") [0], {}) ; // With toolbar
   
    var retCode = _viewer.initialize();
    if (retCode !== 0) {
        alert("ERROR: Couldn't initialize viewer!");
        console.log("ERROR Code: " + retCode);      // TBD: do real error handling here
    }
    
}


// load a specific document into the intialized viewer
function loadDocument(urnStr) {
    
    _loadedDocument = null; // reset to null if reloading
	
	 selElevations="";
	 selPbtypes="";
	
    if (!urnStr || (0 === urnStr.length)) {
        alert("You must specify a URN!");
        return;
    }
	
	initializeViewer();
	
    var fullUrnStr =  urnStr;
    
    _viewer.load(fullUrnStr);

	_viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, function(e) {
		if (_viewer.model) {
					
			getpbstatuslist();
			 
	 }
	});
	
	_viewer.unloadExtension('Autodesk.ADN.Viewing.Extension.SampleTaskStatus'); //显示属性页 !!!!!!
	_viewer.loadExtension('Autodesk.ADN.Viewing.Extension.SampleTaskStatus'); //显示属性页 !!!!!!
	_viewer.createSamplePanel(_curUnitId,_curMajor,_isWholeModel);

	_viewer.setGhosting(false); 
	//getDbid2ElementId();
}


function getColorByStr(strColor) {
	var color = null;
	if(strColor != undefined && strColor.length == 7) {
		var r = (parseFloat(parseInt(strColor.substr(1, 2), 16) / 255).toFixed(2));
		var g = (parseFloat(parseInt(strColor.substr(3, 2), 16) / 255).toFixed(2));
		var b = (parseFloat(parseInt(strColor.substr(5, 2), 16) / 255).toFixed(2));

		color = new THREE.Vector4(r, g, b, 0.5); // r, g, b, intensity
	}
	return color;
}
	

function getpbstatuslist(){
	$.ajax({
	  type:"get",
	  url:"/task/modelview/getpbstatuslist",
	  cache:false,
	  dataType:"json",
	  data:{"_curUnitId": _curUnitId,"_curMajor": _curMajor,},
	  success: function(data){
		if(data.issuc="true")
		{
			for(var each in data.pbstatuslist){ 
			
				for(var eachpb in data.pbstatuslist[each].pblist){
					var color = getColorByStr(data.pbstatuslist[each].color);
					for(var eachpb in data.pbstatuslist[each].pblist) {
						_viewer.setThemingColor(parseInt(data.pbstatuslist[each].pblist[eachpb].lvmdbid), color);
					}
			  }
			}
		}
	  }
	});
}


// called when HTML page is finished loading, trigger loading of default model into viewer
function loadInitialModel() {
    //dbgPrintLmvVersion();
	$.ajax({
	  type:"get",
	  url:"/task/modelview/getinitialmodel",
	  cache:false,
	  dataType:"json",
	  data:{},
	  success: function(data){
		if(data.issuc="true")
		{
			var options = {};
			options.env = "Local";                // AutodeskProduction, AutodeskStaging, or AutodeskDevelopment (set in global var in this project)
			options.document = data.modelfile;
			_curUnitId=data.unitid;
			_curMajor=data.majorid;
			_isWholeModel = data.iswhole;
			
			Autodesk.Viewing.Initializer(options, function() {
				loadDocument(options.document);   // load first entry by default
			});
		}
	  }
	});
	
}

