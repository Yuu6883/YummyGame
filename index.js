const pm2 = require("pm2");
const config = require("./config.json");

/**
 * 
 * @param {pm2.StartOptions} options 
 */
const startProcess = options => new Promise((resolve, reject) => {
    pm2.start(options, err => {
        if (err) reject(err);
        else resolve();
    });
});

module.exports = async () => {
    for (let id in config) {
        let settings = config[id];
        let instances = settings.instances || 1;
        for (let i = 0; i < instances; i++) {
            let gameName = id + "-" + (i + 1);
            console.log(`Starting Yummy WebServer ${gameName}`);
            await startProcess({
                name: "Yummy:" + gameName,
                log_date_format: "MM/DD HH:mm:ss",
                script: "apps/games/yummy/server/game-server.js",
                output: "apps/games/yummy/server/logs/" + gameName + ".log",
                error: "apps/games/yummy/server/logs/" + gameName + ".err",
                args: ["--color"],
                env: {
                    SERVER_ID: gameName,
                    GAME_TICK: settings.tick,
                    GRID_SIZE: settings.grid,
                    GAME_DEBUG: settings.debug || false
                }
            }).catch(console.error);
        }
    }
}