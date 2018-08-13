// LoadModel.js
var _viewer = null; // the viewer
var $viewerBus = '';
if(typeof Vue !=='undefined'){
    $viewerBus = new Vue();
}
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
	_viewer = new Autodesk.Viewing.Private.GuiViewer3D($("#viewer")[0], {}); // With toolbar
    if(typeof $viewerBus!=='string'){
        $viewerBus.$emit('viewerLoaded')
    }

	var retCode = _viewer.initialize();
	if(retCode !== 0) {
		alert("ERROR: Couldn't initialize viewer!");
		console.log("ERROR Code: " + retCode); // TBD: do real error handling here
	}

}
function clearListeners(){
	for(var key in _viewer.listeners){
	    // console.log(key)
	    // _viewer.removeEventListener(key);
	    _viewer.listeners[key]=[];
	}
}
// load a specific document into the intialized viewer
function loadDocument(urnStr,callback,nexturl='') {

	if(!urnStr || (0 === urnStr.length)) {
		alert("You must specify a URN!");
		return;
	}
	loadbig=false;
	const  modelOpts = {
	    placementTransform: new THREE.Matrix4(),
	    globalOffset: { x: 0, y: 0, z: 0 }
	};
	if(_viewer){

		// for(var key in _viewer.listeners){
		//     // console.log(key)
		//     // _viewer.removeEventListener(key);
		//     _viewer.listeners[key]=[];
		// }
		_viewer.tearDown()
		_viewer.setUp(_viewer.config);
		_viewer.loadModel(urnStr,modelOpts,()=>{
			if(nexturl){
				_viewer.loadModel(nexturl,modelOpts);
			}
		});
		
		_viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, function cb(e) {
			try{
					callback();
					
			}catch (e){

			}
			bestYuanQuShow()
			if(loadbig==false){
				
				loadbig=true;
				// _viewer.loadModel("http://modelbucket.oss-cn-shanghai.aliyuncs.com/east_hospital/big/0.svf")
			}
			// _viewer.setBackgroundColor(46, 51,70, 46, 51,70);
			// _viewer.setLightPreset(15);
			_viewer.removeEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT,cb)
		})
		callbackListener()

	}
	else{
		initializeViewer();
		// var fullUrnStr = urnStr;
		_viewer.loadModel(urnStr,modelOpts,()=>{
			if(nexturl){
				_viewer.loadModel(nexturl,modelOpts);
			}
		});
		// if(nexturl){
		// 	_viewer.loadModel(nexturl);
		// }
		_viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, function cb(e) {
			if(loadbig==false) {
				getAllNodes();
				setContextMenu();
				try{
					ShowEleByLvmdbid();
				}catch(e){
					//TODO handle the exception
				}
				try{
					colorModel();//渲染模型
				}catch(e){
					//TODO handle the exception
				}
				try{
	                paintCompleted()
				}catch (e){

				}
				try{
					callback();
					
				}catch (e){

				}
				bestYuanQuShow()
				loadbig=true;
				// _viewer.loadModel("http://modelbucket.oss-cn-shanghai.aliyuncs.com/east_hospital/big/0.svf")
			}
			// _viewer.setBackgroundColor(46, 51,70, 46, 51,70);
			// _viewer.setLightPreset(15);

			_viewer.removeEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT,cb)
		});
	}
	try{
		beforeLoad&&beforeLoad();
	}
	catch (e){
	}


	_viewer.setGhosting(false);
	
	callbackListener()
