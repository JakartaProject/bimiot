// LoadModel.js
var _viewer = null;     // the viewer
var _savedGlobalCamera = null;
var _loadedDocument = null;

var curUnitId="";

var _lmvModelOptions = [];

var nodesToProcess = [];

function loadModelMenuOptions() {

	
	$.ajax({
	  type:"get",
	  url:"/task/projecttask/getunitprojectlist",
	  cache:false,
	  dataType:"json",
	  data:{},
	  success: function(data){
		if(data.issuc=="true")
		{
			for(var each in data.unitprojectlist){ 
				_lmvModelOptions.push(data.unitprojectlist[each]);
			}
			
			// add the new options for models
			var sel = $("#curunitproject");
			$.each(_lmvModelOptions, function(i, item) {
				sel.append($("<option>", { 
					value: i,
					text : item.name
				}));
				
				if(item.id==curUnitId)
				{
					$("#curunitproject").val(i);
				}
				
			});
		}
		else
		{
			console.log(data.error);
		}
	  }
	});
	

}

 $("#curunitproject").change(function(evt) {  
    evt.preventDefault();
     
	
    var index = parseInt($("#curunitproject option:selected").val(), 10);
    console.log("Changing model to: " + _lmvModelOptions[index].modelfile);
	
	curUnitId=_lmvModelOptions[index].id;
	
    loadDocument(_lmvModelOptions[index].modelfile);
});


 var creatTextAt = function(textPosition, textString, textSize) {
		var text3d = new THREE.TextGeometry(textString, {
		size: textSize,
		height: 5, //thickness of the text
		curveSegments: 2,
		 weight: "normal",
		font: "arial"
		});
		text3d.computeBoundingBox();
		var centerOffset = -0.5 * (text3d.boundingBox.max.x - text3d.boundingBox.min.x);
		var textMaterial = new THREE.MeshBasicMaterial(
		{ color: Math.random() * 0xffffff,
		overdraw: true });
		_viewer.impl.matman().addMaterial('ADN_material_MarkerText', textMaterial, true);
		text = new THREE.Mesh(text3d, textMaterial);
		text.position.x = textPosition.x + centerOffset;
		text.position.y = textPosition.y;
		text.position.z = textPosition.z;
		_viewer.impl.scene.add(text);
		//refresh viewer
		_viewer.impl.invalidate(true);
		return text;
};

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
    _viewer.loadExtension('Autodesk.ADN.Viewing.Extension.SampleTaskGoal');   
   // _viewer.loadExtension('Autodesk.ADN.Viewing.Extension.Annotation');  

//  var options = {};
//	options.parentControl = null;     
//
//  markup3D = new Markup3DExtension(_viewer,options);
//  markup3D.load();

	
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
	 
	   getAllNodes();
	 
	   getpbstatuslist();
	   
	   //creatTextAt(new THREE.Vector3(50, 100, 0), 'Hello World', 20);
	   
//	   _viewer.drawAnnotationString(31372,"PC31：有裂缝...");
//	    _viewer.drawAnnotationString(12602,"PC31：有裂缝...");
//	 _viewer.drawAnnotationString(12603,"PC31：有裂缝...");
//	 _viewer.drawAnnotationString(12604,"PC31：有裂缝...");
//	 _viewer.drawAnnotationString(12605,"PC31：有裂缝...");
//	 _viewer.drawAnnotationString(12607,"PC31：有裂缝...");
//	 _viewer.drawAnnotationString(18182,"PC31：有裂缝...");
//	 _viewer.drawAnnotationString(18183,"PC31：有裂缝...");
//	 _viewer.drawAnnotationString(18184,"PC31：有裂缝...");
//	 _viewer.drawAnnotationString(18185,"PC31：有裂缝...");
//	 _viewer.drawAnnotationString(18187,"PC31：有裂缝...");
//	 _viewer.drawAnnotationString(18188,"PC31：有裂缝...");
//	 _viewer.drawAnnotationString(25622,"PC31：有裂缝...");
//	 _viewer.drawAnnotationString(25623,"PC31：有裂缝...");
//	 _viewer.drawAnnotationString(25624,"PC31：有裂缝...");
//	 _viewer.drawAnnotationString(25625,"PC31：有裂缝...");
//	 _viewer.drawAnnotationString(25627,"PC31：有裂缝...");
//	 _viewer.drawAnnotationString(25628,"PC31：有裂缝...");
//	 _viewer.drawAnnotationString(25629,"PC31：有裂缝...");

	   //_viewer.select([25636]);
	});
	
	//_viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, onSelectedCallback);
	_viewer.setGhosting(false); 
	//getDbid2ElementId();
}

