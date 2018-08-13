// LoadModel.js
var _viewer = null; // the viewer

var nodesToProcess = [];

var mapElemId2DbIdSql = "";

var _selectedId = null;

var loadbig=false;//解决循环加载问题，天空盒模型 锁


// initialize the viewer into the HTML placeholder
function initializeViewer() {

	if(_viewer !== null) {
		//_viewer.uninitialize();
		_viewer.finish();
		_viewer = null;
		_savedViewerStates = [];
	} else {

	}

	//var viewerElement = document.getElementById("viewer");  // placeholder in HTML to stick the viewer
	//_viewer = new Autodesk.Viewing.Private.GuiViewer3D(viewerElement, {});
	_viewer = new Autodesk.Viewing.Viewer3D($("#viewer")[0], {});// With toolbar

	var retCode = _viewer.initialize();
	if(retCode !== 0) {
		alert("ERROR: Couldn't initialize viewer!");
		console.log("ERROR Code: " + retCode); // TBD: do real error handling here
	}

}

// load a specific document into the intialized viewer
function loadDocument(urnStr,callback) {

	if(!urnStr || (0 === urnStr.length)) {
		alert("You must specify a URN!");
		return;
	}
	loadbig=false;
	if(_viewer){
		_viewer.tearDown()
		_viewer.setUp(_viewer.config);
		_viewer.loadModel(urnStr);
		_viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, function(e) {
			if(loadbig==false){
				try{
					callback();
				}catch (e){

				}
				loadbig=true;
				// _viewer.loadModel("http://modelbucket.oss-cn-shanghai.aliyuncs.com/east_hospital/big/0.svf")
			}
			
		})
		return
	}

	initializeViewer();

	var fullUrnStr = urnStr;

	_viewer.load(fullUrnStr);

	_viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, function(e) {
		if(loadbig==false) {

			getAllNodes();

			setContextMenu();
			try{
				callback();
			}catch (e){

			}
			loadbig=true;
			// _viewer.loadModel("http://modelbucket.oss-cn-shanghai.aliyuncs.com/east_hospital/big/0.svf")
		}
		

	});
	
	// _viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, onSelectedCallback);
	_viewer.addEventListener(Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT, onSelectedCallback);
	

	_viewer.setGhosting(false);

	try{
		for(var i in ExtensionList){
			_viewer.unloadExtension(`Autodesk.ADN.Viewing.Extension.${ExtensionList[i]}`);
			_viewer.loadExtension(`Autodesk.ADN.Viewing.Extension.${ExtensionList[i]}`);
		}
	}catch(e){
		console.log(e)
	}

	_viewer.setBackgroundColor(1, 66,222, 255,255, 255);
//	
}

function setContextMenu() {
	Autodesk.ADN.Viewing.Extension.AdnContextMenu = function(viewer) {
		Autodesk.Viewing.Extensions.ViewerObjectContextMenu.call(this, viewer);
	};

	Autodesk.ADN.Viewing.Extension.AdnContextMenu.prototype =
		Object.create(Autodesk.Viewing.Extensions.ViewerObjectContextMenu.prototype);

	Autodesk.ADN.Viewing.Extension.AdnContextMenu.prototype.constructor =
		Autodesk.ADN.Viewing.Extension.AdnContextMenu;

	Autodesk.ADN.Viewing.Extension.AdnContextMenu.prototype.buildMenu =
		function(event, status) {
			var menu = Autodesk.Viewing.Extensions.ViewerObjectContextMenu.prototype.buildMenu.call(
				this, event, status);
			if(_selectedId && window.location.pathname=='/model/main/') {
				let model__systemlmvdbid,model__floorlmvdbid,floorlmvdbid,systemlmvdbid;
			}
			return menu;
		};

	_viewer.setContextMenu(new Autodesk.ADN.Viewing.Extension.AdnContextMenu(_viewer));

}

function getElementIdFromPropName(name) {

	if(typeof(name) != "undefined") {
		return name.substring(name.indexOf("[") + 1, name.indexOf("]"));
	}

	return "";
}
function getElementIdFromPropNameIFC(props) {

	for(var each in props.properties){
		if(props.properties[each].displayCategory=="文字" && props.properties[each].displayName=="RoomGUID")
		{
			var guid = props.properties[each].displayValue;
			var elementid = getElementIdFromPropName(props.name);

			var sql = `update spacemanage_room set floordbid = ${props.dbId} WHERE modelguid= '${guid}';\r\n`;
			mapElemId2DbIdSql += sql;
			break;
		}

	}

	return "";
}
var dddd = 0;

function makeDbidWithElemIdMap() {

	var sumofNode = nodesToProcess.length;

	for(var i = 0; i < sumofNode; ++i) {
		_viewer.getProperties(nodesToProcess[i], function(props) {
			dddd = dddd + 1;
			getElementIdFromPropNameIFC(props);
			if(dddd == sumofNode) {
				$("#sqllist").val(mapElemId2DbIdSql);
			}
		});
	}

	

}

function getAllNodes(root) {

	nodesToProcess = [];

	_viewer.getObjectTree(function(objTree) {
		var root = objTree.getRootId();
		objTree.enumNodeChildren(root, function(dbId) {

			//skip non-leaf tree nodes
			if(objTree.getChildCount() > 0)
				return;

			nodesToProcess.push(dbId);
		}, true);
		//注释掉需要计算时再打开
		// makeDbidWithElemIdMap();
	});
}

function HideAllModelsObject() {

	_viewer.hide(nodesToProcess);
}




// called when HTML page is finished loading, trigger loading of default model into viewer
function loadInitialModel(urltype1,urlid,callback) {
	var options = {};
	options.env = "Local"; // AutodeskProduction, AutodeskStaging, or AutodeskDevelopment (set in global var in this project)
	options.document = 'http://modelbucket.oss-cn-shanghai.aliyuncs.com/east_hospital/yuanqu/DFYY.SVF';

	Autodesk.Viewing.Initializer(options, function() {
		loadDocument(options.document,callback); // load first entry by default
	});
}

function loadModelByUrl(url,callback){
	var options = {};
	options.env = "Local"; // AutodeskProduction, AutodeskStaging, or AutodeskDevelopment (set in global var in this project)
	options.document = url;
	moxing.url = url;
	Autodesk.Viewing.Initializer(options, function() {
		loadDocument(options.document,callback); // load first entry by default
	});
}


