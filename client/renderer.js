
const GREY = "rgb(150, 150, 150)";
const GRID_LENGTH = 30;
const LINE_WIDTH = 2;
const { getColor, getLightColor, getDarkColor } = require("./colors");

const DEBUG = false;
const STROKE = false;
const DRAW_SHADOW = true;
const SHADOW_OFFSET = 5;
const GAP = 1;
const HEAD_SIZE = 0.8 * GRID_LENGTH;

const Direction = {
    UP: 0,
    LEFT: 1,
    DOWN: 2,
    RIGHT: 3
}

class Renderer{

    constructor() {
        this.grid = [];
        this.animation_grid = [];
        this.players = {};
        this.camera = [-1, -1];
        this.rendering = false;
        this.mypid = 0;
        this.size = 0;
        this.startTime = 0;
        this.currentTime = 0;
        this.lastFrame = 0;
        this.idleTime = 0;
        this.dead = true;
        this.tick;
        this.playerInfo = [];

        /** @type {HTMLCanvasElement} */
        this.canvas = document.getElementById("canvas");

        this.initEvents();
    }

    initEvents() {
        $(window).on("join", () => this.dead = false);
        $(window).on("dead", () => this.dead = true);
        $(window).on("playerInfo", (event, ...info) => {
            this.playerInfo = info
        });
        $(window).on("stop", () => this.stop());
        $(window).on("gameData",
        /**
         * @param {{time: Number, mypid: Number, delta: Number[][][], arrayGrid: Number[][], offsetGrid: {grid_offset: Number[], dim: Number[], grid_array: Number[]}, gridInfo: {grid: Number[][], size: number, tick: number}, killed: [][], stats: number[]}} data
         */
        (event, data) => {
            this.idleTime = 0;
            if (!this.startTime) this.startTime = data.time;
            this.currentTime = data.time;
            if (data.mypid) {
                this.mypid = data.mypid;
                $(window).trigger("mypid", data.mypid);
            }
            if (data.gridInfo && data.gridInfo.grid) {
                this.grid = data.gridInfo.grid;
                this.size = data.gridInfo.size;
                this.tick = data.gridInfo.tick;
                $(window).trigger("gameTick", this.tick);
            }
            if (data.delta) {
                data.delta.forEach(d => {
                    if (!this.players[d[0]]) this.players[d[0]] = { head: [], tails: [], meta: [] };
                    if (this.players[d[0]].head.length) this.players[d[0]].last_head = this.players[d[0]].head.map(o => o);
                    // Head
                    this.players[d[0]].head = d[1];
                    // Tail
                    d[2].length > 0 ? this.players[d[0]].tails.push(d[2]) : (this.players[d[0]].tails = [], this.players[d[0]].meta = []);
                });
            }
            if (data.arrayGrid) {

                for (let arr of data.arrayGrid) {
                    this.setBackground(arr[1], arr[2], arr[0]);
                }

            } else if (data.offsetGrid) {

                let { dim, grid_offset, grid_array } = data.offsetGrid;
                
                if (dim[0] * dim[1] !== grid_array.length) $(window).trigger("err", new Error("Array Dimension Doesn't Match!"));

                this.fillRectBackground(grid_offset[0], grid_offset[1], grid_offset[0] + dim[0], grid_offset[1] + dim[1], grid_array);
            }

            if (data.stats) {
                $(window).trigger("stats", [...data.stats, this.tick]);
            }
            if (data.killed) data.killed.forEach(k => this.kill(k[0]));
        });
    }

    fillRectBackground(x1, y1, x2, y2, values) {
        let index = 0;
        for (let i = x1; i < x2; i++) {
            for (let j = y1; j < y2; j++) {
                this.setBackground(i, j, values[index++]);
            }
        }
    }

    setBackground(x, y, pid) {
        if (x < 0 || x >= this.size || y < 0 || y >= this.size) return $(window).trigger("err", new Error(`[${x}, ${y}] is outside, pid: ${~~pid}`));
        this.grid[y][x] = ~~pid;
    }

    kill(pid) {
        delete this.players[pid];
        for (let row of this.grid) for (let i = 0; i < this.size; i++) if (row[i] == pid) row[i] = 0;
    }

    neiborsWithPID(x, y, pid) {
        let result = [];
        if (this.getCell(x, y + 1) == pid) result.push(Direction.DOWN);
        if (this.getCell(x, y - 1) == pid) result.push(Direction.UP);
        if (this.getCell(x + 1, y) == pid) result.push(Direction.RIGHT);
        if (this.getCell(x - 1, y) == pid) result.push(Direction.LEFT);
        return result;
    }

    getCell(x, y) {
        if (!this.size || x < 0 || x >= this.size || y < 0 || y >= this.size) return -1;
        return this.grid[y][x];
    }

