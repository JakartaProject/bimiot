ModelVue = {
    template:`
        <div ref="viewer" @mouseout='mouseout'>
            <markCirle v-for='item in marklist' :markstyle='item.style' @click.native="showMark(item)"></markCirle>
            <div ref='ttip' style="margin: auto;padding: 12px;height:auto;width:auto;pointer-events:none;position: absolute;z-index: 10;;color: white;background:url(/static/img/bg.png);background-repeat: round;background-size: cover" :style="ttipStyle" v-html="ttipTxt"></div>
            <!--<div style="position: absolute;z-index: 10; bottom:200px;left:200px;">-->
                <!--测试专用-->
                <!--<button @click="changeColor('department')" >部门</button>-->
                <!--<button @click="changeColor('category')" >用途</button>-->
                <!--<button @click="loadInitialModel('floor',95)" >4层</button>-->
                <!--<button @click="loadInitialModel('space',1)" >大楼模型</button>-->
                <!--<button @click="loadInitialModel('yuanqu',0)" >园区</button>-->
                <!--<button @click="loadInitialModel('mepsystemtype',3)">水系统</button>-->
            <!--</div>-->
        </div>
    `,
    data () {
        return {
            _viewer:null,
            ExtensionList:['CameraTween',],
            urltype1:null,
            urlid:null,
            modelurlid:'',
            plist:[],
            ttipStyle:{
                display:'block',
                left:0,
                top:0,
            },
            ttipTxt:'',
            marklist:[],
            source:false,
            _currentShapeList:[],//添加的3d文字
        };
        
    },
    components:{
        markCirle
    },
    props:{
        // 'marklist':Array,
        'select':{
            type:Function,
            default(){
                return function(){};
            }
        },
        'addLocalFile':{
            //关联本地文件
            type:Function,
            default(){
                return function(){};
            }
        },
        'addCloudFile':{
            //关联云端文件
            type:Function,
            default(){
                alert('关联云端文件');
                return function(){};
            }
        },
        'addEvent':{
            //发起报修
            type:Function,
            default(){
                return function(){};
            }
        },
        'addEventTask':{
            //发起维保计划
            type:Function,
            default(){
                return function(){};
            }
        }
    },
    methods: {
        showMark(item){
            this.bestShow(item.modeldbid);
            if(item.dbinfo.level!=undefined){
                this.splitModelByFoolLevel(item.dbinfo.level);
            }
            if(item)
                util.eventBus.$emit('markClick',item);
        },
        worldToClient(obj){
            var self=this;
            var firstmodel = self._viewer.impl.modelQueue().getModels()[0];
            if(!firstmodel||!firstmodel.getData()||!firstmodel.getData().instanceTree){
                setTimeout(()=>{
                    self.worldToClient(obj);
                },1000);
            } else {
                var it = firstmodel.getData().instanceTree;
                it.enumNodeFragments(obj.modeldbid,(fragId,dbid)=>{
                    var nodebBox = new THREE.Box3();
                    var fragbBox = new THREE.Box3();
                    var fragList = firstmodel.getFragmentList();
                    fragList.getWorldBounds(fragId, fragbBox);
                    nodebBox.union(fragbBox);
                    var center = nodebBox.center();
                    var c = self._viewer.impl.worldToClient(center);
                    obj.style.left =c.x+'px';
                    obj.style.top=c.y+'px';
                    obj.style.display='block';
                },true);
            }
        },
        mouseout() {
            this.ttipStyle.display='none'
        },
        markByModelurlid(){
            this.marklist = [];
            this.source&&this.source.cancel('取消上个请求')
            this.source = util.CancelToken.source()
            var markaj1 = util.ajax.get(`/repair/rest/projecteventelement/?event__status__in=1,2,3&pagesize=999&modelurlid=${this.modelurlid}`,{cancelToken: this.source.token});
            var markaj2 = util.ajax.get(`/device/sensorwarning/?&modelurlid=${this.modelurlid}`,{cancelToken: this.source.token});
            Promise.all([markaj1,markaj2]).then(res=>{
                var res1 = res[0].data;
                var res2 = res[1].data;
                for(var i in res1.results){
                    res1.results[i].style={left:'0px',top:'0px',display:'none',color:res1.results[i].color}
                    try{
                        res1.results[i].modeldbid = Number(res1.results[i].dbinfo.dbid)
                        this.marklist.push(res1.results[i]);
                    }
                    catch (e){
                    }
                    
                }
                for(var i in res2.results){
                    res2.results[i].style={left:'0px',top:'0px',display:'none',color:'red'}
                    try{
                        res2.results[i].modeldbid = Number(res2.results[i].dbinfo.dbid)
                        this.marklist.push(res2.results[i]);
                    }
                    catch (e){
                    }
                    
                }
                this.updateMarkData()
            })
            // this.markaj.then(r=>{
            //     var res = r.data;
            //     for(var i in res.results){
            //         res.results[i].style={left:'0px',top:'0px',display:'none',color:res.results[i].color}
            //         try{
            //             res.results[i].modeldbid = Number(res.results[i].dbinfo.dbid)
            //             // res.results[i].txt = res.results[i].eventType==1?'维修中':'维保中'
            //             this.marklist.push(res.results[i]);
            //         }
            //         catch (e){
            //         }
                    
            //     }
            //     this.updateMarkData()
            // })

        },

        modelChange(urltype1,urlid){
            this.urltype1 = urltype1;
            this.urlid = urlid;
            this.markByModelurlid()
        },
        CustomTool(){
            var self=this;
            AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

            Autodesk.ADN.Viewing.Extension.CustomEvent =

                function(viewer, options) {

                    Autodesk.Viewing.Extension.call(this, viewer, options);

                    var _self = this;
                    var _btnDownEvent = null;
                    var _btnMoveEventLast = null;
                    var oldDbId;
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
                            //          var cam  = _viewer.getCamera();
                            //          console.log(cam.matrix.elements[10]);
                            //          if(cam.matrix.elements[10]<=0||cam.matrix.elements[10]>=0.707){
                            //              return true;
                            //          }

                            return false;
                        };
                        _self.obj='';
                        _self.obj1='';
                        this.mouseover = function(event) {

                            console.log('-------------------');
                            console.log('Tool:mouseover(event)');
                            console.log(event);

                            return false;
                        };
                        this.handleMouseMove = function(event, button) {
                            const result = viewer.impl.hitTest(event.canvasX, event.canvasY, false);
                            if (result) {


                                const dbId = result.dbId;
                                self.ttipStyle.left =  event.clientX + 8 + 'px';
                                self.ttipStyle.top = event.clientY + 8 + 'px';

                                if (oldDbId == dbId) {
                                    return false
                                } else {
                                    oldDbId = dbId;
                                    var url;
                                    var title = '';
                                    
                                    if (self.urltype1 == 'yuanqu') {
                                        _self.obj&&_self.obj.source.cancel('取消上个请求')
                                        _self.obj = self.getPark(dbId)
                                        _self.obj.then( r => {
                                            var res = r.data;
                                            if (res.length > 0) {
                                                var txt = `${title}${res[0].deviceorspace}`;
                                                self.ttipStyle.display = 'block';
                                                self.ttipTxt = txt;
                                            } else {
                                                self.ttipStyle.display = 'none';
                                            }
                                        })
                                    } else if (self.urltype1 == 'space') {

                                        _self.obj&&_self.obj.source.cancel('取消上个请求')
                                        _self.obj = self.getRoom(dbId)
                                        _self.obj.then(r => {
                                            var res = r.data;
                                            if (res.results.length > 0) {
                                                self.ttipStyle.display = 'block';
                                                self.ttipTxt = res.results[0].number + '-' + res.results[0].Name;
                                            } else {
                                                self.ttipStyle.display = 'none';
                                            }

                                        })
                                        _self.obj1&&_self.obj1.source.cancel('取消上个请求')
                                        _self.obj1 = self.getFloor(dbId)
                                        _self.obj1.then(res=>{
                                            if(res.data.count>0){
                                                var floorid = res.data.results[0].id
                                                var flooraj = util.ajax.get(`/space/floor/${floorid}/today/`)
                                                flooraj.then(r=>{
                                                    var today  = r.data
                                                    self.ttipStyle.display = 'block';
                                                    self.ttipTxt = `当日未关闭报修${today.wx}条<br />
                                                            当日未关闭维保${today.wx}条<br />
                                                            当日报警${today.yj}条<br />
                                                            当日用电${today.dian}度<br />
                                                            当日用水${today.shui}度`;
                                                })
                                            }
                                            
                                        })
                                    } else {
                                        _self.obj&&_self.obj.source.cancel('取消上个请求')
                                        _self.obj = self.getDevice(dbId)
                                        _self.obj.then(r => {
                                            var res =r.data.results;
                                            if (res.length > 0) {
                                                let a = res[0];
                                                var txt = `${title}${a.devicetypen + a.code}`;
                                                self.ttipStyle.display = 'block';
                                                self.ttipTxt =txt;
                                            } else {
                                                self.ttipStyle.display = 'none';
                                            }
                                        })

                                    }

                                }
                            } else {
                                oldDbId = null
                                self.ttipStyle.display = 'none';
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

                    var toolName = "Autodesk.ADN.Viewing.Tool.CustomEvent";

                    _self.load = function() {

                        _self.tool = new AdnTool(viewer, toolName);

                        viewer.toolController.registerTool(_self.tool);

                        viewer.toolController.activateTool(toolName);
                        // AddMarkerPingMian('red',ttip)
                        // ttip = $("#toolTip-span")
                        console.log('Autodesk.ADN.Viewing.Extension.CustomEvent loaded');
                        return true;
                    };

                    _self.unload = function() {
                        self.ttipStyle.display = 'none';
                        viewer.toolController.deactivateTool(toolName);

                        console.log('Autodesk.ADN.Viewing.Extension.CustomEvent unloaded');
                        return true;
                    };
                };

            Autodesk.ADN.Viewing.Extension.CustomEvent.prototype =
                Object.create(Autodesk.Viewing.Extension.prototype);

            Autodesk.ADN.Viewing.Extension.CustomEvent.prototype.constructor =
                Autodesk.ADN.Viewing.Extension.CustomEvent;

            Autodesk.Viewing.theExtensionManager.registerExtension(
                'Autodesk.ADN.Viewing.Extension.CustomEvent',
                Autodesk.ADN.Viewing.Extension.CustomEvent);

        },
        loadModelByModelUrlID(url,callback){
            var url = url.replace('http://localhost:8080','')
            var aj = util.ajax.get(url);
            aj.then(r=>{
                var data = r.data;
                this.modelurlid = data.id;
                this.modelChange(data.urltype1,data.urlid);
                var options = {};
                options.env = "Local";
                if(data.url.startsWith('http')){
                    // east 平台
                    options.document = data.url;
                }
                else if(window.location.host=='test.east-hospital.bimsheng.com'){
                    // 物理机外网east 平台
                    options.document = 'http://modelbucket.oss-cn-shanghai.aliyuncs.com/east_hospital/'+data.url.replace("/static/js/web3d/moxing/",'')
                }else{
                    // 物理机内网
                    options.document = "http://"+window.location.host+data.url
                }
                Autodesk.Viewing.Initializer(options, ()=>{
                    this.loadDocument(options.document,callback); // load first entry by default
                });

            })
        },

        loadInitialModel (urltype1,urlid,callback) {
            
            var aj = util.ajax.get(`/model/rest/modelurl/?&urltype1=${urltype1}&urlid=${urlid}`);
            aj.then(r=>{
                var res=r.data

                if(res.length>0){
                    var data = res[0];
                    this.modelurlid = data.id;
                    this.modelChange(urltype1,urlid);
                    var options = {};
                    options.env = "Local";
                    if(data.url.startsWith('http')){
                        // east 平台
                        options.document = data.url;
                    }
                    else if(window.location.host=='test.east-hospital.bimsheng.com'){
                        // 物理机外网east 平台
                        options.document = 'http://modelbucket.oss-cn-shanghai.aliyuncs.com/east_hospital/'+data.url.replace("/static/js/web3d/moxing/",'')
                    }else{
                        // 物理机内网
                        options.document = "http://"+window.location.host+data.url
                    }
                    Autodesk.Viewing.Initializer(options, ()=>{
                        this.loadDocument(options.document,callback); // load first entry by default
                    });
                }
            })
        },
        loadDocument(urnStr,callback){
            var self=this;
            if(!this._viewer){
                this._viewer = new Autodesk.Viewing.Private.GuiViewer3D(this.$refs.viewer, {});
                this._viewer.initialize();
                this._viewer.load(urnStr);
            }else{
                this._viewer.tearDown()
                this._viewer.setUp(this._viewer.config);
                this._viewer.loadModel(urnStr);
            }
            this._viewer.setGhosting(true);
            self.CustomTool()
            for(var i in this.ExtensionList){
                // this._viewer.unloadExtension(`Autodesk.ADN.Viewing.Extension.${ExtensionList[i]}`);
                this._viewer.loadExtension(`Autodesk.ADN.Viewing.Extension.${this.ExtensionList[i]}`);
            }
            this._viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, function cb(e) {
                try{
                    callback();
                }catch (e){

                }
                
                self.bestYuanQuShow()
                self._viewer.removeEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT,cb)
                self.updateMarkData()
            })
            this.bestYuanQuShow()
            this.addSelectCallback(this.selectcallback);
            this.setContextMenu()
            //红圈标记
            this._viewer.addEventListener(Autodesk.Viewing.CAMERA_CHANGE_EVENT, this.updateMarkData);
        },
        selectcallback(event){
            //模型加载完成回调
            if (event.selections.length>0 && event.selections[0].dbIdArray.length == 1) {
                this._selectedId = event.selections[0].dbIdArray[0]
                this.select(this._selectedId );
            } 

        },
        _getColorByStr(strColor) {
            var color = null;
            if(strColor != undefined && strColor.length == 7) {
                var r = (parseFloat(parseInt(strColor.substr(1, 2), 16) / 255).toFixed(2));
                var g = (parseFloat(parseInt(strColor.substr(3, 2), 16) / 255).toFixed(2));
                var b = (parseFloat(parseInt(strColor.substr(5, 2), 16) / 255).toFixed(2));

                color = new THREE.Vector4(r, g, b, 0.5); // r, g, b, intensity
            }
            return color;
        },
        setContextMenu() {
            var self=this;
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
                    if(self._selectedId) {
                        menu.push({
                            title: "关联本地文件",
                            target: function() {
                                self.addLocalFile()
                            }
                        });
                        menu.push({
                            title: "关联云端文件",
                            target: function() {
                                self.addCloudFile()
                            }
                        });
                        menu.push({
                            title: "发起报修",
                            target: function() {
                                self.addEvent()
                            }
                        });
                        menu.push({
                            title: "添加维保计划",
                            target: function() {
                                 self.addEventTask()
                            }
                        });
                        if(self.urltype1=='mepsystemtype'){
                            menu.push({
                                title: "查看楼层模型",
                                target: function() {
                                    var aj = self.getPB(self._selectedId)
                                    aj.then(r=>{
                                        var res = r.data
                                        if(res.length>0){
                                            var a = res[0].floor.split('/')
                                            var floorid = a[a.length-2];
                                            util.ajax.get(`/model/rest/modelurl2model/?model=${res[0].id}&modelurl__urltype1=floor&modelurl__urlid=${floorid}`).then(r1=>{
                                                var mu =r1.data
                                                if(mu.results.length>0){
                                                    self.loadModelByModelUrlID(mu.results[0].modelurl,()=>{
                                                        self.bestShow(mu.results.dbid)
                                                    })
                                                }
                                            })
                                        }
                                        
                                    })
                                }
                            });
                        }
                        else if(self.urltype1=='floor'){
                            menu.push({
                                title: "查看系统模型",
                                target: function() {
                                    var aj = self.getPB(self._selectedId)
                                    aj.then(r=>{
                                        var res = r.data
                                        if(res.length>0){

                                            util.ajax.get(`/model/rest/modelurl2model/?model=${res[0].id}&modelurl__urltype1=mepsystemtype`).then(r1=>{
                                                var mu = r1.data;
                                                if(mu.results.length>0){
                                                    self.loadModelByModelUrlID(mu.results[0].modelurl,()=>{
                                                        self.bestShow(mu.results.dbid)
                                                    })
                                                }
                                            })
                                        }
                                        
                                    })
                                }
                            });
                        }
                    }
                    return menu;
                };

            self._viewer.setContextMenu(new Autodesk.ADN.Viewing.Extension.AdnContextMenu(self._viewer));

        },
        tikuai(){
            var self = this;
            if(this.urltype1=='space'){
                util.ajax.get('/prj/facility/1/').then(r=>{
                    var res =r.data;
                    self._viewer.hide(1);
                    self._viewer.show(res.roomdbid)
                })
            }else{
                this.$Message.info('请先切换到空间模型');
            }

        },
        changeColor(v){
            //v = 'department'  'category'
            // 按照部门 或者用途渲染 房间体块
            var self  = this;
            this.tikuai()
            util.ajax.get(`/space/color/${v}/`).then((res)=>{
                var data = res.data
                self._viewer.clearThemingColors();
                for(var i in data.data){
                    var cv = data.data[i].color;
                    var c = self._getColorByStr(cv);
                    for(var j in data.data[i].roomdbid){
                        self._viewer.setThemingColor(data.data[i].roomdbid[j], c);
                    }
                   
                }

            })
        },
        add3DTxt(txt,selectdbid,color){
            // 在物体dbid 上面加3d文字
            var firstmodel = this._viewer.impl.modelQueue().getModels()[0];
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
            this._currentShapeList.push(_currentShape);
            this._viewer.impl.scene.add(_currentShape);
            this._viewer.impl.invalidate(true) ;
          
        },
        remove3DTxt(){
            // 删除3d文字 
            for(var i in this._currentShapeList){//移除房间标示
                this._viewer.impl.scene.remove(_currentShapeList[i]);
            }
            this._currentShapeList = []
            this._viewer.impl.invalidate(true) ;
        },
        bestShow(v){
            if((v instanceof Array)){
                if(v.length>0){
                    this.removeSelectCallback(this.selectcallback)
                    // this._viewer.hide(1)
                    // this._viewer.show(v)
                    this._viewer.select(v);
                    this._viewer.fitToView(v);
                    this.addSelectCallback(this.selectcallback)
                }

            }else if(!isNaN(v)&&v){
                this.removeSelectCallback(this.selectcallback)
                // this._viewer.hide(1)
                // this._viewer.show(v)
                this._viewer.select(v);
                this._viewer.fitToView(v);
                this.addSelectCallback(this.selectcallback)
            }
            else{
                console.log("构件数据匹配错误")
            }
            
        },
        bestYuanQuShow(){
            var  camera;
            if(this.urltype1=='yuanqu'){
                this._viewer.setLightPreset(1);
                this._viewer.setLightPreset(15);
                 camera = {"guid":"cfe9aa6c16305e526b1","seedURN":"/static/js/web3d/moxing/DFYYsvf/DFYY_All.SVF","overrides":{"transformations":[]},"objectSet":[{"id":[3626],"isolated":[],"hidden":[],"explodeScale":0,"idType":"lmv"}],"viewport":{"name":"","eye":[-11744.920060471926,7169.062070184467,-7369.234046021131],"target":[-16456.363871183567,24666.891136564354,-19242.508345656417],"up":[-0.14249345263326207,0.5292063701548242,0.8364426063659166],"worldUpVector":[0,0,1],"pivotPoint":[-13833.784423828125,24472.0283203125,-20570.3486328125],"distanceToOrbit":21664.403232309945,"aspectRatio":1.625227922688624,"projection":"perspective","isOrthographic":false,"fieldOfView":45},"renderOptions":{"environment":"Photo Booth","ambientOcclusion":{"enabled":true,"radius":10,"intensity":0.4},"toneMap":{"method":1,"exposure":0,"lightMultiplier":-1},"appearance":{"ghostHidden":false,"ambientShadow":true,"antiAliasing":true,"progressiveDisplay":true,"swapBlackAndWhite":false,"displayLines":true}},"cutplanes":[],"cameraTween":{"viewport":{"name":"","eye":[-11744.920060471926,7169.062070184467,-7369.234046021131],"target":[-16456.363871183567,24666.891136564354,-19242.508345656417],"up":[-0.14249345263326207,0.5292063701548242,0.8364426063659166],"worldUpVector":[0,0,1],"pivotPoint":[-13833.784423828125,24472.0283203125,-20570.3486328125],"distanceToOrbit":21664.403232309945,"aspectRatio":1.625227922688624,"projection":"perspective","isOrthographic":false,"fieldOfView":45}}};
                this._viewer.CameraRestoreState(camera);
            }else{
                this._viewer.setLightPreset(1);
                this._viewer.setBackgroundColor(46, 51,70, 46, 51,70);
            }
        },
        addSelectCallback(f){
            this._viewer.addEventListener(Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT, f?f:this.selectcallback);
        },
        removeSelectCallback(f){
            this._viewer.removeEventListener(Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT, f?f:this.selectcallback);
        },
        updateMarkData(){
          var self=this;
          this.marklist.forEach(function(obj){
            if(obj.dbinfo!=null){
                self.worldToClient(obj)
            }
            
          })
        },
        splitModelByFoolLevel(level) {
            var dif = ((level - 15.95)) * (1000 / 304.8);
            var x = -111.483 + dif;
            var y = 91 - dif;
            // _viewer.setCutPlanes([new THREE.Vector4(0, 0, -1, x), new THREE.Vector4(0, 0, 1, y)]);
            this._viewer.setCutPlanes([new THREE.Vector4(0, 0, 1, y)]);
        },
        
        getParentList(dbid){
            if(dbid==1){
                return
            }
            this.plist.push(dbid)
            var m = this._viewer.impl.modelQueue().getModels()
            var pa = m[0].getData().instanceTree.getNodeParentId(dbid)
            if(pa==1){
                return
            }else{
                this.getParentList(pa)
            }
        },
        getDevice1(dbid){
            // 获取设备
            this.plist = [];
            this.getParentList(dbid);
            var source = util.CancelToken.source()
            var aj = util.ajax.get(`/device/device1/?model__ModelUrl2Model__dbid__in=${this.plist}&model__ModelUrl__urlid=${this.urlid}&model__ModelUrl__urltype1=${this.urltype1}`,{cancelToken: source.token});
            // aj.then(r=>{
            //     var res = r.data;
            //     if(callback){
            //         callback(res.results)
            //     }
                
            // })
            aj.source = source
            return aj
        },
        getDevice2(dbid){
            // 获取设备
            this.plist = [];
            this.getParentList(dbid);
            var aj = util.ajax.get(`/device/device2/?model__ModelUrl2Model__dbid__in=${this.plist}&model__ModelUrl__urlid=${this.urlid}&model__ModelUrl__urltype1=${this.urltype1}`,{cancelToken: source.token});
            // aj.then(r=>{
            //     var res = r.data;
            //     if(callback){
            //         callback(res.results)
            //     }
                
            // })
            aj.source = source
            return aj
        },
        getDevice(dbid){
            // 获取设备
            this.plist = [];
            this.getParentList(dbid);
            var source = util.CancelToken.source()
            var aj = util.ajax.get(`/device/device/?model__ModelUrl2Model__dbid__in=${this.plist}&model__ModelUrl__urlid=${this.urlid}&model__ModelUrl__urltype1=${this.urltype1}`,{cancelToken: source.token});
            // aj.then(r=>{
            //     var res = r.data;
            //     if(callback){
            //         callback(res.results)
            //     }
                
            // })
            aj.source = source
            return aj
        },
        getPB(dbid){
            // 获取构件属性
            this.plist = [];
            this.getParentList(dbid);
            var source = util.CancelToken.source()
            var aj = util.ajax.get(`/model/rest/pb/?ModelUrl2Model__dbid__in=${this.plist}&ModelUrl__urlid=${this.urlid}&ModelUrl__urltype1=${this.urltype1}`,{cancelToken: source.token})
            // var aj.done(res=>{
            //     // this.value = 
            //     if(callback){
            //         callback(res)
            //     }
            // })
            aj.source = source
            return aj
        },
        getRoom (dbid){
            // 获取房间
            var source = util.CancelToken.source()
            var aj = util.ajax.get(`/space/room/?modeldbid=${dbid}`,{cancelToken: source.token})
            aj.source = source
            return aj
        },
        getFloor(dbid){
            var source = util.CancelToken.source()
            var aj = util.ajax.get(`/space/floor/?model__ModelUrl2Model__modelurl=${this.modeldbid}&model__ModelUrl2Model__dbid=${dbid}`,{cancelToken: source.token})
            aj.source = source
            return aj
        },
        getPark(dbid){
            // 获取园区构件属性
            this.plist = [];
            this.getParentList(dbid);
            var source = util.CancelToken.source()
            var aj = util.ajax.get(`/model/rest/pb/?ModelUrl2Model__dbid__in=${this.plist}&ModelUrl__urlid=${this.urlid}&ModelUrl__urltype1=${this.urltype1}`,{cancelToken: source.token})
            aj.source = source
            return aj
        },
        loadGarden(){
            this.loadInitialModel('yuanqu',0,this.bestYuanQuShow);
        }
    },
    mounted () {
        if((window.location.pathname.indexOf('dealevent') + window.location.pathname.indexOf('watch'))<0){
            this.loadInitialModel('yuanqu',0,this.bestYuanQuShow);
        }
        
    },
    watch:{
        urltype1(value){
            this.$store.commit('setModel',{type:value});
        },
        urlid(value){
            this.$store.commit('setModel',{value});
        }
    }
}
