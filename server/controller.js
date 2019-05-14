const KILL_SCORE = 500;

const { EventEmitter } = require("events");

module.exports = class Controller extends EventEmitter {

    /**
     * 
     * @param {import("./game")} game 
     * @param {Number} pid 
     * @param {String} hash 
     */
    constructor(game, pid, hash, user){
        super();
        this.game = game;
        this.pid = pid;
        this.user = user;
        this.head = [0, 0];
        this.dir = [0, 0];
        this.tails = [];
        this.nextDir = [0, 1];
        this.hash = hash;
        this.survivedTick = 0;
        this.killed = 0;
        this.highScore = 0;
        this.delta = [];
        this.grid_sent = false;

        this.on("err", event => process.send({
            type: `yummy-server-${process.env.SERVER_ID}:err`,
            data: {
                hash: this.hash,
                code: event
            }
        }));
    }

    get score(){
        let score = this.game.tiles[this.pid].length + this.killed * KILL_SCORE;
        this.highScore = Math.max(this.highScore, score);
        return score;
    }

    die(){
        this.emit("dead");
        this.game.emit("stats", [this.hash, this.survivedTick, this.highScore, this.killed]);
    }

    addTail(x, y) {
        this.emit("addTail", [x, y]);
        this.tails.push([x, y]);
        this.delta = [x, y];
    }

    removeTail() {
        this.emit("removeTail");
        this.tails = [];
        this.delta = [];
    }

    move(board) {
        if ((this.nextDir[0] && this.nextDir[0] === -this.dir[0]) || (this.nextDir[1] && this.nextDir[1] === -this.dir[1])) return;
        this.score;
        this.dir = [this.nextDir[0], this.nextDir[1]];
        this.emit("move", board);
        return true;
    }

    disconnect(reason) {
        this.emit("disconnect", reason);
    }
}