///////////////////////////////////////////////////////////////////
// Simple Custom Tool viewer extension
// by Philippe Leefsma, March 2015
//
///////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

Autodesk.ADN.Viewing.Extension.CustomTool =

    function (viewer, options) {

    Autodesk.Viewing.Extension.call(this, viewer, options);

    var _self = this;
    var _btnDownEvent = null;
	var _btnMoveEventLast = null;
	var oldDbId;
    var ttip;//jquery tooltip dom
    // var ttip;
    _self.tool = null;
    function AdnTool(viewer, toolName) {

        this.getNames = function() {

            return [toolName];
        };

        this.getName = function() {

            return toolName;
        };

        this.activate = function(name) {

            console.log('-------------------');
            console.log('Tool:activate(name)');
            console.log(name);
        };

        this.deactivate = function(name) {

            console.log('-------------------');
            console.log('Tool:deactivate(name)');
            console.log(name);
        };

        this.update = function(t) {

            //console.log('-------------------');
            //console.log('Tool:update(t)');
            //console.log(t);

            return false;
        };

        this.handleSingleClick = function(event, button) {

            console.log('-------------------');
            console.log('Tool:handleSingleClick(event, button)');
            // onSelectedCallback(event)
            // debugger
            // _app.show=
            return false;
        };

        this.handleDoubleClick = function(event, button) {

            console.log('-------------------');
            console.log('Tool:handleDoubleClick(event, button)');
            console.log(event);
            console.log(button);

            return false;
        };


        this.handleSingleTap = function(event) {

            console.log('-------------------');
            console.log('Tool:handleSingleTap(event)');
            console.log(event);

            return false;
        };


        this.handleDoubleTap = function(event) {

            console.log('-------------------');
            console.log('Tool:handleDoubleTap(event)');
            console.log(event);

            return false;
        };


        this.handleKeyDown = function(event, keyCode) {

            console.log('-------------------');
            console.log('Tool:handleKeyDown(event, keyCode)');
            console.log(event);
            console.log(keyCode);

            return false;
        };

        this.handleKeyUp = function(event, keyCode) {

            console.log('-------------------');
            console.log('Tool:handleKeyUp(event, keyCode)');
            console.log(event);
            console.log(keyCode);

            return false;
        };


        this.handleWheelInput = function(delta) {

            console.log('-------------------');
            console.log('Tool:handleWheelInput(delta)');
            console.log(delta);

            return false;
        };

        this.handleButtonDown = function(event, button) {

//          console.log('-------------------');
//          console.log('Tool:handleButtonDown(event, button)');
//          console.log(event);
//          console.log(button);
			
			
            return false;
        };

        this.handleButtonUp = function(event, button) {

//          console.log('-------------------');
//          console.log('Tool:handleButtonUp(event, button)');
//          console.log(event);
//          console.log(button);
			_btnDownEvent = null;
//			var cam  = _viewer.getCamera();
//			console.log(cam.matrix.elements[10]);
//			if(cam.matrix.elements[10]<=0||cam.matrix.elements[10]>=0.707){
//				return true;
//			}

            return false;
        };
        var aj;
        this.mouseover = function(event) {

            console.log('-------------------');
            console.log('Tool:mouseover(event)');
            console.log(event);

            return false;
        };
        this.handleMouseMove = function(event,button) {
            const result = viewer.impl.hitTest( event.canvasX, event.canvasY, false );
            if(result) {

                
                const dbId = result.dbId;
                ttip.css("left",event.clientX+8+'px');
                ttip.css("top",event.clientY+8+'px');
                
                if(oldDbId==dbId){
                    return false
                }else{
                    oldDbId=dbId;
                    var url;
                    var title='';
                    if(moxing.type=='yuanqu'){
                        getObjByDbid.getPark(dbId,res=>{
                            if(res.length>0){
                                var txt = `<div>${title}${res[0].deviceorspace}</div>`;
                                // for(var i in res[0].sensors){
                                //     txt += `<div>传感器名字:${res[0].sensors[i].sensorsname}</div>
                                //             <div>最新数值:${res[0].sensors[i].lastdata}</div>
                                //             <div>状态:${res[0].sensors[i].laststation}</div>
                                //             `
                                //     // txt += `传感器名字:${res[0].sensors[i].sensorsname}\r\n最新数值:${res[0].sensors[i].lastdata}\r\n状态:${res[0].sensors[i].laststation}`

                                // }
                                ttip.css("display",'block');
                                ttip.html(txt)
                            }else{
                                ttip.css("display",'none');
                                // ttip.html('暂无设备空间信息')
                            }
                        })
                    }
                    else if(moxing.type=='space'){
                        // url=`/space/room/?modeldbid=${dbId}`
                        // title ='位置:'
                        getObjByDbid.getRoom(dbId,res=>{
                            if(res.results.length>0){
                                ttip.css("display",'block');
                                ttip.html(res.results[0].number+'-'+res.results[0].Name)
                            }else{
                                // ttip.html('暂无空间信息')
                                ttip.css("display",'none');
                            }
                        })
                        var aj = getObjByDbid.getFloor(dbId)
                        aj.done(res=>{
                            if(res.count>0){
                                var floorid = res.results[0].id
                                var flooraj = $.ajax(`/space/floor/${floorid}/today/`)
                                flooraj.then(today=>{
                                    var ttipTxt = `当日未关闭报修${today.wx}条<br />
                                            当日未关闭维保${today.wx}条<br />
                                            当日报警${today.yj}条<br />
                                            当日用电${today.dian}度<br />
                                            当日用水${today.shui}度`;
                                    ttip.css("display",'block');
                                    ttip.html(ttipTxt)
                                })
                            }
                        })
                    }else{
                        getObjByDbid.getDevice(dbId,res=>{
                            if(res.length>0){
                                let a = res[0];
                                var txt = `<div>${title}${a.devicetype.name + a.code}</div>`;
                                // for(var i in res[0].sensors){
                                //     txt += `<div>传感器名字:${res[0].sensors[i].sensorsname}</div>
                                //             <div>最新数值:${res[0].sensors[i].lastdata}</div>
                                //             <div>状态:${res[0].sensors[i].laststation}</div>
                                //             `
                                //     // txt += `传感器名字:${res[0].sensors[i].sensorsname}\r\n最新数值:${res[0].sensors[i].lastdata}\r\n状态:${res[0].sensors[i].laststation}`

                                // }
                                ttip.css("display",'block');
                                ttip.html(txt)
                            }else{
                                ttip.css("display",'none');
                                // ttip.html('暂无设备空间信息')
                            }
                        })
    
                    }
                    // aj = $.ajax(url)
                    // aj.done(res=>{
                    //     if(res.results){
                    //         if(res.results.length>0){
                    //             ttip.css("display",'block');
                    //             ttip.html(res.results[0].number+'-'+res.results[0].Name)
                    //         }else{
                    //             // ttip.html('暂无空间信息')
                    //             ttip.css("display",'none');
                    //         }
                            
                    //     }
                    //     else{
                    //         if(res.length>0){
                    //             var txt = `<div>${title}${res[0].deviceorspace}</div>`;
                    //             // for(var i in res[0].sensors){
                    //             //     txt += `<div>传感器名字:${res[0].sensors[i].sensorsname}</div>
                    //             //             <div>最新数值:${res[0].sensors[i].lastdata}</div>
                    //             //             <div>状态:${res[0].sensors[i].laststation}</div>
                    //             //             `
                    //             //     // txt += `传感器名字:${res[0].sensors[i].sensorsname}\r\n最新数值:${res[0].sensors[i].lastdata}\r\n状态:${res[0].sensors[i].laststation}`

                    //             // }
                    //             ttip.css("display",'block');
                    //             ttip.html(txt)
                    //         }else{
                    //             ttip.css("display",'none');
                    //             // ttip.html('暂无设备空间信息')
                    //         }
                    //     }

                    // })
                }
            }else{
                oldDbId = null
                ttip.css("display",'none');
            }
            return false;
        };


        this.handleGesture = function(event) {

            console.log('-------------------');
            console.log('Tool:handleGesture(event)');
            console.log(event);

            return false;
        };

        this.handleBlur = function(event) {

            console.log('-------------------');
            console.log('Tool:handleBlur(event)');
            console.log(event);

            return false;
        };

        this.handleResize = function() {

            console.log('-------------------');
            console.log('Tool:handleResize()');
        };
    }

    var toolName = "Autodesk.ADN.Viewing.Tool.CustomTool";

    _self.load = function () {
        $("#viewer").mouseout(function(){
            ttip.css("display",'none');
        });
        _self.tool = new AdnTool(viewer, toolName);

        viewer.toolController.registerTool(_self.tool);

        viewer.toolController.activateTool(toolName);
        $('body').append(`<div id="toolTip" style="margin: auto;padding: 12px;height:auto;width:auto;pointer-events:none;position: absolute;z-index: 10;display: none;color: white;background:url(/static/img/bg.png);background-repeat: round;background-size: cover"></div>`);
        ttip = $("#toolTip")
        // AddMarkerPingMian('red',ttip)
        // ttip = $("#toolTip-span")
        console.log('Autodesk.ADN.Viewing.Extension.CustomTool loaded');
        return true;
    };

    _self.unload = function () {
        ttip.remove()
        viewer.toolController.deactivateTool(toolName);

        console.log('Autodesk.ADN.Viewing.Extension.CustomTool unloaded');
        return true;
    };
};

