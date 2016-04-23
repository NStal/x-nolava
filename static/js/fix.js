// Generated by CoffeeScript 1.10.0
(function() {
  window.exports = window;

  window.require = function() {
    return window;
  };

  window.EventEmitter = Leaf.EventEmitter;

  window.Static = window;

  window.Three = THREE;

  window.Vector3 = Three.Vector3;

  window.Quaternion = Three.Quaternion;

  window.Mesh = Three.Mesh;

  window.Geometry = Three.Geometry;

  Date.prototype.getFixedTime = function() {
    if (!Date.serverDeviation) {
      Date.serverDeviation = 0;
    }
    return this.getTime() + Date.serverDeviation;
  };

  Date.getFixedTime = function() {
    if (!Date.serverDeviation) {
      Date.serverDeviation = 0;
    }
    return Date.now() + Date.serverDeviation;
  };

}).call(this);