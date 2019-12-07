module.exports = class Cell {
    /**
     * 
     * @param {import("./Game")} game 
     * @param {Number} background_pid 
     * @param {Number} head_pid 
     * @param {Number} tail_pid 
     */
    constructor(game, background_pid, head_pid, tail_pid, x, y) {
        this.game = game;
        this.background_pid = background_pid;
        this.head_pid = head_pid;
        this.tail_pid = tail_pid;
        this.x = x;
        this.y = y;
        /** @type {Cell} */
        this.up = undefined;
        /** @type {Cell} */
        this.down = undefined;
        /** @type {Cell} */
        this.left = undefined;
        /** @type {Cell} */
        this.right = undefined;
    }

    isEmpty(){
        return this.background_pid === 0 && this.head_pid === 0 && this.tail_pid === 0;
    }

    kill(...pid){
        if (pid.includes(this.background_pid)) this.background_pid = 0;
        if (pid.includes(this.head_pid)) this.head_pid = 0;
        if (pid.includes(this.tail_pid)) this.tail_pid = 0;
    }

    putHead(pid){
        pid = ~~pid;
        if (this.isEmpty() || this.background_pid) {
            this.head_pid = pid;
        } else if (this.head_pid){

            // Has head
            if (this.head_pid === pid || this.isWall) {
                process.exit(1);
            } else {
                if (this.background_pid === pid){
                    // Player's territory
                    this.game.kill(this.head_pid, pid);
                } else if (this.background_pid === this.head_pid) {
                    // Other's territory
                    this.game.kill(this.head_pid, pid);
                } else {
                    // Both die if not in either players' territory
                    this.game.kill(this.head_pid, pid);
                    this.game.kill(pid, this.head_pid);
                }
            }
        }
        
        if (this.tail_pid) {
            if (this.tail_pid == pid) {
                // Player's own tail
                this.game.kill(this.head_pid, pid);
            } else {
                this.game.kill(this.tail_pid, pid);
                this.head_pid = pid;
            }
        }
    }

    get isWall() {
        return this.background_pid === -1;
    }

    fill(pid) {
        if (this.isWall) return;
        if (this.background_pid === pid) return;
        this.game.setBackground(this.x, this.y, pid);
        this.up.fill(pid);
        this.down.fill(pid);
        this.left.fill(pid);
        this.right.fill(pid);
    }

    removeHead(){
        this.head_pid = 0;
    }

    putTail(pid) {
        if (this.background_pid === pid) return false;
        this.tail_pid = pid;
        return true;
    }

    removeTail(){
        this.tail_pid = 0;
    }

    toString(){
        return `[X: ${this.x}, Y: ${this.y}, Background: ${this.background_pid}, Head: ${this.head_pid}, Tail: ${this.tail_pid}]`;
    }

    toPacket(){
        return [this.background_pid, this.x, this.y];
    }
}