Autodesk.ADN.Viewing.Extension.CustomTool.prototype =
    Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.CustomTool.prototype.constructor =
    Autodesk.ADN.Viewing.Extension.CustomTool;

Autodesk.Viewing.theExtensionManager.registerExtension(
    'Autodesk.ADN.Viewing.Extension.CustomTool',
    Autodesk.ADN.Viewing.Extension.CustomTool);

function newGuid() {
    var d = new Date().getTime();
    var guid = 'xxxx-xxxx-xxxx-xxxx-xxxx'.replace(/[xy]/g, function(c) {
     var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
     });
    return guid;
};

function AddMarkerPingMian(color,container){
    var svgId = newGuid();
    
     const htmlMarker = `
        <svg id="${svgId}" style="height: 24px; width: 24px;"></svg>
        <span id="toolTip-span" style="background:#727070;color:white;padding:5px"></span>
      `

    $(container).append(htmlMarker)
    const snap = Snap( $(`#${svgId}`)[0])

    var circle = snap.paper.circle(12, 12, 10)

    circle.attr({
      fillOpacity:0.4,
      strokeWidth:2,
      stroke: color,
      fill:color,
      opacity:1
    })
    
   
    // marker.css({
    //     left:left,
    //     top: top,
    //     display: 'block'
    //   })
 
    function animatePointer (circle) {
    
          circle.attr({
            fillOpacity: 0.8,
            opacity: 1,
            r: 0
          })
    
          circle.animate({
              fillOpacity: 0.2,
              opacity: 0.4,
              r: 10
            },
            2000,
            mina.easein, () => {
                animatePointer(circle)
            })
        
      }
      
      animatePointer(circle);
}

