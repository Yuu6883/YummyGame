const SPAWN_CHECK_DISTANCE = 3;
const SPAWN_DISTANCE_X = 1;
const SPAWN_DISTANCE_Y = 1;

const MAX_PLAYER = 255;
const SPAWN_LIMIT = 50;

const PrintGame = require("./Printer");

const Cell = require("./Cell");
const { tryFill } = require("./Filler");

const Controller = require("./Controller");

const { ErrorCode } = require("./NetEvent");

module.exports = class Game {

    /**
     * @param {import("./Server")} server game server
     * @param {Number} size size of the board
     * @param {Number} tick tick in ms
     * @param {Boolean} debug print board every tick
     */
    constructor(server, size, tick, debug) {
        this.server = server;
        this.size = size;
        this.game_tick = tick;
        this.debug = debug;

        /** @type {Cell[]} */
        this.delta = [];

        /** @type {Controller[]} */
        this.connected = [];

        /** @type {Number[][][]} */
        this.tiles = {};

        /** @type {{killed: Number, by: Number, disconnect: Boolean}[]} */
        this.killList = [];

        /** @type {Number[]} */
        this.PIDUsing = [];

        /** @type {[][]} */
        this.stats = [];

        this.ticking = false;
        this.tickCount = 0;
        this.should_broadcast = false;
        this.broadcast_counter = 0;
        
        this.logger.info(`Yummy Server Running: ` +
            `TICK: ${this.game_tick}, ` + 
            `SIZE: ${this.size}, ` +
            `DEBUG: ${this.debug}]`);

        this.initBoard();
    }

    get logger() { return this.server.logger }

    /**
     * @param {import("./Connection")} conn 
     */
    addConnection(conn) {

        if (this.connected.some(controller => {
            if (controller.ip == conn.ip || 
                conn.uid && (conn.uid == controller.uid)) {

                this.logger.warn("Dup connection");
                conn.error(ErrorCode.CONNECTED_DUP_CODE);
                return true;
            }
        })) return;

        let pid = this.generatePID();
        
        if (pid === -1) {

            this.logger.info("Max player limit reached");
            conn.error(ErrorCode.SERVER_FULL_CODE);

        } else {

            let control = new Controller(this, conn, pid);
            if (this.spawn(control)) {
                this.logger.info(`Spawned ${conn.username}`);
                this.connected.push(control);

                return control;
            } else {

                this.logger.info("Server Too Crowded");
                conn.error(ErrorCode.SERVER_CROWDED_CODE);
            }
        }
    }

    /**
     * @param {import("./Connection")} conn 
     */
    removeConnection(conn) {
        this.should_broadcast = true;
        let control = this.connected.find(controller => controller.conn === conn);

        if (control) {
            this.kill(control.pid, 0, true);
            this.connected.splice(this.connected.indexOf(control), 1);
        } else {
            // logger.warn(`Hash ${event.hash} not found in controllers`);
        }
    }

    getDeltaDimension() {
        if (this.delta.length <= 0) return;
        let pos = this.delta.map(c => [c[1], c[2]]);
        
        // let x_min = Math.max(Math.min(...pos.map(p => p[0])) - 3, 0);
        // let x_max = Math.min(Math.max(...pos.map(p => p[0])) + 3, this.size - 1);
        // let y_min = Math.max(Math.min(...pos.map(p => p[1])) - 3, 0);
        // let y_max = Math.min(Math.max(...pos.map(p => p[1])) + 3, this.size - 1);

        let x_min = Math.min(...pos.map(p => p[0]));
        let x_max = Math.max(...pos.map(p => p[0]));
        let y_min = Math.min(...pos.map(p => p[1]));
        let y_max = Math.max(...pos.map(p => p[1]));
        return {
            x_min: x_min,
            x_max: x_max,
            y_min: y_min,
            y_max: y_max,
            dim: [x_max - x_min + 1, y_max - y_min + 1],
            bytes: (x_max - x_min + 1) * (y_max - y_min + 1)
        };
    }

    takeGrid(x1, y1, x2, y2, isMatrix) {
        let arr = [];
        if (isMatrix) {
            for (let i = x1; i <= x2; i++) {
                let row = [];
                for(let j = y1; j <= y2; j++) {
                    row.push(this.board[j][i].background_pid);
                }
                arr.push(row);
            }
        } else {
            for (let i = x1; i <= x2; i++) {
                for(let j = y1; j <= y2; j++) {
                    arr.push(this.board[j][i].background_pid);
                }
            }
        }
        return arr;
    }

    prepareData() {

        let should_send_grid = false;
        let id_map = [];

        this.connected.forEach(controller => {
            if (!controller.grid_sent) {
                controller.grid_sent = true;
                should_send_grid = true;
            }
            id_map.push([controller.hash, controller.pid]);
        });

        let data = {};

        if (id_map.length > 0) data.ids = id_map; 

        if (should_send_grid) {
            data.grid = this.board.map(row => row.map(cell => cell.background_pid));
            data.size = this.size;
            data.tick = this.game_tick;
            data.tails = this.connected.reduce((prev, curr) => {
                if (curr.tails.length) prev[curr.pid] = curr.tails.slice(0, -1);
                return prev;
            }, {});
            if (!Object.keys(data.tails).length) delete data.tails;
        } else {
            let dim = this.getDeltaDimension();

            if (dim && this.delta.length > 0) {
                
                if (dim.bytes + 8 > this.delta.length * 5) {
                    data.background_delta_array = this.delta;
                    this.logger.debug("Using array algorithm");
                } else {
                    this.logger.debug("Using grid offset algorithm");
                    data.background_delta_grid = {
                        offset: [dim.x_min, dim.y_min],
                        dim: dim.dim,
                        grid: this.takeGrid(dim.x_min, dim.y_min, dim.x_max, dim.y_max)
                    }
                }
            }
        }

        if (this.stats.length > 0) {
            data.stats = this.stats;
        }
        
        if (this.killList.length > 0) {
            data.killed = this.killList.map(k => [k.killed, k.by, k.disconnect || false]);
        }

        data.tail_delta = {};
        this.connected.forEach(c => !this.killList.includes(c.pid) ? data.tail_delta[c.pid] = [c.head, c.delta] : 0);
        if (Object.keys(data.tail_delta).length === 0) delete data.tail_delta;
        return data;
    }

    initBoard() {
        /** @type {Cell[][]} */
        this.board = [];
        for (let i = 0; i < this.size; i++) {
            this.board[i] = [];
            for (let j = 0; j < this.size; j++) {
                this.board[i].push(new Cell(this, 0, 0, 0, j, i));
            }
        }
        // Fully link every cell
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                this.board[i][j].up = this.getCell(j, i - 1);
                this.board[i][j].down = this.getCell(j, i + 1);
                this.board[i][j].left = this.getCell(j - 1, i);
                this.board[i][j].right = this.getCell(j + 1, i);
            }
        }
    }

    generatePID() {
        if (this.connected.length == MAX_PLAYER) return -1;
        let i = this.PIDUsing.length > 0 ? Math.max(...this.PIDUsing) : 1;
        while (this.PIDUsing.includes(i)) {
            i++;
            if (i > MAX_PLAYER) i -= MAX_PLAYER;
        }
        this.PIDUsing.push(i);
        return i;
    }

    start() {
        this.ticking = true;
        this.tick_interval = setInterval(this.tick.bind(this), this.game_tick, this);
    }

    /**
     * @param {Boolean} force force the game to tick even when pausing
     */
    tick() {

        if (!this.ticking || !this.connected.length) return;

        this.tickCount++;

        this.beforeMove();

        this.connected.forEach(control => {
            this.move(control);
        });

        if (++this.broadcast_counter % 10 == 0 || this.should_broadcast) this.broadcastInfo();
    
        let pidsToFilter = this.updateKill();

        let data = this.prepareData();

        if (!Object.keys(data).length)
            return;

        data.time = this.tickCount;

        for (let control of this.connected) {
            control.conn.handler.sendGameData(data);
        }

        if (pidsToFilter)
            this.connected = this.connected.filter(c => !pidsToFilter.includes(c.pid));

        // Clean up stuff here
        this.killList = [];
        this.delta = [];
        this.stats = [];

        if (this.debug) this.print();
    }

    pause() {
        this.ticking = false;
        clearInterval(this.tick_interval);
    }

    reset() {
        this.initBoard();
        this.connected.forEach(control => control.disconnect("Server Reset"));
    }

    /** 
     * @param {Controller} player 
     */
    spawn(player) {
        if (!Number.isInteger(player.pid) || player.pid >= MAX_PLAYER || player.pid < 1) return false;
        let limit = 0;
        let x = Math.floor(Math.random() * this.size);
        let y = Math.floor(Math.random() * this.size);
        while(!this.canSpawn(x, y)) {
            limit++;
            if (limit >= SPAWN_LIMIT)
                return;
            x = Math.floor(Math.random() * this.size);
            y = Math.floor(Math.random() * this.size);
        }
        // console.log(`Player Spawned at [${x}, ${y}]`);
        this.fillRectBackground(x - SPAWN_DISTANCE_X, y - SPAWN_DISTANCE_Y, x + SPAWN_DISTANCE_X, y + SPAWN_DISTANCE_Y, player.pid);
        this.getCell(x, y).putHead(player.pid);
        player.head = [x, y];
        this.should_broadcast = true;
        return [x, y];
    }

    canSpawn(x, y) {
        for(let i = y - SPAWN_CHECK_DISTANCE; i <= y + SPAWN_CHECK_DISTANCE; i++) {
            for(let j = x - SPAWN_CHECK_DISTANCE; j <= x + SPAWN_CHECK_DISTANCE; j++) {
                if (i < 0 || i >= this.size || j < 0 || j >= this.size) return false;
                if (!this.board[i][j].isEmpty()) return false;
            }
        }
        return true;
    }

    fillRectBackground(x1, y1, x2, y2, value) {
        for (let i = x1; i <= x2; i++) {
            for (let j = y1; j <= y2; j++) {
                this.setBackground(i, j, value);
            }
        }
    }

    setBackground(x, y, value){
        // console.log(`Setting [${x}, ${y}] to PID: ${value}`);
        if (x < 0 || x >= this.size || y < 0 || y >= this.size) return;
        if (this.board[y][x].background_pid != value) {
            this.board[y][x].background_pid = value;
            this.delta.push(this.board[y][x].toPacket());
        }
    }

    getCell(x, y){
        if (x < 0 || x >= this.size || y < 0 || y >= this.size) return new Cell(this, -1, -1, -1, -1, -1);
        return this.board[y][x];
    }

    kill(killed, by, disconnect = false) {
        this.killList.push({ killed, by, disconnect });
    }

    updateKill(){

        if (this.killList.length > 0) this.logger.debug("Killing: ", JSON.stringify(this.killList));
        else return;

        let pids = this.killList.map(k => k.killed);
        let reward = [];
        this.killList.forEach(k => k.by != k.killed && reward.push(k.by));

        for (let row of this.board) for (let cell of row) {
            cell.kill(...pids);
        }

        this.connected.forEach(control => {
            if (reward.includes(control.pid)) control.killed++;
            if (pids.includes(control.pid)) {
                control.die();
                pids.forEach(pid => this.PIDUsing.splice(this.PIDUsing.indexOf(pid), 1));
                return false;
            }
            return true;
        });

        return pids;
    }

    beforeMove() {
        this.updateTiles();
    }

    /** 
     * @param {Controller} player 
     */
    move(player) {

        player.survivedTick++;

        if (!Number.isInteger(player.pid) || player.pid >= MAX_PLAYER || player.pid < 1) 
            return this.logger.onError("Invalid PID!");
        if (player.survivedTick < 3) return;

        player.move(this.board);

        let dir = player.dir;

        let currX = player.head[0];
        let currY = player.head[1];
        let nextX = currX + dir[0];
        let nextY = currY + dir[1];

        let currentCell = this.getCell(currX, currY);
        let nextCell = this.getCell(nextX, nextY);

        if (nextCell.isWall) {
            this.kill(player.pid, 0);
        } else {
            if (currentCell.putTail(player.pid)) {
                player.addTail(currX, currY);
            }
            currentCell.removeHead();
            player.head = [nextX, nextY];
            nextCell.putHead(player.pid);
            if (currentCell.background_pid !== player.pid && nextCell.background_pid == player.pid) {
                this.setBackground(currentCell.x, currentCell.y, player.pid);
                this.calculateClosure(player);
            }
        }
    }

    updateTiles(){
        this.tiles = {};
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                let cell = this.board[i][j];
                if (!this.tiles[cell.background_pid]) this.tiles[cell.background_pid] = [];
                this.tiles[cell.background_pid].push([j, i]);
            }
        }
    }

    rank(){
        this.connected = this.connected.sort((a, b) => a.score - b.score);
    }

    broadcastInfo(){
        this.should_broadcast = false;
        this.broadcast_counter = 0;
        for (let control of this.connected)
            control.conn.handler.sendInfo(JSON.stringify(this.connected.map(c => [c.pid, c.user])));
    }

    // neiborWithPID(x, y, pid) {
    //     if (this.getCell(x, y + 1).background_pid === pid) return [x, y + 1];
    //     if (this.getCell(x, y - 1).background_pid === pid) return [x, y - 1];
    //     if (this.getCell(x + 1, y).background_pid === pid) return [x + 1, y];
    //     if (this.getCell(x - 1, y).background_pid === pid) return [x - 1, y];
    // }

    /**
     * 
     * @param {Number[][]} points 
     */
    seperate(points) {
        let result = [];
        for (let i = 0; i < points.length - 1; i++) {
            let should_push = true;
            for (let j = i + 1; j < points.length; j++) {
                let p1 = points[i], p2 = points[j];
                if (Math.abs(p1[0] - p2[0]) + Math.abs(p1[1] - p2[1]) === 1) {
                    should_push = false;
                    break;
                }
            }
            if (should_push) result.push(points[i]);
        }
        result.push(points[points.length - 1]);
        return result;
    }

    emptyNeighbors(x, y, pid) {
        let points = [];
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (!i && !j) continue;
                let cell = this.getCell(x + i, y + j);
                if (!cell.isWall && cell.background_pid != pid && !cell.tail_pid) points.push([x + i, y + j]);
            }
        }
        return this.seperate(points);
    }

    /**
     * 
     * @param {Number[][]} points 
     */
    framePoints(x1, y1, x2, y2, points) {
        let result = [];
        points.forEach(p => {
            if (!p || isNaN(p[0]) || isNaN(p[1])) return;
            if (p[0] < x1 || p[0] > x2 || p[1] < y1 || p[1] > y2) return;
            result.push([p[0] - x1, p[1] - y1]);
        });
        return result;
    }

    /** 
     * @param {Controller} player 
     */
    calculateClosure(player){
        // console.log(`Calculating Closure for PID: ${player.pid}`);
        
        let tiles = this.tiles[player.pid];

        let xs = new Set();
        let ys = new Set();

        tiles.forEach(e => (xs.add(e[0]), ys.add(e[1])));
        player.tails.forEach(tail => (xs.add(tail[0]), ys.add(tail[1])));

        let x_min = Math.min(...xs);
        let x_max = Math.max(...xs);
        let y_min = Math.min(...ys);
        let y_max = Math.max(...ys);

        // Old algorithm
        {
        /*
        let grid = [];
        let start = this.neiborWithPID(...player.tails[0], player.pid);
        let end = this.neiborWithPID(...player.tails[player.tails.length - 1], player.pid);
        let translated = [];

        if (start[0] === end[0] && start[1] === end[1]) {
        } else {
            for(let i = y_min; i <= y_max; i++) {
                let row = [];
                for(let j = x_min; j <= x_max; j++) {
                    row.push(this.getCell(j, i).background_pid === player.pid ? 1 : 0);
                }
                grid.push(row);
            }
            let gragh = new Graph(grid);
            let startNode = gragh.grid[start[1] - y_min][start[0] - x_min];
            let endNode = gragh.grid[end[1] - y_min][end[0] - x_min];
            if (!startNode || !endNode) {
                PrintGame(this.board);
                startNode ? 0 : console.error("NullStartNode", grid, [start[1] - y_min, start[0] - x_min]);
                endNode ? 0 : console.error("NullEndNode", grid, [end[1] - y_min, end[0] - x_min]);
            } else {
                let path = astar.search(gragh, startNode, endNode);
                if (Array.isArray(path) && path.length > 0) {
                    translated = path.map(node => [node.y + x_min, node.x + y_min]);   
                } 
            }
        }
        
        translated.push([start[0], start[1]], ...player.tails);

        let map = {};

        translated.forEach(pos => {
            if (!map[pos[0]]) map[pos[0]] = [];
            map[pos[0]].push(pos);
        });

        for (let key in map) map[key] = map[key].sort((a, b) => a[1] - b[1]);

        this.fillMapBackground(map, player.pid);

        player.tails.forEach(tail => {
            this.getCell(...tail).removeTail();
        })
        player.removeTail();
        */
        }
        let grid = this.takeGrid(x_min, y_min, x_max, y_max, true);

        player.tails.forEach(tail => {
            this.getCell(...tail).removeTail();
            this.setBackground(...tail, player.pid);            
        });

        // console.log(grid);
        let p;
        let index = 0;
        let result;
        while (index < player.tails.length) {
            p = player.tails[index++];
            let emptyPoints = this.emptyNeighbors(...p, player.pid);
            // console.log(emptyPoints);
            emptyPoints = this.framePoints(x_min, y_min, x_max, y_max, emptyPoints);
            if (emptyPoints.length > 0) {
                // console.log(emptyPoints);
                result = tryFill(grid, emptyPoints, this.framePoints(x_min, y_min, x_max, y_max, player.tails), player.pid, true);
                if (result) this.getCell(result[0] + x_min, result[1] + y_min).fill(player.pid);
            }
        }

        // if (!result) this.logger.debug("No place to fill");

        player.removeTail();
    }

    print() {
        PrintGame(this.board);
    }

    fillMapBackground(map, pid) {
        for (let key in map) {
            let arr = map[key];
            key = ~~key;
            for (let i = 0; i < arr.length - 1; i++) {
                for (let j = arr[i][1]; j < arr[i + 1][1]; j++) {
                    this.setBackground(key, j, pid);
                }                
                if (arr[i + 1][1] - arr[i][1] > 1) {
                    this.setBackground(key, arr[i + 1][1], pid);
                    i++;
                }
            }
            this.setBackground(key, arr[arr.length - 1][1], pid);
        }
    }
}