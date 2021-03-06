// Generated by CoffeeScript 1.10.0
(function() {
  var EventEmitter, NodeWSTunnel, RPCInterface, RPCServer, WebSocketTunnel,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    slice = [].slice,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  EventEmitter = (require("events")).EventEmitter;

  NodeWSTunnel = (function(superClass) {
    extend(NodeWSTunnel, superClass);

    function NodeWSTunnel(ws) {
      NodeWSTunnel.__super__.constructor.call(this);
      if (!ws) {
        return;
      }
      ws.on("message", (function(_this) {
        return function(message) {
          var e, error;
          try {
            JSON.parse(message.toString());
          } catch (error) {
            e = error;
            console.trace();
            console.error(e);
            return;
          }
          return _this.emit("data", JSON.parse(message));
        };
      })(this));
      ws.on("close", (function(_this) {
        return function() {
          _this.emit("close");
          return _this.isReady = false;
        };
      })(this));
      this.ws = ws;
      this.isReady = true;
    }

    NodeWSTunnel.prototype.write = function(json) {
      console.assert(this.ws);
      this.ws.send(JSON.stringify(json));
    };

    return NodeWSTunnel;

  })(EventEmitter);

  WebSocketTunnel = (function(superClass) {
    extend(WebSocketTunnel, superClass);

    function WebSocketTunnel(ws) {
      WebSocketTunnel.__super__.constructor.call(this);
      if (!ws) {
        return;
      }
      this.ws = ws;
      ws.addEventListener("message", (function(_this) {
        return function(message) {
          var data, e, error;
          try {
            data = JSON.parse(message.data.toString());
          } catch (error) {
            e = error;
            console.error(e);
            console.trace();
            return;
          }
          return _this.emit("data", data);
        };
      })(this));
      ws.addEventListener("close", (function(_this) {
        return function() {
          _this.emit("close");
          return _this.isReady = false;
        };
      })(this));
      this.isReady = true;
    }

    WebSocketTunnel.prototype.write = function(json) {
      console.assert(this.ws);
      console.assert(json instanceof Object);
      return this.ws.send(JSON.stringify(json));
    };

    return WebSocketTunnel;

  })(EventEmitter);

  RPCInterface = (function(superClass) {
    extend(RPCInterface, superClass);

    function RPCInterface(tunnel) {
      RPCInterface.__super__.constructor.call(this);
      this.callBuffer = [];
      this._requests = [];
      if (tunnel) {
        this.setTunnel(tunnel);
      }
    }

    RPCInterface.prototype.setTunnel = function(tunnel) {
      var tunnelId;
      console.assert(tunnel);
      tunnelId = parseInt(Math.random() * 100000);
      this.tunnelId = tunnelId;
      this.tunnel = tunnel;
      this.tunnel.on("close", (function(_this) {
        return function() {
          _this.emit("close");
          return _this.isReady = false;
        };
      })(this));
      return this.tunnel.on("data", (function(_this) {
        return function(data) {
          if (tunnelId !== _this.tunnelId) {
            console.log("tunnel changed");
            return;
          }
          if (!data.ticket) {
            return;
          }
          return _this.handleResponse(data);
        };
      })(this));
    };

    RPCInterface.prototype.handleResponse = function(response) {
      var has, i, index, len, ref, req;
      has = false;
      ref = this._requests;
      for (index = i = 0, len = ref.length; i < len; index = ++i) {
        req = ref[index];
        this._requests.splice(index, 1);
        if (req.id === response.ticket) {
          has = true;
          if (req.callback) {
            req.callback(response.err, response.data);
          }
        }
        break;
      }
      if (!has) {
        return console.warn("recieve invalid response of invalid ticket", response);
      }
    };

    RPCInterface.prototype.declare = function() {
      var name, paramsDeclare;
      name = arguments[0], paramsDeclare = 2 <= arguments.length ? slice.call(arguments, 1) : [];
      return this[name] = (function(_this) {
        return function() {
          var args, callback, params, request;
          args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
          if (!_this.tunnel.isReady) {
            console.log(_this.name + ":service not ready,buffer RPC calls");
            _this.callBuffer.push({
              name: name,
              args: args
            });
            return false;
          }
          if (typeof args[args.length - 1] !== "function") {
            params = args;
            callback = null;
          } else {
            params = args.splice(0, args.length - 1);
            callback = args[0];
          }
          request = {
            id: Math.floor(Math.random() * 1000000),
            params: params,
            name: name,
            callback: callback
          };
          _this._requests.push(request);
          return _this.tunnel.write(request);
        };
      })(this);
    };

    return RPCInterface;

  })(EventEmitter);

  RPCServer = (function(superClass) {
    extend(RPCServer, superClass);

    function RPCServer(tunnel) {
      RPCServer.__super__.constructor.call(this);
      this.publicCalls = [];
      if (tunnel) {
        this.setTunnel(tunnel);
      }
    }

    RPCServer.prototype.setTunnel = function(tunnel) {
      var tunnelId;
      console.assert(tunnel);
      tunnelId = parseInt(Math.random() * 100000);
      this.tunnelId = tunnelId;
      this.tunnel = tunnel;
      this.tunnel.on("data", (function(_this) {
        return function(data) {
          console.log("recieve", data);
          if (tunnelId !== _this.tunnelId) {
            console.log("tunnel changed");
            return;
          }
          return _this.handleRequest(data);
        };
      })(this));
      return this.tunnel.on("close", (function(_this) {
        return function(data) {
          _this.emit("close");
          return _this.isReady = false;
        };
      })(this));
    };

    RPCServer.prototype.declare = function(name) {
      if (typeof this[name] === "function") {
        this.publicCalls.push(name);
        return true;
      }
      return false;
    };

    RPCServer.prototype.handleRequest = function(request) {
      var ref, response;
      if (!request.id || (ref = request.name, indexOf.call(this.publicCalls, ref) < 0)) {
        return;
      }
      if (request.params instanceof Array && this[request.name].length === (request.params.length + 1)) {
        request.params.push((function(_this) {
          return function(err, data) {
            var response;
            response = {
              err: err,
              data: data,
              ticket: request.id
            };
            if (_this.tunnel) {
              _this.tunnel.write(response);
            }
          };
        })(this));
        return this[request.name].apply(this, request.params);
      } else {
        response = {
          err: "Invalid Params",
          data: null,
          ticket: request.id,
          request: request
        };
        if (this.tunnel) {
          this.tunnel.write(response);
        }
      }
    };

    return RPCServer;

  })(EventEmitter);

  exports.NodeWSTunnel = NodeWSTunnel;

  exports.WebSocketTunnel = WebSocketTunnel;

  exports.RPCInterface = RPCInterface;

  exports.RPCServer = RPCServer;

}).call(this);