//	_viewer.unloadExtension('Autodesk.ADN.Viewing.Extension.SampleStatusaAnQuan'); 
//	_viewer.loadExtension('Autodesk.ADN.Viewing.Extension.PropertyListPanel');//弹出list框
//	_viewer.unloadExtension('Autodesk.ADN.Viewing.Extension.Color'); 
//	_viewer.loadExtension('Autodesk.ADN.Viewing.Extension.PropertyPanel');  
	try{
		_viewer.unloadExtension('Autodesk.ADN.Viewing.Extension.DockingPanelSensor');
		_viewer.loadExtension('Autodesk.ADN.Viewing.Extension.DockingPanelSensor');
	}catch(e){
		console.error(e);
	}
	try{
		_viewer.unloadExtension('Autodesk.ADN.Viewing.Extension.PropertyListPanel');
		_viewer.loadExtension('Autodesk.ADN.Viewing.Extension.PropertyListPanel');
	}catch(e){
		//TODO handle the exception
	}
	try{
		_viewer.unloadExtension('Autodesk.ADN.Viewing.Extension.'+ExtensionName);
		_viewer.loadExtension('Autodesk.ADN.Viewing.Extension.'+ExtensionName);
	}catch(e){
		//TODO handle the exception
	}
	try{
		_viewer.unloadExtension('Autodesk.ADN.Viewing.Extension.Color');
		_viewer.loadExtension('Autodesk.ADN.Viewing.Extension.Color');
	}catch(e){
		//TODO handle the exception
	}
	try{
		for(var i in ExtensionList){
			_viewer.unloadExtension(`Autodesk.ADN.Viewing.Extension.${ExtensionList[i]}`);
			_viewer.loadExtension(`Autodesk.ADN.Viewing.Extension.${ExtensionList[i]}`);
		}
	}catch(e){
		console.log(e)
	}
	// _viewer.setLightPreset(15);//设置背景和光照
	// _viewer.setBackgroundColor(1, 66,222, 255,255, 255);
	// _viewer.setBackgroundColor(46, 51,70, 46, 51,70);

//	var color = getColorByStr("#ff0000");
//	_viewer.setSelectionColor(color);
//	var viewerToolbar = _viewer.getToolbar(true);
//	var modelTools = viewerToolbar.removeControl( Autodesk.Viewing.TOOLBAR.NAVTOOLSID);
//	modelTools.removeControl('toolbar-panTool');
	

//	var modelTools = viewerToolbar.getControl('modelTools');
//	viewerToolbar.removeControl(modelTools);
//	var modelTools = viewerToolbar.getControl('settingsTools');
//	viewerToolbar.removeControl(modelTools);
//	
}

function callbackListener(){
	_viewer.setSelectionMode(Autodesk.Viewing.SelectionMode.FIRST_OBJECT)
	// debugger
	_viewer.removeSelectCallback = function(f){
		_viewer.removeEventListener(Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT, f?f:onSelectedCallbackInit);
	}
	_viewer.addSelectCallback = function(f){
		_viewer.addEventListener(Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT, f?f:onSelectedCallbackInit);
	}
	// _viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, onSelectedCallbackInit);
	try{
		_viewer.removeSelectCallback()
	}catch(e){
		console.log(e)
	}
	_viewer.addEventListener(Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT, onSelectedCallbackInit);
}

function bestShow(v,f){
	var listeners = _viewer.listeners[Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT]
    _viewer.listeners[Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT] = []
	if((v instanceof Array)){
		if(v.length>0){
		    _viewer.select(v);
		    _viewer.fitToView(v);
		}

	}else if(!isNaN(v)&&v){
	    _viewer.select(v);
	    _viewer.fitToView(v);
	}
	else{
		console.log("构件数据匹配错误")
	}
	_viewer.listeners[Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT] = listeners
}