function getAllNodes(root) {
		
		nodesToProcess=[];
		
		_viewer.getObjectTree(function(objTree) {
            var root = objTree.getRootId();
            objTree.enumNodeChildren(root, function(dbId) {
                
                    //skip non-leaf tree nodes
                if (objTree.getChildCount() > 0)
                    return;
				
				nodesToProcess.push(dbId);
            }, true);
						//注释掉需要计算时再打开
			//makeDbidWithElemIdMap();
        });
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
	  data:{"dbId": dbId,"curUnitId": curUnitId,},
	  success: function(data){
		if(data.issuc=="true")
		{
			$("#pbnumber").text(data.pbnumber);
			$("#pbtype").text(data.pbtype);
			$("#pbtask").text("1号楼2层混凝土施工");
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
	
	var timerange="2016/07/19 - 2017/02/14";
	$.ajax({
	  type:"get",
	  url:"/task/projecttask/getstatusgoal",
	  cache:false,
	  dataType:"json",
	  data:{"curUnitId": curUnitId,"timerange": timerange},
	  success: function(data){
		if(data.issuc=="true")
		{
			_viewer.clearThemingColors();
			
			
			for(var each in data.pbstatuslist){ 
				for(var eachpb in data.pbstatuslist[each].pblist){
		
					var color;
					if(data.pbstatuslist[each].name=="zhiqianwancheng")
					{
						 color = new THREE.Vector4(0,1,0,0.5); // r, g, b, intensity
					}
					else if(data.pbstatuslist[each].name=="wancheng")
					{
						 color = new THREE.Vector4(1,0.6,0,0.5); // r, g, b, intensity
					}
					else if(data.pbstatuslist[each].name=="weiwancheng")
					{
						 color = new THREE.Vector4(0,0,1,0.5); // r, g, b, intensity
					}
					_viewer.setThemingColor(parseInt(data.pbstatuslist[each].pblist[eachpb].lvmdbid), color);
				}
			}
			
			
		}
		else
		{
			alert(data.error);
		}
	  }
	});
}

function Drawpbstatuslist2(){
	
	var timerange="2016/07/19 - 2017/02/14";
	$.ajax({
	  type:"get",
	  url:"/task/projecttask/getstatus",
	  cache:false,
	  dataType:"json",
	  data:{"curUnitId": curUnitId,"timerange": timerange},
	  success: function(data){
		if(data.issuc=="true")
		{
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
    var rate_jiagongzhong = (parseFloat( data.jiagongzhong.value / total ).toFixed(4)) ;
    var rate_weijiagong = (parseFloat( data.weijiagong.value / total ).toFixed(4)) ;

	rate_wancheng = (rate_wancheng*100).toFixed(2);
	rate_jiagongzhong = (rate_jiagongzhong*100).toFixed(2);
	rate_weijiagong = (rate_weijiagong*100).toFixed(2);
	
	var colors = [];
	
	colors.push(data.jiagongzhong.color);
	colors.push(data.weijiagong.color);
	
	var plotdata= [
				{label: '目标完成数量', data: rate_jiagongzhong },
				{label: '目标未完成数量', data: rate_weijiagong },
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
	 progressdsc +="目标总计需要完成构件数量："+total+"<br>";
	 if(total>0)
	 {
		progressdsc +="目标未完成数量："+data.jiagongzhong.value+"   占比："+rate_jiagongzhong+"%<br>";
		progressdsc +="目标完成数量："+data.weijiagong.value+"   占比："+rate_weijiagong+"%<br>";
	 }

	 
	 
	 $("#progressdsc").html(progressdsc);
}

// called when HTML page is finished loading, trigger loading of default model into viewer
function loadInitialModel() {
	$.ajax({
	  type:"get",
	  url:"/task/modelview/getinitialmodel",
	  cache:false,
	  dataType:"json",
	  data:{},
	  success: function(data){
		if(data.issuc=="true")
		{
			var options = {};
			options.env = "Local";                // AutodeskProduction, AutodeskStaging, or AutodeskDevelopment (set in global var in this project)
			options.document = data.modelfile;
			curUnitId=data.unitid;
			
			Drawpbstatuslist2();
			
			Autodesk.Viewing.Initializer(options, function() {
				loadDocument(options.document);   // load first entry by default
			});
			
			loadModelMenuOptions();
		}
	  }
	});
	
}


	
