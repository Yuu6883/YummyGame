/** @typedef {{open_list: Number[][], grid: Number[][], failed: Boolean, start: Number}[]} BoardData*/

/**
 * @param {import("./cell")[][]} board
 * @param {Boolean} flip
 */
const copy = (board, flip) => {
    let data = {
        start: [],
        open_list: [],
        failed: false,
        grid: [],
    }
    if (flip) {
        for (let i = 0; i < board.length; i++) for (let j = 0; j < board[0].length; j++) {
            if (!data.grid[j]) data.grid[j] = [];
            data.grid[j].push(board[i][j]);
        }
    } else data.grid = board.map(row => row.map(cell => cell.background_pid || cell));
    return data;
}

const neighbors = (board, point) => {
    let n = [];
    for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) {
        if (!i && !j) continue;
        let p = [point[0] + i, point[1] + j];
        n.push([p, get(board, p)]);
    }
    return n;
} 

/**
 * @param {Number[][]} board 
 * @param {Number[]} point 
 */
const get = (board, point) => {
    if (point[0] < 0 || point[0] >= board[0].length || point[1] < 0 || point[1] >= board.length) return -1;
    return board[point[1]][point[0]];
}

/**
 * @param {Number[][]} board 
 * @param {Number[]} point 
 * @param {Number} pid
 */
const set = (board, point, pid) => {
    if (point[0] < 0 || point[0] > board[0].length || point[1] < 0 || point[1] > board.length) return false;
    board[point[1]][point[0]] = pid;
    return true;
}

/**
 * 
 * @param {Number[][]} arr 
 * @param {Number[]} point 
 */
const has = (arr, point) => arr.some(e => e[0] == point[0] && e[1] == point[1]);

/**
 * @param {import("./cell")[][]} board
 * @param {Number[][]} startPoints
 * @param {Number[][]} tails
 * @param {Number} pid
 */
const tryFill = (board, startPoints, tails, pid, flip) => {
    /** @type {BoardData} */
    let copies = [];
    let limit = board.length * board[0].length;
    let iteration = 0;
    // console.assert(startPoints.length < 9);
    startPoints.forEach(point => {
        let cp = copy(board, flip);
        // console.log(cp.grid, "\n", startPoints, "\n", tails);
        // console.assert(cp.grid[point[1]][point[0]] === 0 && !has(tails, point));
        cp.open_list.push(point);
        cp.start = point;
        copies.push(cp);
    });
    while(copies.length) {
        for (let index in copies) {
            index = ~~index;
            let cp = copies[index];
            let new_open_list = [];
            if (cp.open_list.length === 0) return cp.start;
            cp.failed = cp.open_list.some(p => {
                let n = neighbors(cp.grid, p);
                return n.some(p => {
                    if (has(new_open_list, p[0])) return;
                    if (p[1] === -1) {
                        // console.log("found wall at", p[0], "fill failed");
                        return true;
                    }
                    if (copies.some((other, i) => {
                        if (i !== index && !other.failed && !p[1] && get(other.grid, p[0])) {
                            // console.log("other copies reached the same point, aborted", "index:", index, "other grid\n", other.grid, "\npoint", p[0]);
                            return true;
                        }
                    })) {
                        return true;
                    }
                    if (!has(tails, p[0]) && p[1] !== pid) {
                        new_open_list.push(p[0]);
                        set(cp.grid, p[0], pid);
                    };
                });
            });
            cp.open_list = new_open_list;
            // console.log("copy" + index + " progress\n", cp.grid);
        }
        copies = copies.filter(cp => !cp.failed);
    }
} 

module.exports = { copy, tryFill };

/*
const Cell = require("./cell");
const c = pid => new Cell(undefined, pid, 0, 0, 0, 0);
/** @param {String} str */
/*
const parse = str => str.split("\n").map(row => row.split("").map(s => c(~~s)));

const parseTails = str => {
    let tails = [];
    str.split("\n").forEach((row, row_index) => row.split("").forEach((s, col_index) => s == "x" ? tails.push([col_index, row_index]) : 0));
    return tails;
}

let board_str =
`11111111111
1000000x001
1003500x001
1006702x001
1xxxxxxx001
10000000001
10000000000
11111111111`

let test_board = parse(board_str);

console.log("\nresult:", tryFill(test_board, [[6, 1], [8, 1]], parseTails(board_str), 1));

*/

// node apps/games/yummy/server/fill.js