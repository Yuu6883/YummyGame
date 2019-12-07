const { ToBuffer, ToString, ToUint16Array } = require("../../util/buffer");

const { NetErrorEvent, NetEventCode, ArrayGridData, OffsetGridData, 
    KillData, DeltaData, GridData, TailsData, write } = require("./NetEvent");

module.exports = class EventHandler {

    /**
     * @param {import("./Connection")} conn
     */
    constructor(conn) {
        this.conn = conn;
        this.user = { name: "" };
        this.initSocket(conn.socket);
    }

    /** @param {WebSocket} socket */
    initSocket(socket){

        socket.binaryType = "arraybuffer";
        socket.onmessage = data => {
            if (!(data instanceof ArrayBuffer)) {
                this.conn.logger.onError("Data is not ArrayBuffer");
                socket.close();
                return;
            }

            if (!data.byteLength) {
                this.conn.logger.warn("Received empty buffer");
                return;
            }

            let view = new DataView(data);
            let event = view.getUint16(0);
            this.conn.logger.debug(`Received event: ${event}, data length: ${view.byteLength - 2} bytes`);

            try {
                switch(event) {

                    case NetEventCode.CHAT:
                        this.conn.server.onChat(ToString(data));
                        break;
                    
                    case NetEventCode.PING:
                        this.socket.send(ToBuffer(NetEventCode.PING));
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
                                this.conn.logger.warn("Unknown Movement");
                                this.disconnect();
                        }

                        this.controller.nextDir = move;
                        break;
                    
                    case NetEventCode.JOIN:
                        let name = ToString(data);
                        this.user.name = (name.slice(0, 16) || this.user.name).trim();
                        this.controller = this.conn.server.game.addConnection(this.conn);
                        break;
                        
                    default:
                        this.conn.logger.warn(`Unknown event: ${event}, data length: ${view.byteLength} bytes`);
                }
            } catch(e) {
                this.conn.logger.onError(e);
            }
        }
        this.socket = socket;
    }

    disconnect(reason){
        if (this.disconnected) return;
        else this.disconnected = true;
        
        try {
            reason = reason || "Unknown Reason";
            this.socket.send(ToBuffer(NetEventCode.ERROR, reason));
            this.socket.close();
        } catch (e) {};
    }

    /** @param {ArrayBuffer} data */
    sendToClient(data) {
        try { this.socket && this.socket.readyState === 1 && this.socket.send(data) } catch (_) {};
    }

    sendInfo(info) {
        this.sendToClient(ToBuffer(NetEventCode.INFO, info));
    }

    /**
     * @param {} data 
     */
    sendGameData(data) {
        
        let dataArray = [];
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

        let stats = data.stats ? (data.stats.find(stats => 
            stats.pid == this.controller.pid) || [0, -1, -1, -1]) : [0, -1, -1, -1];

        let buffer = write(this.controller.pid, data.time, stats.slice(1), ...dataArray);
        this.sendToClient(buffer);
    }

    /** @param {Number} code */
    error(code) {
        this.sendToClient(new NetErrorEvent(code).buffer);
    }
}