// LoadModel.js
var _subviewer = null; // the viewer


// initialize the viewer into the HTML placeholder


// load a specific document into the intialized viewer
function loadModel(urnStr, callback) {
	if(_subviewer !== null) {
		//_viewer.uninitialize();
		_subviewer.finish();
		_subviewer = null;
	}
	_subviewer = new Autodesk.Viewing.Viewer3D($("#subviewer")[0], {});
	_subviewer.initialize();

	_subviewer.load (urnStr) ;
	_subviewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, function(e) {
		if(_subviewer.model) {
			// setContextMenu();
				callback();
		}
		try{
			_subviewer.unloadExtension('Viewing.Extension.Markup3D');
			_subviewer.loadExtension('Viewing.Extension.Markup3D');
		}catch(e){
			//TODO handle the exception
		}
	});
	// _subviewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, onSelectedCallback);
	
	_subviewer.setBackgroundColor(61, 56,74, 61, 56,74);


}



// called when HTML page is finished loading, trigger loading of default model into viewer
function loadDeviceModel(urltype1, urlid, callback) {

	try {
		_subviewer.removeEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT);
	} catch(e) {
		//TODO handle the exception
	}
	$.ajax({
		type: "get",
		url: `/model/modelurl/?urltype1=${urltype1}&urlid=${urlid}`,
		cache: false,
		dataType: "json",
		success: function(data) {
			if(data.issuc == "true") {
				var options = {};
				options.env = "Local"; // AutodeskProduction, AutodeskStaging, or AutodeskDevelopment (set in global var in this project)
				if(data.modelfile.startsWith('http')){
					options.document = data.modelfile;
				}else{
					options.document = "http://"+window.location.host+data.modelfile
				}
				// load first entry by default
				Autodesk.Viewing.Initializer(options, function() {
					loadModel(options.document, callback);  // load first entry by default
				});
			} else {
				//				_app.$Message.info('暂时无该模型');
			}
		}
	});
}


