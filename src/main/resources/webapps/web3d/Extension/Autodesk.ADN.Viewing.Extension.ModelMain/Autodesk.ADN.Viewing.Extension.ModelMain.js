/////////////////////////////////////////////////////////////////////
// Autodesk.ADN.Viewing.Extension.ModelMain
// by Philippe Leefsma, May 2015
//
/////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

Autodesk.ADN.Viewing.Extension.ModelMain = function(viewer, options) {

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

//		    _panel.setVisible(true);

		console.log('Autodesk.ADN.Viewing.Extension.ModelMain loaded');

		return true;
	};

	/////////////////////////////////////////////////////////////////
	//  Extension unload callback
	//
	/////////////////////////////////////////////////////////////////
	this.unload = function() {

		_panel.setVisible(false);

		console.log('Autodesk.ADN.Viewing.Extension.ModelMain unloaded');

		return true;
	};

	Autodesk.Viewing.Viewer3D.prototype.LoadPanelModel = function(show) {
		console.log(show);
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
			'信息', 
			{
				shadow: true
			});



		if(navigator.userAgent.match(/(iPhone|iPod|Android|ios)/i)) {
			var pagewidth = $(window).width();
			var pageheight = $(window).height();

			panlewidth = pagewidth * 0.95;
			panleheight = panlewidth + 30;

			chartheight = panlewidth / 2;
			$(_thisPanel.container).addClass('docking-panel-Model');
			$('#' + id).css({
				'width': panlewidth + 'px',
				'max-height': panleheight + 'px',
				'top': '15%',
				'left': '2.5%',
				'height':'auto',
			});
		} else {
			$(_thisPanel.container).addClass('docking-panel-Model');
			var pagewidth = $("#viewer").width();
			var pageheight = $(window).height();
			var left = pagewidth - 620;
			var top = (pageheight - 600) * 0.5 < 0 ? 0 : (pageheight - 800) * 0.5;
			$('#' + id).css({
				'width': 400 + 'px',
				'max-height': pageheight-200 + 'px',
				'top': top + 'px',
				'left': 150 + 'px',
				'height':'auto',
				// 'background-color':'rgba(235, 242, 243, 0.6)',
				'color':'#3877a9!important',
			});
			var html='<div id="viewModal" class="menu_list"></div>';
			$(_thisPanel.container).append(html);
			try{
				initViewModal();//自定义弹出框
			}catch(e){
				//TODO handle the exception
			}
		}

		
		_thisPanel.setVisible = function(show) {
//			$('.docking-panel-Model > #firstpane').remove();
//			var html = $('#htmltemp').html();
//			$(_thisPanel.container).append(html);
//			htmltempf();
			Autodesk.Viewing.UI.DockingPanel.prototype.setVisible.call(this, show);
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

		'div.docking-panel-Model {',
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

Autodesk.ADN.Viewing.Extension.ModelMain.prototype =
	Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.ModelMain.prototype.constructor =
	Autodesk.ADN.Viewing.Extension.ModelMain;

Autodesk.Viewing.theExtensionManager.registerExtension(
	'Autodesk.ADN.Viewing.Extension.ModelMain',
	Autodesk.ADN.Viewing.Extension.ModelMain);