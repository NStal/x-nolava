// Generated by CoffeeScript 1.10.0
(function() {
  var Game, SharedSettings,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  SharedSettings = require("sharedSettings").SharedSettings;

  console.log(SharedSettings);

  Game = (function(superClass) {
    extend(Game, superClass);

    function Game() {
      Game.__super__.constructor.call(this, "#scene");
      this.displayer = new Displayer();
      this.world = new World();
      this.username = window.location.hash.replace("#", "");
    }

    Game.prototype.start = function(serverWs) {
      var start;
      serverWs = new WebSocketTunnel(serverWs);
      this.server = new ServerInterface(serverWs);
      this.serverHandler = new ServerHandler(serverWs);
      start = Date.now();
      this.displayer.setWorld(this.world);
      this.displayer.setup();
      this.server.getServerTime((function(_this) {
        return function(err, time) {
          console.log("server time synced");
          Date.serverDeviation = time - (Date.now() + start) / 2;
          return _this.server.enterGame(_this.username, function(err, sid) {
            console.log("using ship id", sid);
            if (!err) {
              console.log("game entered");
              return _this.server.completeSync(function(err, data) {
                console.log("complete synced", data);
                _this.world.init(data);
                _this.userShip = _this.world.getObjectById(sid);
                if (_this.userShip) {
                  return _this.displayer.camera.follow(_this.userShip);
                } else {
                  console.warn("user ship not found.");
                  console.warn("fail to set camera follow object.");
                }
              });
            } else {
              console.trace();
              return console.log(err);
            }
          });
        };
      })(this));
      return this.timer = setInterval(((function(_this) {
        return function() {
          _this.world.update();
          _this.displayer.update();
          return Static.KM.solve();
        };
      })(this)), 1000 / SharedSettings.frameRate);
    };

    Game.prototype.setupTime = function(callback) {
      return console.log("setup time...");
    };

    Game.prototype.doCompleteSync = function() {
      return this.server.sync(function(err, data) {
        if (err) {
          console.error(err);
          console.trace();
          return;
        }
        return this.world.init(data.objects);
      });
    };

    return Game;

  })(Leaf.Widget);

  $(function() {
    Static.resourceManager = new ResourceManager();
    Static.resourceManager.useObject("maid");
    Static.resourceManager.useObject("Spaceship");
    Static.resourceManager.useObject("missile");
    return Static.resourceManager.on("ready", function() {
      var ws;
      Static.resourceManager.preprocess();
      Static.KM = new Static.KeyMaster();
      Static.game = new Game();
      console.log("every thing ready,connect to server");
      ws = new WebSocket("ws://" + SharedSettings.serverHost + ":" + SharedSettings.serverPort);
      return ws.onopen = function() {
        return Static.game.start(ws);
      };
    });
  });

}).call(this);
