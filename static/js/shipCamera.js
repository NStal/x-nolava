// Generated by CoffeeScript 1.10.0
(function() {
  var ShipCamera,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ShipCamera = (function(superClass) {
    extend(ShipCamera, superClass);

    function ShipCamera(fov, ratio, near, far) {
      Three.PerspectiveCamera.call(this, fov, ratio, near, far);
      this.targetDistance = 3000;
      this.towards = new Three.Vector3(-0.5, 0, 0);
      this.useQuaternion = true;
      this.position.set(0, 0, 3000);
    }

    ShipCamera.prototype.follow = function(ship) {
      return this.target = ship;
    };

    ShipCamera.prototype.update = function() {
      if (!this.target) {
        return;
      }
      this.towards.set(0, 0.1, 0.5);
      this.towards.applyQuaternion(this.target.quaternion);
      this.towards.setLength(this.targetDistance);
      this.position.set(0, 0, 0);
      this.position.add(this.target.position);
      this.position.add(this.towards);
      this.lookAt(this.target.position);
      return this.quaternion.copy(this.target.quaternion);
    };

    return ShipCamera;

  })(Three.PerspectiveCamera);

  Static.ShipCamera = ShipCamera;

}).call(this);
