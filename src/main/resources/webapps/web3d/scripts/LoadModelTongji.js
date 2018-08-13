// LoadModel.js
var _viewer = null; // the viewer
var _savedGlobalCamera = null;
var _loadedDocument = null;

var _overlayMap = {};
var _colorPbsearch = null;

var nodesToProcess = [];

var _isWholeModel = false;
var _curUnitId = "";
var _curMajor = "";
var _selElevations = "";
var _selZones = "";
var _selPbtypes = "";

var _lastSelectDbid = 0;

var mapElemId2DbId = {};
var mapDbId2ElemId = {};

var mapElemId2DbIdSql = "";

//pgb 注释掉暂时不做本地缓存
var _needLoadStorage = false;

var _selectedId = null;
var _pbDbidList = [];

// add the two overlays to the system
function initOverlays() {

	_colorPbsearch = new THREE.Vector4(0, 1, 0, 0.5); // r, g, b, intensity
}

// initialize the viewer into the HTML placeholder
function initializeViewer() {

	if(_viewer !== null) {
		//_viewer.uninitialize();
		_viewer.finish();
		_viewer = null;
		_savedGlobalCamera = null;
		_savedViewerStates = [];
	} else {
		initOverlays(); // set up the Overlays one time
	}

	//var viewerElement = document.getElementById("viewer");  // placeholder in HTML to stick the viewer
	//_viewer = new Autodesk.Viewing.Private.GuiViewer3D(viewerElement, {});
	_viewer = new Autodesk.Viewing.Private.GuiViewer3D($("#viewer")[0], {}); // With toolbar

	var retCode = _viewer.initialize();
	if(retCode !== 0) {
		alert("ERROR: Couldn't initialize viewer!");
		console.log("ERROR Code: " + retCode); // TBD: do real error handling here
	}

}

// load a specific document into the intialized viewer
function loadDocument(urnStr) {

	_loadedDocument = null; // reset to null if reloading

	if(!urnStr || (0 === urnStr.length)) {
		alert("You must specify a URN!");
		return;
	}

	initializeViewer();

	var fullUrnStr = urnStr;

	_viewer.load(fullUrnStr);

	_viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, function(e) {
		if(_viewer.model) {

			getAllNodes();

			if(_needLoadStorage) {
				getSelectPbTypes();
				_needLoadStorage = false;
			}

			setContextMenu();

		}
	});

	_viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, onSelectedCallback);

	_viewer.setGhosting(false);
	_viewer.setLightPreset(4);//设置背景和光照
	//getDbid2ElementId();
	
	_viewer.unloadExtension('Autodesk.ADN.Viewing.Extension.SampleStatusaAnQuan'); 
	_viewer.loadExtension('Autodesk.ADN.Viewing.Extension.SampleStatusAnQuan');
	_viewer.unloadExtension('Autodesk.ADN.Viewing.Extension.Color'); 
	_viewer.loadExtension('Autodesk.ADN.Viewing.Extension.Color');  
}

function isPrebeamNode(dbId) {
	var isPrebeam = false;
	for(var i = 0; i < _pbDbidList.length; ++i) {
		if(dbId == _pbDbidList[i]) {
			isPrebeam = true;
			break;
		}
	}

	return isPrebeam;
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

			if(_selectedId) {
				menu.push({
					title: "关联本地文件",
					target: function() {
						window.open("/task/ziliao/uploadview/?uploaddir=1");
					}
				});
				menu.push({
					title: "关联云端文件",
					target: function() {
						window.open("/task/ziliao/cloudfilerelate/");
					}
				});
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

var dddd = 0;

function makeDbidWithElemIdMap() {

	var sumofNode = nodesToProcess.length;

	for(var i = 0; i < sumofNode; ++i) {
		_viewer.getProperties(nodesToProcess[i], function(props) {
			var ElemId = getElementIdFromPropName(props.name);
			dddd = dddd + 1;
			if(ElemId != "") {
				var sql = "update spacemanagement_room set lvmdbid = " + props.dbId + " WHERE elementid= '" + ElemId + "';\r\n";
				mapElemId2DbIdSql += sql;
				//mapElemId2DbId.put(ElemId,props.dbId);
				//mapDbId2ElemId.put(props.dbId,ElemId);
			}

			if(dddd == sumofNode) {
				$("#sqllist").val(mapElemId2DbIdSql);
			}

		});
	}

	$("#sqllist").attr('style', 'display:inline');

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
//		makeDbidWithElemIdMap();
	});
}

function HideAllModelsObject() {

	_viewer.hide(nodesToProcess);
}

function onSelectedCallback(event) {
	// display a message if an element is selected
	var msg = "";

	if(event.dbIdArray.length > 0) {
		_selectedId = event.dbIdArray[0];
		//getpbproperty(event.dbIdArray[0]);
		//getrelatefilelist("构件",event.dbIdArray[0]);
		
	} else {
		_selectedId = null;
	}
}

