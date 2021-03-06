ws = require "ws"
APIEnum = (require "../common/remoteAPI").APIEnum
Static = (require "./static").Static
EventEmitter = (require "events").EventEmitter
rpc = require "../common/rpc"
GameMaster = (require "./gameMaster").GameMaster
SharedSettings = (require "../common/sharedSettings").SharedSettings
NodeWSTunnel = rpc.NodeWSTunnel
remoteAPI =require "../common/remoteAPI"
ClientInterface =remoteAPI.ClientInterface
ClientHandler = remoteAPI.ClientHandler
World = (require "../common/physics").World
class ConnectionServer extends EventEmitter
    constructor:(port,host)-> 
        super()
        @host = host or "localhost"
        @port = port or 10423
        @listen()
        @sessions = []
    listen:()->
        console.log "conectionserver listen at #{@host} #{@port}"
        @ws = new ws.Server({port:@port}) 
        @ws.on "connection",(ws)=>
            console.log "connection!"
            session = new GameSession(ws)
            @sessions.push session
        @ws.on "error",(err)=>
            console.log err

class GameSession extends EventEmitter
    constructor:(ws)->
        super()
        ws = new NodeWSTunnel(ws)
        @client = new ClientInterface(ws)
        @handler = new ClientHandler(ws)
        @handler.session = this
        @client.session = this
        @client.on "close",()=>
            @emit "end"
        @handler.on "close",()=>
            @emit "end"
        


do ()->
    Static.world = new World
    Static.world.init([])
    Static.server = new ConnectionServer(SharedSettings.serverPort,SharedSettings.serverHost)
    
    Static.server.on "connection",(ws)->
    Static.gameMaster = new GameMaster()
    setInterval (()=>
        Static.world.update()
        ),1000/SharedSettings.frameRate 