const { WebSocketServer } = require("@clusterws/cws");
const Cookie = require("cookie");
const JWT = require("jsonwebtoken");

const Game = require("./Game");
const Logger = require("../api/modules/Logger");
const Connection = require("./Connection");

module.exports = new class GameServer {

    constructor() {

        /** @type {GameConfig} */
        this.config = {
            url:  process.env.URL  || "default",
            port: process.env.PORT || 3001,
            tick: process.env.TICK || 200,
            size: process.env.SIZE || 100,
            debug: !!process.env.DEBUG,
            key:    process.env.KEY,
            secret: process.env.SECRET,
            expire: process.env.EXPIRE
        };

        /** @type {import("./Connection")[]} */
        this.connections = [];

        this.logger = new Logger();
        this.logger._onLog = (_, level, message) => {
            if (level == "ACCESS") return;
            if (process.env.NODE_ENV == "production" && level == "DEBUG") return;
            console.log(`[${level}] ${message}`);
        }
        
        this.game = new Game(this, this.config.size, this.config.tick, this.config.debug);
    }

    /** 
     * Use an already existing http server to initialize, or pass in 
     * nothing to initalize as an independent websocket server
     * @param {import("http").Server} server 
     */
    init(server) {

        if (server) {
            this.server = new WebSocketServer({
                server,
                path: `/${this.config.url}/`,
                verifyClient: this.verifyClient.bind(this)
            }, () => {
                this.logger.info(`Game server opened at /${this.config.url}/`);
                this.game.start();
            });
        } else {
            this.server = new WebSocketServer({
                port: this.config.port,
                verifyClient: this.verifyClient.bind(this)
            }, () => {
                this.logger.info(`Game server opened on @ ${this.config.port}`);
                this.game.start();
            });
        }

        this.initEvents();
    }

    /**
     * Verify client
     * @param {import("@clusterws/cws").ConnectionInfo} info 
     * @param {import("@clusterws/cws").Listener} next 
     */
    verifyClient(info, next) {

        let cookie = Cookie.parse(info.req.headers.cookie);
        let jwt    = cookie[this.config.key];

        try  {
            JWT.verify(jwt, this.config.secret);
            info.req.user = JWT.decode(jwt);
            next(true);
        } catch (_) {
            next(false);
        }
    }

    initEvents() {
        this.server.on("connection", (socket, req) => {

            /** @type {ClientUser} */
            let user = req.user;  
            let conn = new Connection(this, user, socket);
            this.connections.push(conn);

            this.logger.info(`Client connected from ${socket.remoteAddress}(${this.connections.length}). ` +
                             `User: ${conn.username}(${user.uid})`);

            socket.on("close", (code, reason) => {
                this.connections.splice(this.connections.indexOf(conn), 1);
                this.game.removeConnection(conn);

                this.logger.info(`${conn.username} disconnected (${this.connections.length})`);
                this.logger.debug(`Close code: ${code}, reason: ${reason}`);
            });
        });
    }

    /** @param {string} userID */
    findConnection(userID) {
        return this.connections.find(conn => conn.user.uid == userID);
    }

    /**
     * @param {Connection} conn 
     * @param {String} chat 
     */
    onChat(conn, chat) {

    }
}