function getpbproperty(dbId) {
	$.ajax({
		type: "get",
		url: "/task/modelview/getpbproperty",
		cache: false,
		dataType: "json",
		data: {
			"dbId": dbId,
			"_curUnitId": _curUnitId,
		},
		success: function(data) {
			if(data.issuc == "true") {
				$("#pbnumber").text(data.pbnumber);
				$("#pbtype").text(data.pbtype);
				$("#pbstatus").text(data.pbstatus);
				$("#pbvolume").text(data.pbvolume);
				$("#pbvolumeunit").text(3);
				$("#pbelevation").text(data.pbelevation);
				//var qrcodeurl='/task/goujian/qrcode/?pbid='+data.pbid;
				var qrcodeurl = "javascript:PrintPbQrcode(" + data.pbid + ");";
				//var traceurl='/task/goujian/trace/?pbid='+data.pbid;
				var traceurl = "javascript:TracePbStatus(" + data.pbid + ");";

				$("#pbqrcode").attr('href', qrcodeurl);
				$("#pbtrace").attr('href', traceurl);
			} else {
				$("#pbnumber").text("无构件信息");
				$("#pbtype").text("");
				$("#pbstatus").text("");
				$("#pbvolume").text("");
				$("#pbelevation").text("");
				$("#pbqrcode").attr('href', '');
				$("#pbtrace").attr('href', '');
			}

		}
	});
}

function getrelatefilelist(type,Id) {
	$('#file_relate_table tbody tr').remove();
	$.ajax({
		type: "get",
		url: "/task/modelview/getrelatefilelist",
		cache: false,
		dataType: "json",
		data: {
			"RelateId": Id,
			"RelateType":type,
			"_curUnitId": _curUnitId,
		},
		success: function(data) {
			if(data.issuc == "true") {
				if(data.filelist.length==0){
					var newRow ="<tr> \
							<td >没有关联文件</td> \
				       		</tr>";
							$("#file_relate_table tbody").append(newRow);
				}else{
					for(var each in data.filelist) {
						if(each=="remove")
							continue;
						var newRow ="<tr> \
								<td ><a href='/"+data.filelist[each].filepath+data.filelist[each].filename+"' target='_blank'>"+data.filelist[each].fileshortname+"</a></td> \
					       		</tr>";
							$("#file_relate_table tbody").append(newRow);
					}
				}
				
				
			} else {
				var newRow ="<tr> \
							<td>获取关联文件失败</td> \
				       		</tr>";
				$("#file_relate_table tr:last").after(newRow);
			}

		}
	});
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

function getpbstatuslist() {
	$.ajax({
		type: "get",
		url: "/task/modelview/getpbstatuslist",
		cache: false,
		dataType: "json",
		data: {
			"_selElevations": _selElevations,
			"_selPbtypes": _selPbtypes,
			"_curUnitId": _curUnitId,
			"lastSelectDbid": _lastSelectDbid,
			"_selZones": _selZones,
			"_curMajor": _curMajor,
			"_isWholeModel": _isWholeModel,
		},
		success: function(data) {
			if(data.issuc = "true") {
				_pbDbidList = [];
				for(var each in data.pbstatuslist) {
					var color = getColorByStr(data.pbstatuslist[each].color);
					for(var eachpb in data.pbstatuslist[each].pblist) {
						_viewer.setThemingColor(parseInt(data.pbstatuslist[each].pblist[eachpb].lvmdbid), color);
						_pbDbidList.push(parseInt(data.pbstatuslist[each].pblist[eachpb].lvmdbid));
					}
				}
			}
		}
	});
}

function getpbstatus() {
	$.ajax({
		type: "get",
		url: "/task/modelview/getpbstatus",
		cache: false,
		dataType: "json",
		data: {
			"_curUnitId": _curUnitId,
			"lastSelectDbid": _lastSelectDbid,
		},
		success: function(data) {
			if(data.issuc = "true") {
				for(var each in data.pbstatuslist) {

					for(var eachpb in data.pbstatuslist[each].pblist) {
						//var dbids = [];
						//dbids.push(parseInt(data.pbstatuslist[each].pblist[eachpb].lvmdbid));
						//overrideColorOnObj(dbids, _overlayMap.get(data.pbstatuslist[each].name));
						var color = _overlayMap[data.pbstatuslist[each].name];
						_viewer.setThemingColor(parseInt(data.pbstatuslist[each].pblist[eachpb].lvmdbid), color);
					}
				}
			}
		}
	});
}

// called when HTML page is finished loading, trigger loading of default model into viewer
function loadInitialModel() {

	$.ajax({
		type: "get",
		url: "/space/getinitialmodel",
		cache: false,
		dataType: "json",
		data: {},
		success: function(data) {
			if(data.issuc == "true") {
				var options = {};
				options.env = "Local"; // AutodeskProduction, AutodeskStaging, or AutodeskDevelopment (set in global var in this project)
				options.document = "http://"+window.location.host+data.modelfile;
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
	if(_curUnitId == "" || _curMajor == "") {
		return;
	}
	
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

function getDbid2ElementId() {
	var msg = "";
	_viewer.getObjectTree(function(objTree) {
		var root = objTree.getRootId();
		objTree.enumNodeChildren(root, function(dbId) {
			viewer.getProperties(dbId, function(props) {
				msg += props.name + "," + dbId;
			});

			//skip non-leaf tree nodes
			if(objTree.getChildCount() > 0)


		}, true);

		$("#selecteditems").text(msg);
	});

}