    interpolate(start, end, percent) {
        percent = Math.max(Math.min(percent, 1), 0);
        return [start[0] + percent * (end[0] -start[0]), start[1] + percent * (end[1] -start[1])];
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     * @param {[][]} tails
     * @param {[]} head
     */
    drawTail(ctx, pid, tails, head, center_x, center_y) {
        ctx.save();

        let color = this.getLightColor(pid);
        ctx.fillStyle = color;

        // player.tails.forEach(tail => {
        //     ctx.fillRect(-(this.camera[0] - tail[0]) * l - GRID_LENGTH / 2 + center_x, -(this.camera[1] - tail[1]) * l - GRID_LENGTH / 2 + center_y, l, l);
        // });

        let start = neiborsWithPID(tails[0][0], tails[0][1], pid);
        start = start.length > 1 ? start[1] : start[0];
        let drawArr = [start, ...tails, head];

        ctx.restore();
    }

    render(timestamp) {

        let dt = timestamp && this.lastFrame ? timestamp - this.lastFrame : 0;

        const skip = reason => {
            DEBUG && reason ? console.log(`Frame Skipped because ${reason}`) : 0;
            if (this.rendering) { 
                this.lastFrame = timestamp || 0;
                this.idleTime += dt;
                requestAnimationFrame(timestamp => instance.render(timestamp));
            } else this.lastFrame = 0;
        }
        try{

        if (!this.canvas) this.canvas = document.getElementById("canvas");
        if (!this.canvas) skip("No Canvas");
        
        // Background
        let background = GREY;
        let ctx = this.canvas.getContext('2d');
        let w = this.canvas.width, h = canvas.height;
        ctx.globalAlpha = this.dead ? Math.min(this.idleTime / (25 * this.tick), 1) : 1;
        ctx.fillStyle = background;
        ctx.fillRect(0, 0, w, h);

        this.lastFrame = timestamp || 0;

        if (this.dead) return skip();

        let l = GRID_LENGTH;

        if (!this.currentTime) return skip();
        if (!this.players[this.mypid] || !this.tick) return skip("PID or unknown tick " + this.tick);

        let interpolated = {};

        for (let pid in this.players) {

            let last_head_pos = this.players[pid].last_head;
            interpolated[pid] = last_head_pos && last_head_pos.length == 2 ? this.interpolate(last_head_pos, this.players[pid].head, this.idleTime / this.tick) : this.players[pid].head;

            if (pid == this.mypid) {
                this.camera = interpolated[pid].map(o => o);
            }
        }
        
        if (this.camera[0] === -1 && this.camera[1] === -1) return skip("No Camera");

        let center_x = w / 2, center_y = h / 2;

        ctx.save();

        if (this.grid.length > 0 && this.size != 0) {

            for (let i = this.size - 1; i >= 0; i--) {
                for (let j = 0; j < this.size; j++) {

                    ctx.globalAlpha = this.grid[i][j] ? 1 : 0.1;

                    if (STROKE) {
                        ctx.strokeStyle = GREY;
                        ctx.lineWidth = LINE_WIDTH;
                        ctx.strokeRect(-(this.camera[0] - j) * l - l / 2 + center_x + GAP, -(this.camera[1] - i) * l - l / 2 + center_y + GAP, l - 2 * GAP, l - 2 * GAP);    
                    }

                    if (DRAW_SHADOW) {
                        ctx.fillStyle = getDarkColor(this.grid[i][j]);
                        ctx.fillRect(-(this.camera[0] - j) * l - l / 2 + center_x + SHADOW_OFFSET, -(this.camera[1] - i) * l - l / 2 + center_y - SHADOW_OFFSET, l, l);    
                    }

                    ctx.fillStyle = getColor(this.grid[i][j]);
                    ctx.fillRect(-(this.camera[0] - j) * l - l / 2 + center_x + GAP, -(this.camera[1] - i) * l - l / 2 + center_y + GAP, l - 2 * GAP, l - 2 * GAP);
                }
            }
        }

        ctx.globalAlpha = 1;

        for (let pid in this.players) {

            let lightColor = getLightColor(~~pid);
            let player = this.players[pid];
            let head = interpolated[pid];
            
            ctx.fillStyle = lightColor;
            ctx.fillRect(-(this.camera[0] - head[0]) * l - HEAD_SIZE / 2 + center_x, -(this.camera[1] - head[1]) * l - HEAD_SIZE / 2 + center_y, HEAD_SIZE, HEAD_SIZE);

            ctx.globalAlpha = 0.5;

            // drawTail(ctx, pid, player.tails, head, center_x, center_y);

            player.tails.forEach(tail => {
                ctx.fillRect(-(this.camera[0] - tail[0]) * l - GRID_LENGTH / 2 + center_x, -(this.camera[1] - tail[1]) * l - GRID_LENGTH / 2 + center_y, l, l);
            });

            ctx.globalAlpha = 1;
        }

        for (let pid in this.players) {
            let head = interpolated[pid];
            if (this.playerInfo) {
                let playerInfo = this.playerInfo.find(p => p[0] == pid);
                if (playerInfo && playerInfo[1].name) {
                    let name = playerInfo[1].name;
                    ctx.textAlign = "center";
                    ctx.fillStyle = "white";
                    ctx.font = "bold 26px Arial";
                    ctx.fillText(name, -(this.camera[0] - head[0]) * l + center_x, -(this.camera[1] - head[1]) * l + center_y - GRID_LENGTH / 2);
                }
            }
        }

        ctx.restore();
        skip();
        } catch(e){console.error(e)}
    }

    start() {
        this.rendering = true;
        requestAnimationFrame(timestamp => instance.render(timestamp));
    }

    stop() {
        this.rendering = false;
    }
}

const instance = new Renderer();
module.exports = instance;