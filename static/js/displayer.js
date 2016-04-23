// Generated by CoffeeScript 1.10.0
(function() {
  var BulletTracer, Displayer, LightGlow, ShipHUD, ShipTracer, SpaceEnvironment, Tracer, TracerDecorator, WhiteSharp, WhiteSharpExplotion,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Displayer = (function(superClass) {
    extend(Displayer, superClass);

    function Displayer() {
      Displayer.__super__.constructor.call(this, "#scene");
    }

    Displayer.prototype.setWorld = function(world) {
      console.assert(world);
      this.world = world;
      this.world.on("add", (function(_this) {
        return function(object) {
          return _this.attachTracer(object);
        };
      })(this));
      return this.world.on("remove", (function(_this) {
        return function(object) {
          return _this.removeTracer(object);
        };
      })(this));
    };

    Displayer.prototype.setup = function() {
      this.setupEnvironment();
      this.setupScene();
      this.environment = new SpaceEnvironment();
      return this.environment.show();
    };

    Displayer.prototype.setupEnvironment = function() {
      this.frameRate = 70;
      this.canvas = this.UI.canvas;
      this.height = window.innerHeight;
      this.width = window.innerWidth;
      this.canvas.width = this.width;
      this.canvas.height = this.height;
      return this.ratio = this.width / this.height;
    };

    Displayer.prototype.setupScene = function() {
      var ambient, directionalLight, pointLight;
      this.scene = new Three.Scene();
      this.camera = new Static.ShipCamera(35, this.ratio, 1, 1000000000);
      this.camera.position.z = 300;
      this.scene.add(this.camera);
      this.renderer = new Three.WebGLRenderer({
        canvas: this.canvas,
        antialias: true,
        clearColor: 0x000000
      });
      this.renderer.setClearColor(0x000000, 1);
      this.renderer.setSize(this.width, this.height);
      ambient = new Three.AmbientLight(0x999999, 0.9);
      directionalLight = new Three.DirectionalLight(0xffffff, 0.7);
      directionalLight.position.set(1, 1, 2).normalize();
      pointLight = new Three.PointLight(0x224488, 0.9);
      pointLight.position.set(0, 0, 0);
      this.scene.add(ambient);
      this.scene.add(directionalLight);
      return this.scene.add(pointLight);
    };

    Displayer.prototype.update = function() {
      var i, index, len, obj, ref;
      this.camera.update();
      console.assert(this.world);
      ref = Displayer.tracers;
      for (index = i = 0, len = ref.length; i < len; index = ++i) {
        obj = ref[index];
        obj.update();
        if (obj.markRemove) {
          Displayer.tracers[index] = null;
        }
      }
      Displayer.tracers = Displayer.tracers.filter(function(item) {
        return item !== null;
      });
      return this.renderer.render(this.scene, this.camera);
    };

    Displayer.prototype.attachTracer = function(object) {
      var tracer;
      if (object instanceof Bullet) {
        tracer = new BulletTracer(object);
        tracer.show();
        return;
      }
      if (object instanceof Ship) {
        tracer = new ShipTracer(object);
        tracer.show();
      }
    };

    Displayer.prototype.removeTracer = function(object) {
      var i, len, ref, results, tracer;
      if (!object.tracers) {
        return;
      }
      ref = object.tracers;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        tracer = ref[i];
        results.push(tracer.hide());
      }
      return results;
    };

    return Displayer;

  })(Leaf.Widget);

  Displayer.tracers = [];

  Tracer = (function(superClass) {
    extend(Tracer, superClass);

    function Tracer(object) {
      Tracer.__super__.constructor.call(this);
      console.assert(typeof object === "object");
      if (!object.tracers) {
        object.tracers = [];
      }
      object.tracers.push(this);
      this.target = object;
      this.position = new Three.Vector3().copy(this.target.position);
      this.quaternion = new Three.Quaternion().copy(this.target.quaternion);
    }

    Tracer.prototype.show = function() {
      if (!this.mesh) {
        return;
      }
      this.emit("show");
      if (this.isShown) {
        return;
      }
      Static.game.displayer.scene.add(this.mesh);
      Displayer.tracers.push(this);
      return this.isShown = true;
    };

    Tracer.prototype.hide = function() {
      if (!this.mesh) {
        return;
      }
      this.emit("hide");
      if (!this.isShown) {
        return;
      }
      Static.game.displayer.scene.remove(this.mesh);
      return this.markRemove = true;
    };

    Tracer.prototype.update = function() {
      this.position.copy(this.target.position);
      return this.quaternion.copy(this.target.quaternion);
    };

    return Tracer;

  })(EventEmitter);

  ShipTracer = (function(superClass) {
    extend(ShipTracer, superClass);

    function ShipTracer(object) {
      var glow, i, len, position, positions, sharp;
      ShipTracer.__super__.constructor.call(this, object);
      this.mesh = Static.resourceManager.getMesh("ship");
      this.mesh.useQuaternion = true;
      positions = [];
      positions = [new Three.Vector3(0, 44, 400), new Three.Vector3(60, -42, 400), new Three.Vector3(-60, -42, 400)];
      this.lights = [];
      this.hud = new ShipHUD(this.target);
      console.log("！@！！！");
      for (i = 0, len = positions.length; i < len; i++) {
        position = positions[i];
        glow = new LightGlow(this, 600);
        glow.setRelation(position);
        sharp = new WhiteSharp(this, 850);
        sharp.setRelation(position);
        this.lights.push(glow, sharp);
      }
    }

    ShipTracer.prototype.show = function() {
      var i, len, light, ref, results;
      ShipTracer.__super__.show.call(this);
      this.hud.show();
      ref = this.lights;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        light = ref[i];
        results.push(light.show());
      }
      return results;
    };

    ShipTracer.prototype.hide = function() {
      var i, len, light, ref;
      this.hud.hide();
      ref = this.lights;
      for (i = 0, len = ref.length; i < len; i++) {
        light = ref[i];
        light.hide();
      }
      return ShipTracer.__super__.hide.call(this);
    };

    ShipTracer.prototype.update = function() {
      var i, len, light, ref, results;
      ShipTracer.__super__.update.call(this);
      this.mesh.position.copy(this.position);
      this.mesh.quaternion.copy(this.quaternion);
      ref = this.lights;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        light = ref[i];
        results.push(light.update());
      }
      return results;
    };

    return ShipTracer;

  })(Tracer);

  BulletTracer = (function(superClass) {
    extend(BulletTracer, superClass);

    function BulletTracer(object) {
      BulletTracer.__super__.constructor.call(this, object);
      this.mesh = Static.resourceManager.getMesh("bullet");
      this.mesh.useQuaternion = true;
      object.on("explosion", (function(_this) {
        return function() {
          console.log("Boooom!");
          _this.explosion.position.copy(_this.position);
          _this.explosion.show();
          return _this.explosion.update();
        };
      })(this));
      this.explosion = new WhiteSharpExplotion(this);
      this.explosion.on("end", (function(_this) {
        return function() {
          _this.hide();
          return _this.target.markRemove = true;
        };
      })(this));
    }

    BulletTracer.prototype.update = function() {
      BulletTracer.__super__.update.call(this);
      this.mesh.position.copy(this.position);
      return this.mesh.quaternion.copy(this.quaternion);
    };

    return BulletTracer;

  })(Tracer);

  TracerDecorator = (function(superClass) {
    extend(TracerDecorator, superClass);

    function TracerDecorator(object) {
      TracerDecorator.__super__.constructor.call(this, object);
    }

    TracerDecorator.prototype.setRelation = function(distanceVector) {
      return this.relateVector = distanceVector;
    };

    TracerDecorator.prototype.update = function() {
      var vec3;
      TracerDecorator.__super__.update.call(this);
      if (this.relateVector) {
        vec3 = this.relateVector.clone();
        vec3.applyQuaternion(this.target.quaternion);
        this.position.copy(this.target.position);
        return this.position.add(vec3);
      }
    };

    return TracerDecorator;

  })(Tracer);

  LightGlow = (function(superClass) {
    extend(LightGlow, superClass);

    function LightGlow(tracer, size) {
      var mat;
      LightGlow.__super__.constructor.call(this, tracer);
      this.size = size || 600;
      mat = new Three.SpriteMaterial({
        map: Static.resourceManager.textures.trustHifi,
        opacity: 1,
        color: 0x33aaff,
        transparent: true,
        blending: Three.CustomBlending,
        blendSrc: Three.SrcAlphaFactor,
        blendDst: Three.OneFactor,
        useScreenCoordinates: false
      });
      mat.side = Three.DoubleSide;
      this.sprite1 = new Three.Sprite(mat);
      this.sprite2 = new Three.Sprite(mat);
      this.sprite1.rotation = -Math.PI / 2;
      this.sprite2.rotation = Math.PI / 2;
      this.mesh = new Three.Object3D();
      this.mesh.add(this.sprite1);
      this.mesh.add(this.sprite2);
      this.spriteScale = this.size;
      this.mesh.useQuaternion = true;
    }

    LightGlow.prototype.update = function() {
      LightGlow.__super__.update.call(this);
      this.mesh.position.copy(this.position);
      this.mesh.quaternion.copy(this.quaternion);
      this.spriteScale = this.size + 100 * (Math.random() - 0.5);
      this.sprite1.position.x = this.spriteScale * 0.78 / 4;
      this.sprite2.position.x = -this.spriteScale * 0.78 / 4;
      this.sprite1.scale.set(this.spriteScale, this.spriteScale, this.spriteScale);
      return this.sprite2.scale.set(this.spriteScale, this.spriteScale, this.spriteScale);
    };

    return LightGlow;

  })(TracerDecorator);

  WhiteSharp = (function(superClass) {
    extend(WhiteSharp, superClass);

    function WhiteSharp(object, size) {
      var mat;
      WhiteSharp.__super__.constructor.call(this, object);
      this.size = size || 800;
      mat = new Three.SpriteMaterial({
        map: Static.resourceManager.textures.whitesharp,
        opacity: 1,
        color: 0xffffff,
        transparent: true,
        blending: Three.CustomBlending,
        blendSrc: Three.SrcAlphaFactor,
        blendDst: Three.OneFactor,
        useScreenCoordinates: false
      });
      mat.side = Three.DoubleSide;
      this.mesh = new Three.Sprite(mat);
      this.spriteScale = this.size;
      this.position.set(0, 0, 0);
      this.mesh.useQuaternion = true;
    }

    WhiteSharp.prototype.update = function() {
      WhiteSharp.__super__.update.call(this);
      this.mesh.position.copy(this.position);
      this.mesh.quaternion.copy(this.quaternion);
      return this.mesh.scale.set(this.spriteScale, this.spriteScale, this.spriteScale);
    };

    return WhiteSharp;

  })(TracerDecorator);

  WhiteSharpExplotion = (function(superClass) {
    extend(WhiteSharpExplotion, superClass);

    function WhiteSharpExplotion(tracer, maxSize) {
      var mat;
      WhiteSharpExplotion.__super__.constructor.call(this, tracer);
      this.size = 100;
      mat = new Three.SpriteMaterial({
        map: Static.resourceManager.textures.whitesharp,
        opacity: 0.7,
        color: 0xffffff,
        transparent: true,
        blending: Three.CustomBlending,
        blendSrc: Three.SrcAlphaFactor,
        blendDst: Three.OneFactor,
        useScreenCoordinates: false
      });
      mat.side = Three.DoubleSide;
      this.mesh = new Three.Sprite(mat);
      this.spriteScale = this.size;
      this.mesh.useQuaternion = true;
      this.lowSpeed = 1.15;
      this.fastSpeed = 2;
      this.floor = 30;
      this.max = (maxSize || 1500) * (Math.random() + 1) / 2;
      this.min = 1;
      this.delay = 0.1;
      this.expSize = 2;
      this.state = "start";
    }

    WhiteSharpExplotion.prototype.update = function() {
      WhiteSharpExplotion.__super__.update.call(this);
      if (this.state === "start") {
        if (Math.random() < this.delay) {
          return;
        } else {
          this.state = "preIncrease";
        }
      }
      if (this.state === "preIncrease") {
        this.expSize *= this.lowSpeed;
        if (this.expSize > this.floor) {
          this.state = "increase";
        }
      }
      if (this.state === "increase") {
        this.expSize *= this.fastSpeed;
        if (this.expSize > this.max) {
          this.state = "decrease";
        }
      }
      if (this.state === "decrease") {
        this.expSize /= this.fastSpeed;
        if (this.expSize < this.floor) {
          this.state = "preEnd";
        }
      }
      if (this.state === "preEnd") {
        this.expSize /= this.lowSpeed;
        if (this.expSize < this.min) {
          this.state = "remove";
        }
      }
      if (this.state === "remove") {
        this.hide();
        this.emit("end");
      }
      this.spriteScale = this.size * this.expSize;
      this.mesh.position.copy(this.position);
      return this.mesh.scale.set(this.spriteScale, this.spriteScale, this.spriteScale);
    };

    return WhiteSharpExplotion;

  })(TracerDecorator);

  ShipHUD = (function(superClass) {
    extend(ShipHUD, superClass);

    function ShipHUD(target) {
      ShipHUD.__super__.constructor.call(this, target);
      this.p4 = new Three.Vector4;
      this.mesh = new Three.Sprite(new Three.SpriteMaterial({
        map: Static.resourceManager.textures.whitesharp,
        color: 0xff0000,
        useScreenCoordinates: true
      }));
      this.mesh.scale.set(100, 100, 1);
      this.camera = Static.game.displayer.camera;
      this.displayer = Static.game.displayer;
    }

    ShipHUD.prototype.update = function() {
      var oz, x, y, z;
      ShipHUD.__super__.update.call(this);
      if (this.target === Static.game.userShip) {
        this.mesh.visible = false;
        return;
      }
      this.p4.copy(this.position);
      this.p4.w = 1;
      this.p4 = this.p4.applyMatrix4(this.camera.matrixWorldInverse);
      oz = this.p4.z;
      this.p4 = this.p4.applyMatrix4(this.camera.projectionMatrix);
      z = this.p4.z;
      this.p4.multiplyScalar(1 / z);
      x = (this.p4.x + 1) / 2 * this.displayer.width;
      y = -(this.p4.y - 1) / 2 * this.displayer.height;
      x = Math.max(8, Math.min(x, this.displayer.width - 5));
      y = Math.max(8, Math.min(y, this.displayer.height - 5));
      this.mesh.position.set(x, y, 0);
      if (z > 0) {
        return this.mesh.visible = true;
      } else {
        return this.mesh.visible = false;
      }
    };

    return ShipHUD;

  })(TracerDecorator);

  SpaceEnvironment = (function(superClass) {
    extend(SpaceEnvironment, superClass);

    function SpaceEnvironment() {
      SpaceEnvironment.__super__.constructor.call(this);
      this.cube = Static.resourceManager.getMesh("environmentCube");
      this.ball = Static.resourceManager.getMesh("ball");
      this.ball.position.set(0, 0, 0);
    }

    SpaceEnvironment.prototype.show = function() {
      Static.game.displayer.scene.add(this.cube);
      return Static.game.displayer.scene.add(this.ball);
    };

    SpaceEnvironment.prototype.hide = function() {
      Static.game.displayer.scene.remove(this.cube);
      return Static.game.displayer.scene.remove(this.ball);
    };

    return SpaceEnvironment;

  })(EventEmitter);

  exports.Displayer = Displayer;

  exports.SpaceEnvironment = SpaceEnvironment;

}).call(this);