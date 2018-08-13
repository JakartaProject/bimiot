/////////////////////////////////////////////////////////////////////
// Autodesk.ADN.Viewing.Extension.DockingPanelSensor
// by Philippe Leefsma, May 2015
//
/////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

Autodesk.ADN.Viewing.Extension.DockingPanelSensor = function(viewer, options) {

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
      console.log('Autodesk.ADN.Viewing.Extension.DockingPanelSensor loaded');
    return true;
  };

  /////////////////////////////////////////////////////////////////
  //  Extension unload callback
  //
  /////////////////////////////////////////////////////////////////
  this.unload = function() {
    _panel.setVisible(false);
    console.log('Autodesk.ADN.Viewing.Extension.DockingPanelSensor unloaded');
    return true;
  };

  Autodesk.Viewing.Viewer3D.prototype.LoadPanelSensor = function(show,pbid=240) {
    const type = moxing.type==='mepsystemtype'?'model__systemlmvdbid':'room__floor__facility';
    if(show == undefined) {
      if(_panel.isVisible()) {
        _panel.setVisible(false);
      } else {
        _panel.setVisible(true);
          $.ajax({
              url: '/device/device/',
              data:{
                  [type]: pbid
              }
          }).done(res=>{
              res = res[0];
              const id = res.devicetype.split('/')[res.devicetype.split('/').length-1];
              loadDeviceModel('devicetype', id*0, ()=>{});///todo replace id*0 width id after model info upload
              secondary.setID(res.id)
          })
      }
    } else {
      _panel.setVisible(show);
      if(show){
          $.ajax({
              url: '/device/device/',
              data:{
                  [type]: pbid
              }
          }).done(res=>{
              res = res[0];
              const id = res.devicetype.split('/')[res.devicetype.split('/').length-1];
              loadDeviceModel('devicetype', id*0, ()=>{
                  _subviewer.setGhosting(true);
                  _subviewer.hide([59,62,63,29,30]);
              });///todo replace id*0 width id after model info upload
              secondary.setID(res.id)
          })
      }
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
      '设备详情', {
        shadow: true
      });

      var isShowtitle = true;
      var labeldis = 5;
      var detailfontsize = 30;

      $(_thisPanel.container).addClass('docking-panel-Sensor');
      var pagewidth = $("#viewer").width();
      var pageheight = $(window).height();
      var left = pagewidth - 620;
      var top = (pageheight - 800) * 0.5 < 0 ? 0 : (pageheight - 800) * 0.5;
      $('#' + id).css({
        'width': 600 + 'px',
        'height': 500 + 'px',
        'top': top + 'px',
        'left': left + 'px',
      });
      $(_thisPanel.container).append("<div id='subdevice'></div>");
      initSubDevice();
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

Autodesk.ADN.Viewing.Extension.DockingPanelSensor.prototype =
  Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.DockingPanelSensor.prototype.constructor =
  Autodesk.ADN.Viewing.Extension.DockingPanelSensor;

Autodesk.Viewing.theExtensionManager.registerExtension(
  'Autodesk.ADN.Viewing.Extension.DockingPanelSensor',
  Autodesk.ADN.Viewing.Extension.DockingPanelSensor);

var _subdevice,secondary;
function cameraChange(){
  updateSensorDate();
}

function initSubDevice(){
    secondary = new Vue({
        template:`
                <div>
                    <Tabs value="name1">
                        <TabPane label="设备模型" name="name1">
                            <div id="subviewer">
                            </div>
                        </TabPane>
                        <TabPane label="历史数据" name="name2">
                            <div id="secondaryChart" style="width: 600px;height:430px;"></div>
                            <div v-if="count===0" style='width: 600px;height:430px;position: absolute;top:0;background-color: white;display:flex;'><h3>暂无数据</h3></div>
                        </TabPane>
                        <TabPane label="监控列表" name="name3">
                            <Table border :columns="columns" :data="monitoring"></Table>
                        </TabPane>
                        <TabPane label="设备信息" name="name4">
                            <row>
                                <Col :span="3">
                                    <ButtonGroup vertical style="padding:5px">
                                        <Button type="primary" @click="go('up')" icon="arrow-up-a"  title="向上溯源"></Button>
                                        <Button type="primary" @click="go('down')" icon="arrow-down-a"  title="向下溯源"></Button>
                                        <Button type="warning" title="显示三维逻辑">3D</Button>
                                        <Button type="warning" title="显示二维逻辑">2D</Button>
                                        <Button type="success" icon="alert-circled" @click="open(1)"  title="预警信息">警</Button>
                                        <Button type="success" icon="wrench" @click="open(2)" title="维修工单">修</Button>
                                        <Button type="success" icon="settings" @click="open(3)" title="维保工单">保</Button>
                                    </ButtonGroup>
                                </Col>
                                <Col :span="12">
                                    <Form :label-width="80" style='height:500px;overflow-y:auto' class='extension'>
                                        <row>
                                            <Col span="24" v-for="item of device">
                                                <FormItem :label="item.key">
                                                    <span>{{item.value}}</span>
                                                </FormItem>
                                            </Col>
                                        </row>
                                        <!--<FormItem label="文件">-->
                                            <!--<a v-for="file in devicefile" :href="file.url" target="_blank">-->
                                                <!--<Tag type="border">{{file.name}}</Tag>-->
                                            <!--</a>-->
                                        <!--</FormItem>-->
                                    </Form>
                                </Col>
                                <!--<Col span="9">-->
                                    <!--<Card style="margin-left: 5px;">-->
                                        <!--<p slot="title">-->
                                            <!--<Icon type="social-buffer-outline"></Icon>-->
                                            <!--溯源设备列表-->
                                        <!--</p>-->
                                        <!--<ul>-->
                                            <!--<li v-for="item in selectDevice">-->
                                                <!--<Tag type="border" color="red"  @click.native="deviceTagClick(item);" >{{ item.serialnumber }}</Tag>-->
                                            <!--</li>-->
                                        <!--</ul>-->
                                    <!--</Card>-->
                                <!--</Col>-->
                            <!--</row>-->
                        </TabPane>
                    </Tabs>
                  </div>
        `,
        data(){
            return {
                monitoring: [],
                id: '',
                ids:[],
                page: 1,
                ajax: '',
                data: {},
                chart: '',
                columns:[
                    {
                        title: '传感器',
                        key: 'name'
                    },
                    {
                        title: '数值',
                        key: 'value'
                    }
                ],
                get dataRange(){
                    return [(new Date((new Date())*1-2592000000)).remoteFormate(), (new Date()).remoteFormate()].join(',');
                },
                device:[],
                count: 0
            }
        },
        methods:{
            setID(id){
                (this.ajax) && (this.ajax.abort());
                this.id = id;
                this.ids = [id];
                this.page = 1;
                this.data = {};
                this.start();
                this.chart ? this.chart.clear() : this.chart = echarts.init(document.getElementById('secondaryChart'));
                let option = {
                    title: {
                        text: '传感器数据'
                    },
                    tooltip: {
                        trigger: 'axis',
                        formatter: function (param) {
                            return param[0].seriesName + ':'+ param[0].value[1]
                        }
                    },
                    dataZoom: [
                        {
                            id: 'dataZoomX',
                            type: 'slider',
                            xAxisIndex: [0],
                            filterMode: 'filter'
                        }
                    ],
                    xAxis: {
                        type: 'time',
                        splitLine: {
                            show: false
                        }
                    },
                    yAxis: {
                        type: 'value',
                        boundaryGap: [0, '100%'],
                        splitLine: {
                            show: false
                        }
                    },
                    series: []
                };
                this.chart.setOption(option);
                $.ajax({
                    url: `/device/device2/${id}/`
                }).done(res=>{
                    let arr = [];
                    arr.push({key: '编号', value: res.serialnumber});
                    arr.push({key: '状态', value: (()=>{
                        let [a,b,c]= res.status.split('');
                        return `${a!=0?'维修中 ':''}${b!=0?'维保中 ':''}${c!=0?'有警告 ':''}${a==0&&b==0&&c==0?'正常':""}`;
                    })()});
                    arr.push({key: '空间位置', value: res.spacestr});
                    arr.push({key: '设备类型', value: res.name});
                    arr.push({key: '所属系统', value: res.mepsystemname.join(',')});
                    this.device = arr;
                });
                $.ajax({
                    url: '/file/rest/doc2relate/',
                    data:{
                        relatetype: 'device',
                        relateid: id
                    }
                }).done(res=>{

                })
            },
            refresh(){
                this.chart.setOption({
                    series: (value=>{
                        let arr = [],arry=[];
                        for(let i in value){
                            arr.push(value[i]);
                            arry.push({name:value[i].name, value: value[i].data[0].value[1]})
                        }
                        this.monitoring = arry;
                        return arr;
                    })(this.data)
                });
            },
            start(){
                this.ajax = $.ajax({
                    url: '/device/sensordata/',
                    data:{
                        sensor__device:this.id,
                        stime__range: this.dataRange,
                        ordering: '-stime',
                        pagesize:1000
                    }
                });
                this.ajax.done(res=>{
                    res.results.forEach(t=>{
                        this.count = t.count;
                        const sensorName = 'sensor' + (t.sensor).split('/')[5];
                        if(this.data[sensorName]){
                            this.data[sensorName].data.push( { id: t.id,value:[t.stime, t.data] } );
                        } else {
                            this.$set(this.data,sensorName,{
                                name: t.sensorname,
                                type: 'line',
                                smooth:true,
                                symbol: 'none',
                                sampling: 'average',
                                data:[{ id: t.id,value:[t.stime, t.data] }]
                            })
                        }
                    });
                    secondary.refresh();
                    res.next?this.next(res.next):this.remote();
                })
            },
            next(url){
                this.ajax = $.ajax(url);
                this.ajax.done(res=>{
                    res.results.forEach(t=>{
                        const sensorName = 'sensor' + (t.sensor).split('/')[5];
                        if(this.data[sensorName]){
                            this.data[sensorName].data.push( { id: t.id,value:[t.stime, t.data] } );
                        } else {
                            this.$set(this.data,sensorName,{
                                name: t.sensorname,
                                type: 'line',
                                smooth:true,
                                symbol: 'none',
                                sampling: 'average',
                                data:[{ id: t.id,value:[t.stime, t.data] }]
                            })
                        }
                    });
                    secondary.refresh();
                    res.next ? this.next(res.next):this.remote();
                })
            },
            remote(){
                this.ajax = $.ajax({
                    url: '/device/sensordata/',
                    data:{
                        sensor__device:this.id,
                        ordering: 'stime',
                        id__gt:(value=>{
                            let id = 0;
                            for (let i in value){
                                const currentId = _.last(value[i].data).id;
                                (currentId > id)&&(id = currentId)
                            }
                            return id;
                        })(this.data),
                        pagesize:1000
                    }
                });
                this.ajax.done(res=>{
                    if(res.results.length>0){
                        res.results.forEach(t=>{
                            const sensorName = 'sensor' + (t.sensor).split('/')[5];
                            if(this.data[sensorName]){
                                const lastIndex = _.findLastIndex(this.data[t.url],value=>{
                                    return new Date(value.value[0])<new Date(new Date((new Date())*1-2592000000))
                                });
                                this.data = this.data.slice(lastIndex);
                                this.data[sensorName].data.unshift( { id: t.id,value:[t.stime, t.data] } );
                            } else {
                                this.$set(this.data,sensorName,{
                                    name: t.sensorname,
                                    type: 'line',
                                    smooth:true,
                                    symbol: 'none',
                                    sampling: 'average',
                                    data:[{ id: t.id,value:[t.stime, t.data] }]
                                })
                            }
                        });
                        secondary.refresh();
                    }
                    this.interrupter = setTimeout(()=>{
                        this.remote();
                    },1800000)
                })
            },
            go(type){
                this.downloading = true;
                this.uploading = true;
                var tmpSelectDevice = [];
                var isover = this.ids.length;
                var dbids = [];
                const [devicep,devicekey] = type === 'up'?['device1_id', 'device2']:['device2_id','device1'];
                const dbidkey = moxing.type === 'floor' ? 'floorlmvdbid' : 'systemlmvdbid';
                for(var d in this.ids){
                    $.ajax({
                        url:`/device/deviceconnection/?${devicep}=${this.ids[d]}`,
                    }).done((res)=>{
                        for(var i in res){
                            res[i].dbid.forEach(dbid=>{
                                dbids.push(dbid[dbidkey])
                            });
                            tmpSelectDevice.push(res[i][devicekey]);
                        }
                        isover += -1;
                        if(isover===0){
                            if(tmpSelectDevice.length===0){
                                this.$Message.warning({
                                    content: '没有相关的设备'
                                })
                            } else {
                                _viewer.select(tmpSelectDevice);
                                _viewer.fitToView(tmpSelectDevice);
                            }
                        }
                    });
                }
            },
            open(value){
                switch (value){
                    case 1:window.open('/device/warn/');break;
                    case 2:window.open('/repair/manage/');break;
                    case 3:window.open('/device/manage/');break;
                }
            }
        },
        computed:{

        },
        watch:{
        }
    });
    secondary.$mount("#subdevice");
}
function loadDeviceComplete(){

}

function updateSensorDate(){

}

function transViewCustom(){
  var newCamPos = new THREE.Vector3(-0.9476211667060852,0.3321802616119385,14.724390029907227);
  var target = new THREE.Vector3(0,0,0);
  var cam=_subviewer.navigation.getCamera();
  var newRotation = new THREE.Vector3(-0.022556039541616293,-0.06425230550985349,1.2766917848834338);
  cam.setRotationFromAxisAngle(newRotation);
  // _subviewer.navigation.setRequestTransition(true,newCamPos,target,cam.fov);
  _subviewer.navigation.setView(newCamPos,target);
}

function worldToClient(dbid){
  var it = _subviewer.model.getData().instanceTree;
  // var fragIds = [];
  it.enumNodeFragments(dbid,(fragId,dbid)=>{
    // fragIds.push(dbid);
    var nodebBox = new THREE.Box3();
    var fragbBox = new THREE.Box3();
    var fragList = _subviewer.model.getFragmentList();
    // fragIds.forEach(function(fragId) {
      fragList.getWorldBounds(fragId, fragbBox);
      nodebBox.union(fragbBox);
    // });

    var center = nodebBox.center();
    // var m = _subviewer.worldToClient(nodebBox.min);
    var c = _subviewer.worldToClient(center);
    // var x = c.x+dbidSensorMap[dbid].p[0];
    // var y = c.y+dbidSensorMap[dbid].p[1];
    var x = c.x;
    
  },true);
  
}

function SelectedCallback (object){
    console.log(object.dbIdArray[0]);
}

Date.prototype.remoteFormate = function () {
    const date = this;
    if(date > new Date("2000/01/01")) {
        return `${date.getFullYear()}-${("0" + (date.getMonth() + 1)).slice(-2)}-${("0" + (date.getDate())).slice(-2)}T${("0" + (date.getHours())).slice(-2)}:${("0" + (date.getMinutes())).slice(-2)}:${("0" + (date.getSeconds())).slice(-2)}`;
    }
}
/**
 *  @class sensor
 *  @varable id, page, data, ajax
 *  @constructor
 */
class sensor{
    /**
     *
     * @param {Number} id
     * @constructor
     * @description 构造sensor，初始参数为设备ID和
     */
    constructor(id){
        this.id = id;
        this.page = 1;
        this.data = [];
        if(this.ajax) this.ajax.abort();
        this.start();
    }

    /**
     *
     * @param {Number} id
     * @description 抛弃未完成的ajax，初始化参数
     */
    newOne(id){
        clearTimeout(this.interrupter);
        this.id = id;
        this.page = 1;
        this.data = [];
        if(this.ajax) this.ajax.abort();
        this.start();
    }
    get chartData(){
        return this.data;
    }
    static get dataRange(){
        return [(new Date()).remoteFormate(),(new Date((new Date())*1-2592000000)).remoteFormate()];
    }
    start(){
        this.ajax = $.ajax({
            url: '/device/sensordata/',
            data:{
                sensor__device:this.id,
                stime__range: this.dataRange,
                ordering: '-stime'
            }
        });
        this.ajax.done(res=>{
            res.results.forEach(t=>{
                const sensorName = 'sensor' + (t.sensor).split('/')[5];
                if(this.data[sensorName]){
                    this.data[sensorName].data.push( { id: t.id,value:[t.stime, t.data] } );
                } else {
                    this.data[sensorName] = {
                        name: t.sensorname,
                        type: 'line',
                        smooth:true,
                        symbol: 'none',
                        sampling: 'average',
                        data:[{ id: t.id,value:[t.stime, t.data] }]
                    };
                }
            });
            secondary.refresh();
            res.next?this.next(res.next):this.remote();
        })
    }
    next(url){
        this.ajax = $.ajax(url);
        this.ajax.done(res=>{
            res.results.forEach(t=>{
                const sensorName = 'sensor' + (t.sensor).split('/')[5];
                if(this.data[sensorName]){
                    this.data[sensorName].data.push( { id: t.id,value:[t.stime, t.data] } );
                } else {
                    this.data[sensorName] = {
                        name: t.sensorname,
                        type: 'line',
                        smooth:true,
                        symbol: 'none',
                        sampling: 'average',
                        data:[{ id: t.id,value:[t.stime, t.data] }]
                    };
                }
            });
            secondary.refresh();
            res.next ? this.next(res.next):this.remote();
        })
    }
    remote(){
        this.ajax = $.ajax({
            url: '/device/sensordata/',
            data:{
                sensor__device:this.id,
                ordering: 'stime',
                id__gt:(value=>{
                    let id = 0;
                    for (let i in value){
                        const currentId = _.last(value[i].data).id;
                        (currentId > id)&&(id = currentId)
                    }
                    return id;
                })(this.data)
            }
        });
        this.ajax.done(res=>{
            if(res.results.length>0){
                res.results.forEach(t=>{
                    const sensorName = 'sensor' + (t.sensor).split('/')[5];
                    if(this.data[sensorName]){
                        const lastIndex = _.findLastIndex(this.data[t.url],value=>{
                            return new Date(value.value[0])<new Date(new Date((new Date())*1-2592000000))
                        });
                        this.data = this.data.slice(lastIndex);
                        this.data[sensorName].data.unshift( { id: t.id,value:[t.stime, t.data] } );
                    } else {
                        this.data[sensorName] = {
                            name: t.sensorname,
                            type: 'line',
                            symbol: 'none',
                            smooth:true,
                            sampling: 'average',
                            data:[{ id: t.id,value:[t.stime, t.data] }]
                        };
                    }
                });
                secondary.refresh();
            }
            this.interrupter = setTimeout(()=>{
                this.remote();
            },1800000)
        })
    }
}