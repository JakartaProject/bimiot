/////////////////////////////////////////////////////////////////////
// Autodesk.ADN.Viewing.Extension.Video
// by Philippe Leefsma, May 2015
//
/////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

Autodesk.ADN.Viewing.Extension.Video = function(viewer, options) {

  Autodesk.Viewing.Extension.call(this, viewer, options);

  var _panel = null;

  /////////////////////////////////////////////////////////////////
  // Extension load callback
  //
  /////////////////////////////////////////////////////////////////
  this.load = function() {

    _panel = new Panel(
      viewer.container,
      guid());
      //    _panel.setVisible(true);
      console.log('Autodesk.ADN.Viewing.Extension.Video loaded');
    return true;
  };

  /////////////////////////////////////////////////////////////////
  //  Extension unload callback
  //
  /////////////////////////////////////////////////////////////////
  this.unload = function() {
    _panel.setVisible(false);
    console.log('Autodesk.ADN.Viewing.Extension.Video unloaded');
    return true;
  };

  Autodesk.Viewing.Viewer3D.prototype.LoadVideo = function(show) {
    
    if(show == undefined) {
      if(_panel.isVisible()) {
        _panel.setVisible(false);
      } else {
        _panel.setVisible(true);
      }
    } else {
      _panel.setVisible(show);
    }
  };

  /////////////////////////////////////////////////////////////////
  // Generates random guid to use as DOM id
  //
  /////////////////////////////////////////////////////////////////
  function guid() {

    var d = new Date().getTime();

    var guid = 'xxxx-xxxx-xxxx-xxxx'.replace(
      /[xy]/g,
      function(c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return(c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
      });

    return guid;
  }

  /////////////////////////////////////////////////////////////////
  // The demo Panel
  //
  /////////////////////////////////////////////////////////////////
  var Panel = function(parentContainer, id) {

    var _thisPanel = this;

    _thisPanel.content = document.createElement('div');

    Autodesk.Viewing.UI.DockingPanel.call(
      this,
      parentContainer,
      id,
      '监控视频', {
        shadow: true
      });

      var isShowtitle = true;
      var labeldis = 5;
      var detailfontsize = 30;

      $(_thisPanel.container).addClass('docking-panel-Sensor');
      var pagewidth = $("#viewer").width();
      var pageheight = $(window).height();
      var left = pagewidth - 800;
      var top = (pageheight - 700) * 0.5 < 0 ? 0 : (pageheight - 700) * 0.5;
      $('#' + id).css({
        'width': 'auto',
        'height': 'auto',
        'top': top + 'px',
        'left': left + 'px',
      });
      $(_thisPanel.container).append(
          `<div id='video'>

          </div>`);
      _thisPanel.setVisible = function(show) {
        Autodesk.Viewing.UI.DockingPanel.prototype.
        setVisible.call(this, show);
      };

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

    /////////////////////////////////////////////////////////////
    // onTitleDoubleClick override
    //
    /////////////////////////////////////////////////////////////
    var _isMinimized = false;

    _thisPanel.onTitleDoubleClick = function(event) {

      _isMinimized = !_isMinimized;

      if(_isMinimized) {

        $(_thisPanel.container).addClass(
          'docking-panel-minimized');
      } else {
        $(_thisPanel.container).removeClass(
          'docking-panel-minimized');
      }
    };
  };

  /////////////////////////////////////////////////////////////
  // Set up JS inheritance
  //
  /////////////////////////////////////////////////////////////
  Panel.prototype = Object.create(
    Autodesk.Viewing.UI.DockingPanel.prototype);

  Panel.prototype.constructor = Panel;

  /////////////////////////////////////////////////////////////
  // Add needed CSS
  //
  /////////////////////////////////////////////////////////////
  var css = [

    'form.docking-panel-controls{',
    'margin: 20px;',
    '}',

    'input.docking-panel-name {',
    'height: 30px;',
    'margin-left: 5px;',
    'margin-bottom: 5px;',
    'margin-top: 5px;',
    'border-radius:5px;',
    '}',

    'div.docking-panel-Sensor {',
    'resize: none;',
    'z-index: 200;',
    '}',

    'div.docking-panel-minimized {',
    'height: 34px;',
    'min-height: 34px',
    '}'

  ].join('\n');

  $('<style type="text/css">' + css + '</style>').appendTo('head');
};

Autodesk.ADN.Viewing.Extension.Video.prototype =
  Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.Video.prototype.constructor =
  Autodesk.ADN.Viewing.Extension.Video;

Autodesk.Viewing.theExtensionManager.registerExtension(
  'Autodesk.ADN.Viewing.Extension.Video',
  Autodesk.ADN.Viewing.Extension.Video);

