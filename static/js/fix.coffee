# fix.coffee is used to fix require issue when
# browser using require server side node style script
# and setup some useful alias or environment vars
window.exports = window
window.require = ()->
    return window
window.EventEmitter = Leaf.EventEmitter
window.Static = window
window.Three = THREE
window.Vector3 = Three.Vector3
window.Quaternion = Three.Quaternion
window.Mesh = Three.Mesh
window.Geometry = Three.Geometry
# server deviation is serverTime minus client Time
Date.prototype.getFixedTime = ()->
    if not Date.serverDeviation
        Date.serverDeviation = 0
    return this.getTime()+Date.serverDeviation
Date.getFixedTime = ()->
    if not Date.serverDeviation
        Date.serverDeviation = 0
    return Date.now()+Date.serverDeviation