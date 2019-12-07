const KILL_SCORE = 500;

module.exports = class Controller {

    /**
     * @param {import("./Game")} game
     * @param {import("./Connection")} conn
     * @param {Number} pid
     */
    constructor(game, conn, pid){
        this.game = game;
        this.conn = conn;
        this.pid = pid;
        this.head = [0, 0];
        this.dir = [0, 0];
        this.tails = [];
        this.nextDir = [0, 1];
        this.survivedTick = 0;
        this.killed = 0;
        this.highScore = 0;
        this.delta = [];
        this.grid_sent = false;
    }

    get ip() { return this.conn.ip }
    get uid() { return this.conn.uid }

    get score() {
        let score = this.game.tiles[this.pid].length + this.killed * KILL_SCORE;
        this.highScore = Math.max(this.highScore, score);
        return score;
    }

    get user() {
        return {
            name: this.conn.username
        }
    }

    die(){
        this.game.stats.push([this.pid, this.survivedTick, this.highScore, this.killed]);
    }

    addTail(x, y) {
        this.tails.push([x, y]);
        this.delta = [x, y];
    }

    removeTail() {
        this.tails = [];
        this.delta = [];
    }

    move() {
        if ((this.nextDir[0] && this.nextDir[0] === -this.dir[0]) || (this.nextDir[1] && this.nextDir[1] === -this.dir[1])) return;
        this.score;
        this.dir = [this.nextDir[0], this.nextDir[1]];
        return true;
    }

    disconnect(reason) {
        this.conn.handler.disconnect(reason);
    }
}