///////////////////////////////////////////////////////////////////////////////
// 依赖<script src="/static/plugin/Tween/Tween.js" type="text/javascript"></script>
//使用方法 漫游
// s=_viewer.getState()
// _viewer.CameraGetState(s)
// _viewer.CameraRestoreState(s)
///////////////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");
Autodesk.ADN.Viewing.Extension.CameraTween = function(viewer, options) {
    var EASINGS = [{
            id: TWEEN.Easing.Linear.None,
            name: 'Linear'
        },

        {
            id: TWEEN.Easing.Quadratic.In,
            name: 'Quadratic.In'
        },
        {
            id: TWEEN.Easing.Quadratic.Out,
            name: 'Quadratic.Out'
        },
        {
            id: TWEEN.Easing.Quadratic.InOut,
            name: 'Quadratic.InOut'
        },

        {
            id: TWEEN.Easing.Cubic.In,
            name: 'Cubic.In'
        },
        {
            id: TWEEN.Easing.Cubic.Out,
            name: 'Cubic.Out'
        },
        {
            id: TWEEN.Easing.Cubic.InOut,
            name: 'Cubic.InOut'
        },


        {
            id: TWEEN.Easing.Quartic.In,
            name: 'Quartic.In'
        },
        {
            id: TWEEN.Easing.Quartic.Out,
            name: 'Quartic.Out'
        },
        {
            id: TWEEN.Easing.Quartic.InOut,
            name: 'Quartic.InOut'
        },

        {
            id: TWEEN.Easing.Quintic.In,
            name: 'Quintic.In'
        },
        {
            id: TWEEN.Easing.Quintic.Out,
            name: 'Quintic.Out'
        },
        {
            id: TWEEN.Easing.Quintic.InOut,
            name: 'Quintic.InOut'
        },

        {
            id: TWEEN.Easing.Exponential.In,
            name: 'Exponential.In'
        },
        {
            id: TWEEN.Easing.Exponential.Out,
            name: 'Exponential.Out'
        },
        {
            id: TWEEN.Easing.Exponential.InOut,
            name: 'Exponential.InOut'
        }
    ]

    Autodesk.Viewing.Extension.call(this, viewer, options);

    //  var overlayName = "temperary-CameraTweened-overlay";
    var _self = this;

    _self.load = function() {
        console.log('Autodesk.ADN.Viewing.Extension.CameraTween loaded');

        Autodesk.Viewing.Viewer3D.prototype.CameraRestoreState = function(viewerState, immediate) {

            tweenCameraTo(viewerState.cameraTween, immediate, viewer)
        }
        Autodesk.Viewing.Viewer3D.prototype.CameraGetState = function(viewerState) {
            const viewport = Object.assign({},
                viewerState.viewport, {}
            )
            viewerState.cameraTween = {
                viewport
            }
        };

        _self.unload = function() {
            console.log('Autodesk.ADN.Viewing.Extension.CameraTween unloaded');
            return true;
        };
        return true;
    }
}


Autodesk.ADN.Viewing.Extension.CameraTween.prototype = Object.create(Autodesk.Viewing.Extension.prototype);
Autodesk.ADN.Viewing.Extension.CameraTween.prototype.constructor = Autodesk.ADN.Viewing.Extension.CameraTween;
Autodesk.Viewing.theExtensionManager.registerExtension('Autodesk.ADN.Viewing.Extension.CameraTween', Autodesk.ADN.Viewing.Extension.CameraTween);



/////////////////////////////////////////////////////////
//
//
/////////////////////////////////////////////////////////
var animate;
var animId;

function createTween(params) {

    return new Promise((resolve) => {

        new TWEEN.Tween(params.object)
            .to(params.to, params.duration)
            .onComplete(() => resolve())
            .onUpdate(params.onUpdate)
            .easing(params.easing)
            .start()
    })
}

function tweenCameraTo(state, immediate,viewer) {

    targetTweenDuration = 2500;
    posTweenDuration = 2500;
    upTweenDuration = 2500;

    targetTweenEasing = {
        id: TWEEN.Easing.Linear.None,
        name: 'Linear'
    };
    posTweenEasing = {
        id: TWEEN.Easing.Linear.None,
        name: 'Linear'
    };
    upTweenEasing = {
        id: TWEEN.Easing.Linear.None,
        name: 'Linear'
    };

    const targetEnd = new THREE.Vector3(
        state.viewport.target[0],
        state.viewport.target[1],
        state.viewport.target[2])

    const posEnd = new THREE.Vector3(
        state.viewport.eye[0],
        state.viewport.eye[1],
        state.viewport.eye[2])

    const upEnd = new THREE.Vector3(
        state.viewport.up[0],
        state.viewport.up[1],
        state.viewport.up[2])

    const nav = viewer.navigation

    const target = new THREE.Vector3().copy(
        nav.getTarget())

    const pos = new THREE.Vector3().copy(
        nav.getPosition())

    const up = new THREE.Vector3().copy(
        nav.getCameraUpVector())


    const targetTween = createTween({
        easing: targetTweenEasing.id,
        onUpdate: (v) => {
            nav.setTarget(v)
        },
        duration: immediate ? 0 : targetTweenDuration,
        object: target,
        to: targetEnd
    })

    const posTween = createTween({
        easing: posTweenEasing.id,
        onUpdate: (v) => {
            nav.setPosition(v)
        },
        duration: immediate ? 0 : posTweenDuration,
        object: pos,
        to: posEnd
    })

    const upTween = createTween({
        easing: upTweenEasing.id,
        onUpdate: (v) => {
            nav.setCameraUpVector(v)
        },
        duration: immediate ? 0 : upTweenDuration,
        object: up,
        to: upEnd
    })

    Promise.all([
        targetTween,
        posTween,
        upTween
    ]).then(() => {

        animate = false
        // _viewer.restoreState(state)
    })

    runAnimation(true)
}

/////////////////////////////////////////////////////////
// starts animation
//
/////////////////////////////////////////////////////////
function runAnimation(start) {

    if (start || animate) {

        animId = window.requestAnimationFrame(
            runAnimation)

        TWEEN.update()
    }
}