function splitModelByFoolLevel(level) {
    var dif = ((level - 15.95)) * (1000 / 304.8);
    var x = -111.483 + dif;
    var y = -62.5 - dif;
    // _viewer.setCutPlanes([new THREE.Vector4(0, 0, -1, x), new THREE.Vector4(0, 0, 1, y)]);
    _viewer.setCutPlanes([new THREE.Vector4(0, 0, 1, y)]);
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
				if(moxing.type!=="mepsystemtype"){
                    model__floorlmvdbid = _selectedId;
                    floorlmvdbid = _selectedId
				} else {
                    model__systemlmvdbid = _selectedId;
                    systemlmvdbid = _selectedId
				}
				menu.push({
					title: "关联本地文件",
					target: function() {
						_app.uploadType="upload";
                        _app.uploadfilemodal=!0;
                        _app.temp_selectId = _selectedId;
                        Vue.nextTick(()=>{
                            _app.baseData[0].children=[];
                            _app.value1=[];
                            _app.$refs.upload.fileList=[];
						})
					}
				});
				menu.push({
					title: "关联云端文件",
					target: function() {
                        _app.uploadType="relation";
						_app.uploadfilemodal=!0;
                        _app.temp_selectId = _selectedId;
                        Vue.nextTick(()=>{
                            _app.baseData[0].children=[];
                            _app.value1=[];
                        })
					}
				});
			}
			else if(_selectedId && moxing.type=="mepsystemtype"){
				menu.push({
					title: "查看楼层模型",
					target: function() {
                        getObjByDbid.getPB(_selectedId,res=>{
                        	if(res.length>0){
                        		var a = res[0].floor.split('/')
                        		var floorid = a[a.length-2];
                        		$.ajax(`/model/rest/modelurl2model/?model=${res[0].id}&modelurl__urltype1=floor&modelurl__urlid=${floorid}`).done(mu=>{
                        			if(mu.results.length>0){
                        				loadInitialModelByModelUrl(mu.results[0].modelurl,()=>{
                        					bestShow(mu.results[0].dbid)
                        				})
                        			}else{
                        				_daohang.$Message.info("暂无楼层匹配数据")
                        			}
                        		})
                        	}
                        	
                        })
					}
				});
			}
			else if(_selectedId && moxing.type=="floor"){
				menu.push({
					title: "查看系统模型",
					target: function() {
                        getObjByDbid.getPB(_selectedId,res=>{
                        	if(res.length>0){
                        		$.ajax(`/model/rest/modelurl2model/?model=${res[0].id}&modelurl__urltype1=mepsystemtype`).done(mu=>{
                        			if(mu.results.length>0){
                        				loadInitialModelByModelUrl(mu.results[0].modelurl,()=>{
                        					bestShow(mu.results[0].dbid)
                        				})
                        			}else{
                        				_daohang.$Message.info("暂无楼层匹配数据")
                        			}
                        		})
                        	}
                        	
                        })
					}
				});
			}
			if(_selectedId && window.location.pathname=='/repair/manage/') {
				menu.push({
					title: "发起报修",
					target: function() {

						$Bus.$emit('addEvent',_selectedId)
					}
				});
			}else if (_selectedId && window.location.pathname=='/device/manage/') {
				menu.push({
					title: "添加维保计划",
					target: function() {
						window.location.href = '/device/plan/';
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

function bestYuanQuShow(){
	var  camera;
	if(moxing.type=='yuanqu'){
		_viewer.setLightPreset(1);
		_viewer.setLightPreset(15);
		 camera = {"guid":"cfe9aa6c16305e526b1","seedURN":"/static/js/web3d/moxing/DFYYsvf/DFYY_All.SVF","overrides":{"transformations":[]},"objectSet":[{"id":[3626],"isolated":[],"hidden":[],"explodeScale":0,"idType":"lmv"}],"viewport":{"name":"","eye":[-11744.920060471926,7169.062070184467,-7369.234046021131],"target":[-16456.363871183567,24666.891136564354,-19242.508345656417],"up":[-0.14249345263326207,0.5292063701548242,0.8364426063659166],"worldUpVector":[0,0,1],"pivotPoint":[-13833.784423828125,24472.0283203125,-20570.3486328125],"distanceToOrbit":21664.403232309945,"aspectRatio":1.625227922688624,"projection":"perspective","isOrthographic":false,"fieldOfView":45},"renderOptions":{"environment":"Photo Booth","ambientOcclusion":{"enabled":true,"radius":10,"intensity":0.4},"toneMap":{"method":1,"exposure":0,"lightMultiplier":-1},"appearance":{"ghostHidden":false,"ambientShadow":true,"antiAliasing":true,"progressiveDisplay":true,"swapBlackAndWhite":false,"displayLines":true}},"cutplanes":[],"cameraTween":{"viewport":{"name":"","eye":[-11744.920060471926,7169.062070184467,-7369.234046021131],"target":[-16456.363871183567,24666.891136564354,-19242.508345656417],"up":[-0.14249345263326207,0.5292063701548242,0.8364426063659166],"worldUpVector":[0,0,1],"pivotPoint":[-13833.784423828125,24472.0283203125,-20570.3486328125],"distanceToOrbit":21664.403232309945,"aspectRatio":1.625227922688624,"projection":"perspective","isOrthographic":false,"fieldOfView":45}}};
		_viewer.CameraRestoreState(camera);
	}else{
		_viewer.setLightPreset(1);
		_viewer.setBackgroundColor(46, 51,70, 46, 51,70);
	}
}
// called when HTML page is finished loading, trigger loading of default model into viewer
function loadInitialModel(urltype1,urlid,callback) {
	try{
        if(urltype1==moxing.type&&urlid==moxing.value){
      		if(callback){
      			callback();
      			
      		}
      		bestYuanQuShow()
            return;
        }
		moxing.type = urltype1;
        moxing.value = urlid
	}catch(e){
		console.error(e)
	}
	
	try{
		_viewer.dispatch('modelChange');
	}catch(e){
		//TODO handle the exception
		console.error(e)
	}

	
	$.ajax({
		type: "get",
		url: `/model/modelurl/?urltype1=${urltype1}&urlid=${urlid}&pathname=${window.location.pathname}`,
		cache: false,
		dataType: "json",
		success: function(data) {
			// moxing={type:urltype1,value:urlid,url:data.modelfile}
			
			try{
				moxing.url=data.modelfile;
			}catch(e){
				//TODO handle the exception
				console.error(e);
			}

			
			if(data.issuc == "true") {
				var options = {
				};
				options.env = "Local"; // AutodeskProduction, AutodeskStaging, or AutodeskDevelopment (set in global var in this project)

				var nexturl;
				data.nexturl?'':data.nexturl='';
				if(data.modelfile.startsWith('http')){
					// east 平台
					options.document = data.modelfile;
					nexturl = data.nexturl;
				}
				else if(window.location.host=='test.east-hospital.bimsheng.com'){
					// 物理机外网east 平台
					options.document = 'http://modelbucket.oss-cn-shanghai.aliyuncs.com/east_hospital/'+data.modelfile.replace("/static/js/web3d/moxing/",'')
					nexturl = 'http://modelbucket.oss-cn-shanghai.aliyuncs.com/east_hospital/'+data.nexturl.replace("/static/js/web3d/moxing/",'')
				}else{
					// 物理机内网
					options.document = "http://"+window.location.host+data.modelfile
					nexturl = "http://"+window.location.host+data.nexturl
				}
				if(!data.nexturl){
                    nexturl=''
                }
				// options.document = 'http://modelbucket.oss-cn-shanghai.aliyuncs.com/east_hospital/'+data.modelfile.replace("/static/js/web3d/moxing/",'')
				Autodesk.Viewing.Initializer(options, function() {
					loadDocument(options.document,callback,nexturl); // load first entry by default
				});
			}else{
				_daohang.$Message.info('暂无对应模型,请检查')
			}
		},
		error: function(e) { 
			console.error(e)
		} 
	});
}


function loadInitialModelByModelUrl(url,callback) {
	$.ajax({
		type: "get",
		url: url,
		cache: false,
		success: function(data) {
			// moxing={type:urltype1,value:urlid,url:data.modelfile}
			if(data.urltype1==moxing.type&&data.urlid==moxing.value){
	      		if(callback){
	      			callback();
	      			
	      		}
	      		bestYuanQuShow()
	            return;
	        }
			try{
				moxing.type = data.urltype1;
        		moxing.value = data.urlid
				moxing.url = data.url;
			}catch(e){
				//TODO handle the exception
				console.error(e);
			}

			

			var options = {};
			options.env = "Local"; // AutodeskProduction, AutodeskStaging, or AutodeskDevelopment (set in global var in this project)
			options.document = data.url;
			if(window.location.host=='test.east-hospital.bimsheng.com'){
				options.document = 'http://modelbucket.oss-cn-shanghai.aliyuncs.com/east_hospital/'+data.url.replace("/static/js/web3d/moxing/",'')
			}
			// options.document = 'http://modelbucket.oss-cn-shanghai.aliyuncs.com/east_hospital/'+data.modelfile.replace("/static/js/web3d/moxing/",'')
			Autodesk.Viewing.Initializer(options, function() {
				loadDocument(options.document,callback); // load first entry by default
			});
		},
		error: function(e) { 
			console.error(e)
		} 
	});
}


function loadModelByUrl(url,callback){
	var options = {};
	options.env = "Local"; // AutodeskProduction, AutodeskStaging, or AutodeskDevelopment (set in global var in this project)
	options.document = url;
	$.ajax(`/model/rest/modelurl/?url=${url}`).done(res=>{
		if(res.length>0){
			moxing.url = res[0].url;
			moxing.type = res[0].urltype1;
			moxing.value = res[0].urlid;
		}
		
	})

	Autodesk.Viewing.Initializer(options, function() {
		loadDocument(options.document,callback); // load first entry by default
	});
}
//计算两个构件的距离
var juli=60;//设置探头距离内的摄像机显示
function distance(dbid1,dbid2){
	var firstmodel = _viewer.impl.modelQueue().getModels()[0] 
	var it = firstmodel.getData().instanceTree;
	var center1;
	var center2;
	it.enumNodeFragments(dbid1,fragId=>{
		var nodeBoundingBox = getModifiedWorldBoundingBox([fragId]);
		nodeBoundingBoxObj[dbid1]=nodeBoundingBox;
		center1 = nodeBoundingBox.center();
	},true)
	it.enumNodeFragments(dbid2,fragId=>{
		var nodeBoundingBox = getModifiedWorldBoundingBox([fragId]);
		nodeBoundingBoxObj[dbid2]=nodeBoundingBox;
		center2 = nodeBoundingBox.center();
	},true)

	if(center1.distanceTo(center2)>juli/2){
		return false
	}else{
		return true
	}

}

/**
 *
 * @type {null}
 * @description:传入dbidlist 画透明的球
 * @param selectdbid String
 */
//
var qiu=null;
function addqiutoview(selectdbid,color){
	var firstmodel = _viewer.impl.modelQueue().getModels()[0] 
	var it = firstmodel.getData().instanceTree;
	it.enumNodeFragments(selectdbid,fragId=>{
		var nodeBoundingBox = getModifiedWorldBoundingBox([fragId]);
		nodeBoundingBoxObj[selectdbid]=nodeBoundingBox;
		var center = nodeBoundingBox.center();
	    var material= new THREE.MeshBasicMaterial ( {color: color,wireframe:true,vertexColors:"red"} );
	    var geometry_sphere = new THREE.CubeGeometry(juli,juli,juli);
	    geometry_sphere.applyMatrix( new THREE.Matrix4().makeTranslation( center.x, center.y, center.z ) );
	    if(qiu){
	    	_viewer.impl.scene.remove(qiu);
	    }
	    var _currentShape = new THREE.Mesh( geometry_sphere, material );
	    qiu = _currentShape;
	    _viewer.impl.scene.add(_currentShape);
	    _viewer.impl.invalidate(true) ;
	})
}
var _currentShapeList=[];
var nodeBoundingBoxObj={};
function addobjtoview(txt,selectdbid,color){
	var firstmodel = _viewer.impl.modelQueue().getModels()[0] 
	var it = firstmodel.getData().instanceTree;
	var fragIdlist = []
	it.enumNodeFragments(selectdbid,fragId=>{
		fragIdlist.push(fragId)
	})
	var nodeBoundingBox = getModifiedWorldBoundingBox(fragIdlist);
	nodeBoundingBoxObj[selectdbid]=nodeBoundingBox;
	var center = nodeBoundingBox.center();
    var material= new THREE.MeshBasicMaterial( {color: color} );
    var options = {
        size: 1.5,
        height: 0.2,
        weight: "normal",
        font: "helvetiker",
        bevelThickness: 1,
        bevelSize: 0.1,
        bevelSegments: 1,
        bevelEnabled: false,
    };
    var geometry_sphere = new THREE.TextGeometry(txt,options);
    // geometry_sphere.applyMatrix( new THREE.Matrix4().makeTranslation( center.x-4, center.y-2, nodeBoundingBox.max.z ) );
    var _currentShape = new THREE.Mesh( geometry_sphere, material );
    _currentShape.position.x = center.x-4;
    _currentShape.position.y = center.y+5;
    _currentShape.position.z = nodeBoundingBox.max.z;
    _currentShape.rotation.z=-0.5 * Math.PI;
    _currentShapeList.push(_currentShape);
    _viewer.impl.scene.add(_currentShape);
    _viewer.impl.invalidate(true) ;
  
}
function addobjttoviewbynondebound(txt,selectdbid,color){
	var nodeBoundingBox = nodeBoundingBoxObj[selectdbid];
	var center = nodeBoundingBox.center();
    var material= new THREE.MeshBasicMaterial( {color: color} );
    var options = {
        size: 1.5,
        height: 0.2,
        weight: "normal",
        font: "helvetiker",
        bevelThickness: 1,
        bevelSize: 0.1,
        bevelSegments: 1,
        bevelEnabled: false,
    };
    var geometry_sphere = new THREE.TextGeometry(txt,options);
    geometry_sphere.applyMatrix( new THREE.Matrix4().makeTranslation( center.x-4, center.y-2, nodeBoundingBox.max.z ) );
    var _currentShape = new THREE.Mesh( geometry_sphere, material );
    _currentShapeList.push(_currentShape);
    _viewer.impl.scene.add(_currentShape);
    _viewer.impl.invalidate(true) ;

}
function removeroomIdentifying(){
	for(var i in _currentShapeList){//移除房间标示
		_viewer.impl.scene.remove(_currentShapeList[i]);
	}
    _currentShapeList = []
	_viewer.impl.invalidate(true) ;
}
function showobjtoview(){
	_currentShapeList.forEach(item=>{
		item.visible=true;
	})
	_viewer.impl.invalidate(true) ;
}
function hideobjtoview(){
	_currentShapeList.forEach(item=>{
		item.visible=false;
	})
	_viewer.impl.invalidate(true) ;
}
function getFragmentIdByDbIds(objectIds) {
	var FragmentIds = [];
	var firstmodel = _viewer.impl.modelQueue().getModels()[0] 
	var it = firstmodel.getData().instanceTree;
	for(var i = 0; i < objectIds.length; i++) {
		var dbid = objectIds[i];
		it.enumNodeFragments(dbid, function(fragId) {

			FragmentIds.push(fragId);

		}, true);
	}
	return FragmentIds;
}

function getModifiedWorldBoundingBox(fragIds) {
	var fragbBox = new THREE.Box3();
	var nodebBox = new THREE.Box3();
	var firstmodel = _viewer.impl.modelQueue().getModels()[0] 
	fragList = firstmodel.getFragmentList();
	fragIds.forEach(function(fragId) {
		fragList.getWorldBounds(fragId, fragbBox);
		nodebBox.union(fragbBox);
	});
	return nodebBox;
}

function worldToClient(dbid,obj){
	var firstmodel = _viewer.impl.modelQueue().getModels()[0];
	if(!firstmodel||!firstmodel.getData()||!firstmodel.getData().instanceTree){
		setTimeout(()=>{
            worldToClient(dbid, obj)
		},1000)
	} else {
        var it = firstmodel.getData().instanceTree;
        it.enumNodeFragments(dbid,(fragId,dbid)=>{
            var nodebBox = new THREE.Box3();
            var fragbBox = new THREE.Box3();
            var fragList = firstmodel.getFragmentList();
            fragList.getWorldBounds(fragId, fragbBox);
            nodebBox.union(fragbBox);
            var center = nodebBox.center();
            var c = _viewer.impl.worldToClient(center);
            obj.style = {left:c.x+'px',top:c.y+'px',display:'block'};
        },true);
    }
}



function onSelectedCallbackInit(event){
    if (event.selections.length>0 && event.selections[0].dbIdArray.length == 1) {
        _selectedId = event.selections[0].dbIdArray[0];
    } else {
        _selectedId = null;
    }
    if(_selectedId){
        if(typeof onSelectedCallback === 'object'||typeof onSelectedCallback === 'function') {
            onSelectedCallback(event)
        }
    }

}

function getObjByDbidC(){
	this.aj = null;
	this.aj1= null;
	this.aj2= null;
	this.aj3= null;
	this.aj4 = null;
	this.aj5 = null;
	this.plist = [];
	this.getParentList = (dbid)=>{
		if(dbid==1){
			return
		}
	    this.plist.push(dbid)
	    var m = _viewer.impl.modelQueue().getModels()
	    var pa = m[0].getData().instanceTree.getNodeParentId(dbid)
	    if(pa==1){
	        return
	    }else{
	        this.getParentList(pa)
	    }
	};
	this.getDevice = (dbid,callback)=>{
		// 获取设备
		this.plist = [];
		this.getParentList(dbid);
		this.aj&&this.aj.abort()
		this.aj = $.ajax(`/device/device1/?model__ModelUrl2Model__dbid__in=${this.plist}&model__ModelUrl__urlid=${moxing.value}&model__ModelUrl__urltype1=${moxing.type}`);
		this.aj.done(res=>{
            // this.value = 
            if(callback){
            	callback(res.results)
            }
            
        })
	};
	this.getDevice0 = (dbid,callback)=>{
		// 获取设备
		this.plist = [];
		this.getParentList(dbid);
		this.aj1&&this.aj1.abort()
		this.aj1 = $.ajax(`/device/device/?model__ModelUrl2Model__dbid__in=${this.plist}&model__ModelUrl__urlid=${moxing.value}&model__ModelUrl__urltype1=${moxing.type}`);
		this.aj1.done(res=>{
            if(callback){
            	callback(res.results)
            }
            
        })
	};
    this.getDevice1 = (dbid,callback)=>{
        // 获取设备
        this.plist = [];
        this.getParentList(dbid);
        this.aj4&&this.aj4.abort()
        this.aj4 = $.ajax(`/device/device/?model__ModelUrl2Model__dbid__in=${this.plist}&model__ModelUrl__urlid=${moxing.value}&model__ModelUrl__urltype1=${moxing.type}`);
        this.aj4.done(res=>{
            if(callback){
                callback(res.results)
            }

        })
    };
	this.getPB = (dbid,callback)=>{
		// 获取构件属性
		this.plist = [];
		this.getParentList(dbid);
		this.aj2&&this.aj2.abort()
		this.aj2 = $.ajax(`/model/rest/pb/?ModelUrl2Model__dbid__in=${this.plist}&ModelUrl__urlid=${moxing.value}&ModelUrl__urltype1=${moxing.type}`)
		this.aj2.done(res=>{
            // this.value = 
            if(callback){
            	callback(res)
            }

            
        })
	};
	this.getRoom = (dbid,callback)=>{
		// 获取房间
		this.aj3&&this.aj3.abort()
		this.aj3 = $.ajax(`/space/room/?modeldbid=${dbid}`)
		this.aj3.done(res=>{
            // this.value = 
            if(callback){
            	callback(res)
            }

            
        })
	};
	this.getPark=(dbid,callback)=>{
		// 获取园区构件属性
		this.plist = [];
		this.getParentList(dbid);
		this.aj&&this.aj.abort()
		this.aj = $.ajax(`/model/rest/pb/?ModelUrl2Model__dbid__in=${this.plist}&ModelUrl__urlid=${moxing.value}&ModelUrl__urltype1=${moxing.type}`)
		this.aj.done(res=>{
            // this.value = 
            if(callback){
            	callback(res)
            }

            
        })
	};
	this.getFloor=(dbid)=>{

		this.aj5&&this.aj.abort()
        var aj5 = $.ajax(`/space/floor/?model__ModelUrl2Model__modelurl__urlid=${moxing.value}&model__ModelUrl2Model__modelurl__urltype1=${moxing.type}&model__ModelUrl2Model__dbid=${dbid}`)
        return aj5
    };

}


getObjByDbid = new getObjByDbidC()