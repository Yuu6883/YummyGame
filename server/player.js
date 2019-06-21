const { ToBuffer, ToString, ToUint16Array } = require("../bufferUtil");
const pm2 = require("pm2");
const logger = require('../../../../util/logger');
const rand = require("rand-token");
const validServerIDs = (() => {
    let ids = [];
    let settings = require("../config.json");
    for (let id in settings) for (let i = 0; i < (settings[id].instances || 1); i++) {
        ids.push(id + "-" + (i + 1));
    }
    return ids;
})();

logger.debug(`Running Yummy Instances: ${validServerIDs.join(", ")}`);

const { NetErrorEvent, NetEventCode ,ArrayGridData ,OffsetGridData ,KillData ,DeltaData, GridData, TailsData ,write } = require("./netEvent");

/** @type {Player[]} */
let connected = [];

pm2.connect(err => {

    pm2.launchBus((err, bus) => {

        for (let serverID of validServerIDs) {

            bus.on(`yummy-server-${serverID}:game`, message => {

                if (connected.length === 0) return;
    
                let dataArray = [];
                let data = message.data;
    
                if (data.background_delta_array) {
                    dataArray.push(new ArrayGridData(data.background_delta_array));
    
                } else if (data.background_delta_grid) {
                    dataArray.push(new OffsetGridData(data.background_delta_grid));
                }

                if (data.tails) {
                    dataArray.push(new TailsData(data.tails));
                }
    
                if (data.tail_delta) {
                    dataArray.push(new DeltaData(data.tail_delta));
                }
    
                if (data.grid && data.size && data.time) {
                    dataArray.push(new GridData(data.grid, data.size, data.tick));
                }
    
                if (data.killed) {
                    dataArray.push(new KillData(data.killed));
                }
                
                connected.forEach(p => {
                    let stats = data.stats ? data.stats.find(a => a[0] === p.hash) || [0, -1, -1, -1] : [0, -1, -1, -1];
                    let pid = data.ids ? data.ids.find(i => i[0] === p.hash) : 0;
                    pid = pid ? pid[1] : 0;
                    let buffer = write(pid, data.time, stats.slice(1, 4), ...dataArray);
                    p.sendToClient(buffer);
                });
    
            });
            bus.on(`yummy-server-${serverID}:disconnect`, message => {
                let player = connected.find(player => player.hash === message.data.hash);
                if (player) {
                    player.disconnect(false, message.data.reason || "");
                } else {
                    // console.log("Can't find player with hash " + message.data.hash);
                }
            });
            bus.on(`yummy-server-${serverID}:info`, message => {
                connected.forEach(player => player.sendToClient(ToBuffer(NetEventCode.INFO, message.data)));
            });
            bus.on(`yummy-server-${serverID}:err`, message => {
                let player = connected.find(player => player.hash === message.data.hash);
                if (player && message.data.code) {
                    player.sendToClient(new NetErrorEvent(message.data.code).buffer);
                } else {
                    // console.log("Can't find player with hash " + message.data.hash);
                }
            });
        }

    })
});

module.exports = class Player{

    /**
     * 
     * @param {WebSocket} socket 
     * @param {{name: String; avatar: String, id: Number}} info
     */
    constructor(socket, info) {
        this.hash = rand.uid(16);
        connected.push(this);
        this.initSocket(socket);
        this.user = info;
        this.serverID = 0;
        logger.log(this.user.name + " connected");
        this.head = [];
        this.dir = [0, -1];   
    }

    /** @param {WebSocket} socket */
    initSocket(socket){
        socket.on("message", data => {
            if (!(data instanceof ArrayBuffer)) {
                socket.close();
                return;
            }
            if (!data.byteLength) {
                logger.warn("Received Empty ArrayBuffer");
                return;
            }
            let view = new DataView(data);
            let event = view.getUint16(0);
            logger.debug(`Received event: ${event}, data length: ${view.byteLength - 2} bytes`);
            try {
                switch(event) {

                    case NetEventCode.CHAT:
                        this.sendToGameServer("chat", {
                            chat: ToString(data)
                        });
                        break;
                    
                    case NetEventCode.PING:
                        this.sendToClient(ToBuffer(NetEventCode.PING));
                        break;

                    case NetEventCode.MOVE:
                        let arr = ToUint16Array(data);
                        let move = [0, 1];
                        switch(arr[1]) {
                            case 0:
                                move = [0, 1];
                                break;
                            case 1:
                                move = [0, -1];
                                break;
                            case 2:
                                move = [1, 0];
                                break;
                            case 3:
                                move = [-1, 0];
                                break;
                            default:
                                logger.debug("Unknown Movement");
                        }
                        this.sendToGameServer("move", {
                            move: move
                        });
                        break;
                    
                    case NetEventCode.JOIN:
                        let name = ToString(data);
                        this.user.name = (name.slice(0, 16) || this.user.name).trim();
                        this.serverID = name.slice(16).trim();
                        if (!validServerIDs.includes(this.serverID)) {
                            this.disconnect(false, "Unknown Server: " + name);
                            break;
                        }
                        this.sendToGameServer("join");
                        break;
                        
                    default:
                        logger.log(`Unknown event: ${event}, data length: ${view.byteLength} bytes`);
                }
            } catch(e) {
                logger.debug(e);
            }
        });
        socket.onerror = (ws, err) => {
            console.log(ws, err);
            this.disconnect(true, "Socket Error");
        }
        socket.onclose = (ws, err) => {
            this.disconnect(true, "Socket Closed");
        }
        this.socket = socket;
        this.sendToClient(ToBuffer(NetEventCode.SERVER_LIST, `["${validServerIDs.join("\",\"")}"]`));
    }

    disconnect(tellServer, reason){
        if (this.disconnected) return;
        else this.disconnected = true;
        connected.splice(connected.indexOf(this), 1);
        try {
            reason = reason || "Unknown Reason";
            this.socket.send(ToBuffer(99, reason));
            this.socket.close();
        } catch (e) {};
        if (tellServer) this.sendToGameServer("disconnect", {hash: this.hash});
        logger.log(`${this.user.name} disconnected${reason ? " reason: " + reason : "."}`);
    }

    sendToGameServer(message, data){
        data = data || {};
        data.user = this.user;
        data.hash = this.hash;
        if (process.send) process.send({
            type: `yummy-${this.serverID}:${message}`,
            data: data
        });
    }

    sendToClient(data){
        if (this.socket && this.socket.readyState === 1) this.socket.send(data);
    }
}