/////////////////////////////////////////////////////////////////////
// Autodesk.ADN.Viewing.Extension.SampleTask
// by pangubing 2016.08.01
//
/////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

Autodesk.ADN.Viewing.Extension.SampleTask = function (viewer, options) {
  
  Autodesk.Viewing.Extension.call(this, viewer, options);
  
  var _panel = null;
  
  /////////////////////////////////////////////////////////////////
  // Extension load callback
  //
  /////////////////////////////////////////////////////////////////
  this.load = function () {

    _panel = new Panel(
      viewer.container,
      guid());

    _panel.setVisible(true);

    console.log('Autodesk.ADN.Viewing.Extension.SampleTask loaded');

    return true;
  };
  
  /////////////////////////////////////////////////////////////////
  //  Extension unload callback
  //
  /////////////////////////////////////////////////////////////////
  this.unload = function () {
    
    _panel.setVisible(false);
    
    console.log('Autodesk.ADN.Viewing.Extension.SampleTask unloaded');
    
    return true;
  };
  
  /////////////////////////////////////////////////////////////////
  // Generates random guid to use as DOM id
  //
  /////////////////////////////////////////////////////////////////
  function guid() {
    
    var d = new Date().getTime();
    
    var guid = 'xxxx-xxxx-xxxx-xxxx'.replace(
      /[xy]/g,
      function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
      });
    
    return guid;
  }
  
  /////////////////////////////////////////////////////////////////
  // The demo Panel
  //
  /////////////////////////////////////////////////////////////////
  var Panel = function(
    parentContainer, id) {
    
    var _thisPanel = this;
    
    _thisPanel.content = document.createElement('div');
    
    Autodesk.Viewing.UI.DockingPanel.call(
      this,
      parentContainer,
      id,
      '图例',
      {shadow:true});
    
    $(_thisPanel.container).addClass('bootstrap-panel');
	

    /////////////////////////////////////////////////////////////
    // Custom html
    //
    /////////////////////////////////////////////////////////////
    var html = `<div class="pbwell-simaple">
						<div style="color:#337ab7;font-size:14px;"><label>示例图例</label></div>
						<div><label  value="提前完成" style="background-color:#0000FF;padding:3px;" onMouseOver="this.title=this.innerText">提前完成</label></div>
						<div><label value="滞后完成" style="background-color:#FF9900;padding:3px;" onMouseOver="this.title=this.innerText">滞后完成</label></div>
						<div><label  value="按时完成" style="background-color:#00FF00;padding:3px;" onMouseOver="this.title=this.innerText">按时完成</label></div>
			   </div>`;

    _thisPanel.createScrollContainer({
      left: false,
      heightAdjustment: 25,
      marginTop:0
    });

    $(_thisPanel.scrollContainer).append(html);

    /////////////////////////////////////////////////////////////
    // initialize override
    //
    /////////////////////////////////////////////////////////////
    _thisPanel.initialize = function() {
      
      this.title = this.createTitleBar(
        this.titleLabel ||
        this.container.id);
      
      this.closer = this.createCloseButton();
      
      this.container.appendChild(this.title);
      this.title.appendChild(this.closer);
      this.container.appendChild(this.content);
      
      this.initializeMoveHandlers(this.title);
      this.initializeCloseHandler(this.closer);
    };
	

  };
  

  
  /////////////////////////////////////////////////////////////
  // Set up JS inheritance
  //
  /////////////////////////////////////////////////////////////
  Panel.prototype = Object.create(
    Autodesk.Viewing.UI.DockingPanel.prototype);
  
  Panel.prototype.constructor = Panel;

  
   Panel.prototype.initialize = function()
	{
    // Override DockingPanel initialize() to:
    // - create a standard title bar
    // - click anywhere on the panel to move
    // - create a close element at the bottom right
    //
	//	this.title = this.createTitleBar(this.titleLabel || this.container.id);
	//	this.container.appendChild(this.title);
    //
	//	this.container.appendChild(this.content);
		this.initializeMoveHandlers(this.container);
    //
	//	this.closer = document.createElement("div");
	//	this.closer.className = "simplePanelClose";
	//	this.closer.textContent = "Close";
	//	this.initializeCloseHandler(this.closer);
	//	this.container.appendChild(this.closer);
	};
  
  /////////////////////////////////////////////////////////////
  // Add needed CSS
  //
  /////////////////////////////////////////////////////////////
  var css = `

     div.bootstrap-panel {
        top: 5px;
        left: 5px;
        width: auto;
        height: auto;
        resize: none;
        background-color: #F1F1F1;
		padding:5px;
      }
    
	 div.pbwell-simaple{
		color: white;
	}

    div.bootstrap-panel:hover {
      background-color: #F1F1F1;
    }

    .panel-container {
      margin:15px;
    }`;

  $('<style type="text/css">' + css + '</style>').appendTo('head');
 };

Autodesk.ADN.Viewing.Extension.SampleTask.prototype =
  Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.SampleTask.prototype.constructor =
  Autodesk.ADN.Viewing.Extension.SampleTask;

Autodesk.Viewing.theExtensionManager.registerExtension(
  'Autodesk.ADN.Viewing.Extension.SampleTask',
  Autodesk.ADN.Viewing.Extension.SampleTask);