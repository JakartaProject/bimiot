///////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");
Autodesk.ADN.Viewing.Extension.Skybox = function(viewer, options) {
  Autodesk.Viewing.Extension.call(this, viewer, options);

//  var overlayName = "temperary-Skyboxed-overlay";
var _self = this;
_self.stopwatch = new Stopwatch()
function AdnTool(viewer, toolName) {

  this.getNames = function() {

    return [toolName];
  };

  this.getName = function() {

    return toolName;
  };

  this.activate = function(name) {


  };

  this.deactivate = function(name) {

  };

  this.update = function(t) {

    return false;
  };

  this.handleSingleClick = function(event, button) {

    return false;
  };

  this.handleDoubleClick = function(event, button) {

    return false;
  };


  this.handleSingleTap = function(event) {

    return false;
  };


  this.handleDoubleTap = function(event) {

    return false;
  };


  this.handleKeyDown = function(event, keyCode) {

    return false;
  };

  this.handleKeyUp = function(event, keyCode) {
    return false;
  };


  this.handleWheelInput = function(delta) {

    window.clearTimeout(this.timeoutId)

    _self.timeoutId = window.setTimeout(() => {
      _self.stopwatch.getElapsedMs()
              // _self.userInteraction = false
              _self.runAnimation()
            }, 3500)

            // _self.userInteraction = true

            return false
          };

          this.handleButtonDown = function(event, button) {
            window.clearTimeout(this.timeoutId)

            // this.userInteraction = true

            return false
          };

          this.handleButtonUp = function(event, button) {

            this.timeoutId = window.setTimeout(() => {
              this.stopwatch.getElapsedMs()
              this.runAnimation()
            }, 3500)

            // this.userInteraction = false

            return false
          };

          this.handleMouseMove = function(event,button) {

            return false;
          };

          this.handleGesture = function(event) {


            return false;
          };

          this.handleBlur = function(event) {

            return false;
          };

          this.handleResize = function() {

          };
        }
        var toolName = "Autodesk.ADN.Viewing.Tool.Skyboxtool";
        this.unload = function() {
          console.log('Autodesk.ADN.Viewing.Extension.Skybox unloaded');
          window.cancelAnimationFrame(_self.animId)
          _self.skybox.destory(viewer)
          this.viewer.removeEventListener(
            Autodesk.Viewing.CAMERA_CHANGE_EVENT,
            this.onCameraChanged)

          // this.userInteraction = true

          viewer.toolController.deactivateTool(toolName);
          return true;
        };
        this.load = function() {
          _self.userInteraction=true
          _self.eventTool = new AdnTool(viewer, toolName);

          viewer.toolController.registerTool(_self.eventTool);

          viewer.toolController.activateTool(toolName);
          this.onCameraChanged = this.onCameraChanged.bind(this)

          this.runAnimation = this.runAnimation.bind(this)

          var imageList;
          const size = new THREE.Vector3()
          if(moxing.type=='yuanqu'){
            imageList = ['','','','','',''
            // '/static/js/web3d/Extension/Autodesk.ADN.Viewing.Extension.Skybox/img/skybox-xpos.png?1',
            // '/static/js/web3d/Extension/Autodesk.ADN.Viewing.Extension.Skybox/img/skybox-xneg.png?1',
            // '/static/js/web3d/Extension/Autodesk.ADN.Viewing.Extension.Skybox/img/skybox-ypos.png?1',
            // '/static/js/web3d/Extension/Autodesk.ADN.Viewing.Extension.Skybox/img/skybox-yneg.png?1',
            // '/static/js/web3d/Extension/Autodesk.ADN.Viewing.Extension.Skybox/img/skybox-zpos.png?1', 
            // '/static/js/web3d/Extension/Autodesk.ADN.Viewing.Extension.Skybox/img/skybox-zneg.png?1',
            // '/static/js/web3d/Extension/Autodesk.ADN.Viewing.Extension.Skybox/img/black.jpg?v2',
            // '/static/js/web3d/Extension/Autodesk.ADN.Viewing.Extension.Skybox/img/black.jpg?v2',
            // '/static/js/web3d/Extension/Autodesk.ADN.Viewing.Extension.Skybox/img/black.jpg?v2',
            // '/static/js/web3d/Extension/Autodesk.ADN.Viewing.Extension.Skybox/img/black.jpg?v2',
            // '/static/js/web3d/Extension/Autodesk.ADN.Viewing.Extension.Skybox/img/black.jpg?v2',
            // '/static/js/web3d/Extension/Autodesk.ADN.Viewing.Extension.Skybox/img/black.jpg?v2',
            // '/static/js/web3d/Extension/Autodesk.ADN.Viewing.Extension.Skybox/img/tm.png',
            // '/static/js/web3d/Extension/Autodesk.ADN.Viewing.Extension.Skybox/img/tm.png',
            // '/static/js/web3d/Extension/Autodesk.ADN.Viewing.Extension.Skybox/img/tm.png',
            // '/static/js/web3d/Extension/Autodesk.ADN.Viewing.Extension.Skybox/img/tm.png',
            // '/static/js/web3d/Extension/Autodesk.ADN.Viewing.Extension.Skybox/img/tm.png',
            // '/static/js/web3d/Extension/Autodesk.ADN.Viewing.Extension.Skybox/img/tm.png',
            ]
            size.fromArray([5000000, 5000000, 5000000] || [5000000, 5000000, 5000000])
          }else{
            imageList = ['','','','','',''
            // '/static/js/web3d/Extension/Autodesk.ADN.Viewing.Extension.Skybox/img/skybox-xpos.png?1',
            // '/static/js/web3d/Extension/Autodesk.ADN.Viewing.Extension.Skybox/img/skybox-xneg.png?1',
            // '/static/js/web3d/Extension/Autodesk.ADN.Viewing.Extension.Skybox/img/skybox-ypos.png?1',
            // '/static/js/web3d/Extension/Autodesk.ADN.Viewing.Extension.Skybox/img/skybox-yneg.png?1',
            // '/static/js/web3d/Extension/Autodesk.ADN.Viewing.Extension.Skybox/img/skybox-zpos.png?1', 
            // '/static/js/web3d/Extension/Autodesk.ADN.Viewing.Extension.Skybox/img/skybox-zneg.png?1',
            // '/static/js/web3d/Extension/Autodesk.ADN.Viewing.Extension.Skybox/img/hui.png?v1',
            // '/static/js/web3d/Extension/Autodesk.ADN.Viewing.Extension.Skybox/img/hui.png?v1',
            // '/static/js/web3d/Extension/Autodesk.ADN.Viewing.Extension.Skybox/img/hui.png?v1',
            // '/static/js/web3d/Extension/Autodesk.ADN.Viewing.Extension.Skybox/img/hui.png?v1',
            // '/static/js/web3d/Extension/Autodesk.ADN.Viewing.Extension.Skybox/img/hui.png?v1',
            // '/static/js/web3d/Extension/Autodesk.ADN.Viewing.Extension.Skybox/img/hui.png?v1',
            // '/static/js/web3d/Extension/Autodesk.ADN.Viewing.Extension.Skybox/img/tm.png',
            // '/static/js/web3d/Extension/Autodesk.ADN.Viewing.Extension.Skybox/img/tm.png',
            // '/static/js/web3d/Extension/Autodesk.ADN.Viewing.Extension.Skybox/img/tm.png',
            // '/static/js/web3d/Extension/Autodesk.ADN.Viewing.Extension.Skybox/img/tm.png',
            // '/static/js/web3d/Extension/Autodesk.ADN.Viewing.Extension.Skybox/img/tm.png',
            // '/static/js/web3d/Extension/Autodesk.ADN.Viewing.Extension.Skybox/img/tm.png',
            ]
            size.fromArray([5000000, 5000000, 5000000] || [5000000, 5000000, 5000000])
          }

          _self.skybox = new ViewerSkybox(viewer, {
            imageList,
            size
          })




          this.viewer.addEventListener(
            Autodesk.Viewing.CAMERA_CHANGE_EVENT,
            this.onCameraChanged)



          console.log('Autodesk.ADN.Viewing.Extension.Skybox loaded');

          return true;
        }
      /////////////////////////////////////////////////////////
  // Setup navigation
  //
  /////////////////////////////////////////////////////////
  _self.configureNavigation = function() {

    const nav = this.viewer.navigation

    nav.setLockSettings({
      pan: true
    })

    this.bounds = new THREE.Box3(
      new THREE.Vector3(-1000, -1000, -1000),
      new THREE.Vector3(1000, 1000, 1000))

    nav.fitBounds(true, this.bounds)

    this.viewer.setViewCube('front')

    nav.toPerspective()

    setTimeout(() => {
      this.viewer.autocam.setHomeViewFrom(
        nav.getCamera())
      this.options.loader.show(false)
    }, 2000)
  }

    /////////////////////////////////////////////////////////
    // Model completed load callback
    //
    /////////////////////////////////////////////////////////
    _self.onModelCompletedLoad = function(event) {

      if (event.model.dbModelId) {

        const urn = this.options.containerURN

        this.loadContainer(urn).then(() => {

          this.configureNavigation()
        })

        this.stopwatch.getElapsedMs()

        this.eventTool.activate()

        this.runAnimation()
      }
      this.viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, _self.onModelCompletedLoad)
    }
    this.viewer.removeEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, _self.onModelCompletedLoad);
    /////////////////////////////////////////////////////////
    // Load container model
    //
    /////////////////////////////////////////////////////////
    _self.loadContainer = function(urn) {

      return new Promise(async(resolve)=>{

          const doc = await this.options.loadDocument(urn)

          const path = this.options.getViewablePath(doc)

          this.viewer.loadModel(path, {}, (model) => {

              resolve (model)
          })
      })
    }

    /////////////////////////////////////////////////////////
    // Unload callback
    //
    /////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////
    // Clamp vector length, not avail in three.js version
    // used by the viewer
    //
    /////////////////////////////////////////////////////////
    _self.clampLength = function(vector, min, max ) {

      const length = vector.length()

      vector.divideScalar(length || 1)

      vector.multiplyScalar(
        Math.max(min, Math.min(max, length)))
    }

    /////////////////////////////////////////////////////////
    // Camera changed event
    //
    /////////////////////////////////////////////////////////
    _self.onCameraChanged = function() {

      // const nav = this.viewer.navigation

      // const pos = nav.getPosition()

      // if (pos.length() > 30000.0 || pos.length() < 10.0) {

      //   this.clampLength(pos, 10.0, 30000.0)

      //   nav.fitBounds(true, this.bounds)

      //   nav.setView(pos, new THREE.Vector3(0,0,0))
      // }
    }

    /////////////////////////////////////////////////////////
    // Rotate camera around axis
    //
    /////////////////////////////////////////////////////////
    _self.rotateCamera = function(axis, speed, dt) {

      const nav = this.viewer.navigation

      const up = nav.getCameraUpVector()

      const pos = nav.getPosition()

      const matrix = new THREE.Matrix4().makeRotationAxis(
        axis, speed * dt);

      pos.applyMatrix4(matrix)
      up.applyMatrix4(matrix)

      nav.setView(pos, new THREE.Vector3(0,0,0))
      nav.setCameraUpVector(up)
    }

    /////////////////////////////////////////////////////////
    // starts animation
    //
    /////////////////////////////////////////////////////////
    _self.runAnimation = function() {

      if (!this.userInteraction) {

        const dt = this.stopwatch.getElapsedMs() * 0.001

        const axis = new THREE.Vector3(0,1,0)

        this.rotateCamera(axis, 10.0 * Math.PI/180, dt)

        this.animId = window.requestAnimationFrame(
          this.runAnimation)
      }
    }
  }


  Autodesk.ADN.Viewing.Extension.Skybox.prototype = Object.create(Autodesk.Viewing.Extension.prototype);
  Autodesk.ADN.Viewing.Extension.Skybox.prototype.constructor = Autodesk.ADN.Viewing.Extension.Skybox;
  Autodesk.Viewing.theExtensionManager.registerExtension('Autodesk.ADN.Viewing.Extension.Skybox', Autodesk.ADN.Viewing.Extension.Skybox);

  class ViewerSkybox {

    constructor (viewer, options) {

      const faceMaterials = options.imageList.map((url) => {
        return new THREE.MeshBasicMaterial({
          map: THREE.ImageUtils.loadTexture(url),
          side: THREE.BackSide
        })
      })

      const skyMaterial = new THREE.MeshFaceMaterial(
        faceMaterials)

      const geometry = new THREE.CubeGeometry(
        options.size.x,
        options.size.y,
        options.size.z,
        1, 1, 1,
        null, true)

      this.skybox = new THREE.Mesh(
        geometry, skyMaterial)
    // viewer.loadModel()
    viewer.impl.scene.add(this.skybox)
    // _viewer.impl.scene.scale.set(100,100,100);
  }
  destory(viewer){
    viewer.impl.scene.remove(this.skybox);
  }
}

class Stopwatch {

  constructor(){

   this._lastTime = performance.now();
 }

 start(){

  this._lastTime = performance.now();
}

getElapsedMs(){

  var time = performance.now();

  var elapsedMs = time - this._lastTime;

  this._lastTime = time;

  return elapsedMs;
}
}