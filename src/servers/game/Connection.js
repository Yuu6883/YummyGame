const EventHandler = require("./EventHandler");

module.exports = class Connection {

    /**
     * @param {import("./Server")} server
     * @param {ClientUser} user
     * @param {import("@clusterws/cws").WebSocket} socket
     */
    constructor(server, user, socket) {
        this.server = server;
        this.user   = user;
        this.socket = socket;
        this.handler = new EventHandler(this);
    }

    get ip() { return this.socket._socket.remoteAddress }
    get uid() { return this.user && this.user.uid }
    get logger() { return this.server.logger }

    get username() {
        if (!this.user || !this.user.type) return;

        switch (this.user.type) {

            case "discord":
                return this.user.username;
            
            case "facebook":
                return this.user.name;

            case "google":
                return this.user.given_name;

            default:
                return `Guest`
        }
    }

    /** @param {Number} code */
    error(code) {
        this.handler.error(code);
        this.socket.close();
    }
}