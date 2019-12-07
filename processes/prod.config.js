const { Game, API } = require("../config");

module.exports = {
    apps: [{
        name:    "Server",
        script:  "processes/server.js",
        max_memory_restart: "200M",
        env: {
            NODE_ENV: "production"
        },
        max_restarts: 10000,
        restart_delay: 10000,
    }].concat(...Game.map(config => ({
        name:   config.url,
        script: "processes/game.js",
        max_memory_restart: "200M",
        env: {
            NODE_ENV: "production",
            URL: config.url,
            PORT: config.port,
            KEY: API.JWTCookieName,
            SECRET: API.JWTSecret,
            EXPIRE: API.JWTExpire,
        },
        max_restarts: 10000,
        restart_delay: 10000,
    })))
}