const pm2 = require("pm2");

const Game = require("./game");

const logger = require("../../../../util/logger");

const TICK_MS = process.env.GAME_TICK || 200;
const BOARD_SIZE = process.env.GRID_SIZE || 100;
const DEBUG_BOARD = process.env.GAME_DEBUG == true;

const game = new Game(BOARD_SIZE, TICK_MS, DEBUG_BOARD);

pm2.connect(err => {
    if (!err) {
        logger.log("Game Server Connected to PM2");
        game.start();
    } else {
        logger.error("Game Server Failed to Connected to PM2");
        process.exit(1);
    }
    pm2.launchBus((err, bus) => {
        bus.on(`yummy-${process.env.SERVER_ID}:join`, message => {
            game.emit("join", message.data);
        });

        bus.on(`yummy-${process.env.SERVER_ID}:disconnect`, message => {
            game.emit(`disconnect`, message.data);
        });

        bus.on(`yummy-${process.env.SERVER_ID}:move`, message => {
            game.emit("move", message.data);
        });
    });

    process.on('SIGINT', () => {
        logger.exit("Process Interruption");
        process.exit(0);
    });

    process.on("unhandledRejection", err => logger.unhandledRejection(err));
    process.on("uncaughtException", err => logger.error(err));
});

game.on("start", () => {
    /*
    // game.setBackground(0, 1, 1);
    game.setBackground(1, 0, 1);
    game.setBackground(1, 2, 1);
    // game.setBackground(2, 1, 1);
    game.print();
    console.log(game.emptyNeighbors(1, 1, 1));
    */

    // for (let i = 0; i < 5; i++) {
    //     game.setBackground(5, i, 1);
    //     game.setBackground(i, 5, 1);
    // }

    // game.print();
    // game.getCell(0, 0).fill(1);
    // game.print();
    
    // game.emit("join", {hash: "i wanna die", user: {name: "Yuu"}});
    // setTimeout(() => game.emit("disconnect", {hash: "i wanna die", user: {name: "Yuu"}}), 5000);
});



// node apps/games/yummy/server/game-server.js
