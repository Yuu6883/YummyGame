const RATE_LIMIT = 60;
const { ToString, ToBuffer } = require("../util/buffer");
const { read, NetErrorEvent, NetEventCode } = require("../servers/game/NetEvent");

module.exports = class SocketClient {

    constructor() {
        this.path = "";
        this.initEvents();
    }

    initSocket() {
        if (this.socket && this.socket.readyState === 1) 
            return $(window).trigger("err", new Error("Can't init socket when it's already connected!!"));

        this.socket = new WebSocket(`${window.origin.replace("http", "ws")}/${this.path}/`);
        this.socket.binaryType = "arraybuffer";
        this.socket.onopen = () => {
            console.log("Connected");
            $(window).trigger("connected");

            this.send(ToBuffer(NetEventCode.JOIN, name.slice(0, 16)), true);
        }
        this.socket.onmessage = message => {
            let view = new DataView(message.data);
            let event = view.getUint16(0);
            try {
                switch (event) {

                    case NetEventCode.CHAT:
                        $(window).trigger("chat", JSON.parse(ToString(message.data)));
                        break;
                    
                    case NetEventCode.PING:
                        $(window).trigger("rtt", Date.now() - this.lastPing);
                        setTimeout(this.ping, 1000);
                        break;
    
                    case NetEventCode.GAME_DATA:
                        this.process(read(message.data));
                        break;
    
                    case NetEventCode.INFO:
                        $(window).trigger("playerInfo", JSON.parse(ToString(message.data)));
                        break;
    
                    case NetErrorEvent.CODE:
                        throw new Error(NetErrorEvent.decode(view));
    
                    default:
                        throw new Error(`Unknown event: ${event}, data length: ${view.byteLength - 2} bytes, toString: ${ToString(message.data)}`);
                }
            } catch (e) {
                $(window).trigger("err", e);
            }
        }
        this.socket.onclose = this.socket.onerror = () => 
            (console.log("Disconnected"), setTimeout(this.reconnect.bind(this), 5000));

        this.lastSent = 0;
        return true;
    }

    initEvents() {
        $(window).on("loginSucceed", () => this.listServers());
        $(window).on("join", (_, name, server) => this.join(name, server));
        $(window).on("sendChat", (_, chat) => this.sendChat(chat));
        $(window).on("move:up", () => this.send(ToBuffer(NetEventCode.MOVE, 1)));
        $(window).on("move:down", () => this.send(ToBuffer(NetEventCode.MOVE, 0)));
        $(window).on("move:right", () => this.send(ToBuffer(NetEventCode.MOVE, 2)));
        $(window).on("move:left", () => this.send(ToBuffer(NetEventCode.MOVE, 3)));
    }

    listServers() {
        $.ajax({
            url: "/api/tracker",
            dataType: "json",
            success: res => {
                console.log(res);
                $(window).trigger("serverList", res);
            },
            error: e => $(window).trigger("err", "Failed to list servers")
        });
    }

    /**
     * @param {{time: Number, mypid: Number, delta: Number[][][], arrayGrid: Number[][], offsetGrid: {grid_offset: Number[], dim: Number[], grid_array: Number[]}, gridInfo: {grid: Number[][], size: number, tick: number}, killed: [][], stats: number[]}} data
     */
    process (data) {
        $(window).trigger("gameData", data);
        // console.log(`Surivive Time: ${(data.stats[0] * tick / 1000).toFixed(1)} Seconds, HighScore: ${data.stats[1]}, Enemy Killed: ${data.stats[2]}`);
        if (data.killed && data.killed.some(a => a[0] == data.mypid)) $(window).trigger("dead", data);
    }

    join(name, server) {
        name = name.slice(0, 16);
        if (name.length < 16) name += " ".repeat(16 - name.length);

        if (!this.socket || this.socket.readyState != 1 || this.path != server) {
            this.socket && this.socket.close();

            this.path = server;
            this.initSocket();
        }
        localStorage.nick = name;
    }

    send(data, force) {
        if (!force && Date.now() - this.lastSent < 1000 / RATE_LIMIT) return;
        if(this.socket && this.socket.readyState === 1) {
            this.lastSent = Date.now();
            this.socket.send(data);
        }
    }

    sendChat(chat) {
        this.send(ToBuffer(NetEventCode.CHAT, chat.slice(0, 200)));
    }
    
    /** @param {SocketManager} self */
    reconnect() {
        this.socket.close();
        this.initSocket();
        $(window).trigger("reconnecting");
    }

    ping() {
        this.lastPing = Date.now();
        this.send(ToBuffer(NetEventCode.PING));
    }
}