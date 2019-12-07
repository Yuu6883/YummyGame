const DELTA_FLAG = 10;
const GRID_FLAG = 1;
const ALL_TAILS_FLAG = 7;
const OFFSET_GRID_FLAG = 4;
const KILL_FLAG = 6;
const ARRAY_GRID_FLAG = 2;

class NetData {
    /**
     * @abstract
     * @param {Number} byteLength 
     * @param {Number} flag 
     */
    constructor (byteLength, flag) {
        this.originalLength = byteLength;
        // Flag -> 2, Size -> 2;
        this.byteLength = byteLength + 4;
        this.dataFlag = flag;
    }

    /**
     * @param {Number} offset 
     * @param {DataView} view 
     * @returns {NetData}
     */
    static decode(offset, size, view) {
    }

    /**
     * @param {Number} offset 
     * @param {DataView} view
     */
    write(offset, view) {
        view.setUint16(offset, this.dataFlag);
        offset += 2;
        view.setUint16(offset, this.originalLength);
        offset += 2;
        return offset;
    }
}

const ErrorCode = {
    SERVER_FULL_CODE: 4,
    SERVER_CROWDED_CODE: 5,
    CONNECTED_DUP_CODE: 6,
}

class NetErrorEvent {

    constructor(code) {
        this.code = code;
    }

    static get CODE() { return 99 }

    static get SEVER_FULL() {
        return new NetErrorEvent(ErrorCode.SERVER_FULL_CODE).buffer;
    }

    static get SEVER_CROWDED() {
        return new NetErrorEvent(ErrorCode.SERVER_CROWDED_CODE).buffer;
    }

    static get CONNECT_DUP() {
        return new NetErrorEvent(ErrorCode.CONNECTED_DUP_CODE).buffer;
    }

    get buffer() {
        let buffer = new ArrayBuffer(4);
        let view = new DataView(buffer);
        view.setUint16(0, NetErrorEvent.CODE);
        view.setUint16(2, this.code);
        return buffer;
    }

    get message() {
        return NetErrorEvent.decode(this.buffer);
    }

    /** @param {DataView | ArrayBuffer} view */
    static decode(view) {
        if (view instanceof ArrayBuffer) view = new DataView(view);
        let code = view.getUint16(2);
        switch (code) {
            case ErrorCode.SERVER_FULL_CODE:
                return "Server Full";
            case ErrorCode.SERVER_CROWDED_CODE:
                return "Server Too Crowded";
            case ErrorCode.CONNECTED_DUP_CODE:
                return "You Already Connected!";
            default:
                return "Unknown Error";
        }
    }
}

const NetEventCode = {
    CHAT: 1,
    PING: 2,
    GAME_DATA: 3,
    MOVE: 7,
    JOIN: 10,
    INFO: 11,
    SERVER_LIST: 12,
    ERROR: 99
}

class GridData extends NetData{
    /**
     * @param {Number[][]} grid 
     * @param {Number} size 
     * @param {Number} tick 
     */
    constructor(grid, size, tick) {
        super(4 + size ** 2, GRID_FLAG);
        this.grid = grid;
        this.size = size;
        this.tick = tick;
    }

    /**
     * @param {Number} offset 
     * @param {DataView} view
     */
    write(offset, view) {
        offset = super.write(offset, view);
        view.setUint16(offset, this.size);
        offset += 2;
        view.setUint16(offset, this.tick);
        offset += 2;
        for (let row of this.grid) for (let pid of row) view.setUint8(offset++, pid);
        return offset;
    }

    /**
     * @param {Number} offset 
     * @param {DataView} view 
     * @returns {{grid: [][], size: Number, tick: Number}}
     */
    static decode(offset, size, view) {
        let s = view.getUint16(offset);
        let target = offset + size;
        offset += 2;
        let tick = view.getUint16(offset);
        offset += 2;
        let decoded = {size: s, tick: tick, grid: []};
        for (let i = 0; i < s; i++) {
            let row = [];
            for (let j = 0; j < s; j++) row.push(view.getUint8(offset++));
            decoded.grid.push(row);
        }
        console.assert(offset === target);
        return decoded;
    }
}

class TailsData extends NetData {
    /** @param {[][]} tails */
    constructor(tails) {
        let size = 0;
        for (let tail of Object.values(tails)) {
            size += tail.length;
        }
        super(4 * size + 3 * Object.keys(tails).length, ALL_TAILS_FLAG);
        this.tails = tails;
    }

    /**
     * @param {Number} offset 
     * @param {DataView} view
     */
    write(offset, view) {
        offset = super.write(offset, view);
        for (let pid in this.tails) {
            view.setUint8(offset++, ~~pid);
            let tail = this.tails[pid];
            tail.forEach(coord =>{
                view.setUint16(offset, coord[0]);
                offset += 2;
                view.setUint16(offset, coord[1]);
                offset += 2;
            });
            view.setUint16(offset, -1);
            offset += 2;
        }
        return offset;
    }

    /**
     * @param {Number} offset 
     * @param {DataView} view 
     * @returns {Number[][][]}
     */
    static decode(offset, size, view) {
        let target = offset + size;
        let decoded = {};
        while (offset < target) {
            let pid = view.getUint8(offset++);
            let tail = [];
            let [x, y] = [view.getUint16(offset), view.getUint16(offset + 2)];
            while (x !== 65535) {
                tail.push([x, y]);
                offset += 4;
                [x, y] = [view.getUint16(offset), view.getUint16(offset + 2)];
            }
            offset += 2;
            decoded[pid] = tail;
        }
        console.assert(offset === target);
        return decoded;
    }
}

class DeltaData extends NetData {

    /**
     * @param {Object.<String, [[]]>} delta 
     */
    constructor(delta) {
        let size = Object.keys(delta).length;
        super(9 * size, DELTA_FLAG);
        this.delta = delta;
    }

    /**
     * @param {Number} offset 
     * @param {DataView} view
     */
    write(offset, view) {
        offset = super.write(offset, view);
        for (let pid in this.delta) {
            view.setUint8(offset++, ~~pid);
            let arr = this.delta[pid]
            view.setUint16(offset, arr[0][0]);
            offset += 2;
            view.setUint16(offset, arr[0][1]);
            offset += 2;
            if (arr[1].length === 2) {
                view.setUint16(offset, arr[1][0]);
                offset += 2;
                view.setUint16(offset, arr[1][1]);
                offset += 2;
            } else if (arr[1].length === 0) {
                view.setUint16(offset, -1);
                offset += 2;
                view.setUint16(offset, -1);
                offset += 2;
            } else console.error("This shouldn't happen");
        }
        return offset;
    }

    /**
     * @param {Number} offset 
     * @param {DataView} view 
     * @returns {Number[][][]}
     */
    static decode(offset, size, view) {
        let target = offset + size;
        let decoded = [];
        while (offset < target) {
            let pid = view.getUint8(offset++);
            let head = [view.getUint16(offset), view.getUint16(offset + 2)];
            offset += 4;
            let tail = [view.getUint16(offset), view.getUint16(offset + 2)];
            offset += 4;
            if (tail[0] === 65535 && tail[1] === 65535) {
                tail = [];
            }
            decoded.push([pid, head, tail]);
        }
        console.assert(offset === target);
        return decoded;
    }
}

class KillData extends NetData{

    /**
     * @param {Number[][]} killed
     */
    constructor(killed) {
        super(3 * killed.length, KILL_FLAG);
        this.killed = killed;
    }

    /**
     * @param {Number} offset 
     * @param {DataView} view
     */
    write(offset, view) {
        offset = super.write(offset, view);
        this.killed.forEach(k => {
            view.setUint8(offset++, k[0]);
            view.setUint8(offset++, k[1]);
            view.setUint8(offset++, k[2] ? 1 : 0);
        });
        return offset;
    }

    /**
     * @param {Number} offset 
     * @param {DataView} view 
     * @returns {[][]}
     */
    static decode(offset, size, view) {
        let target = offset + size;
        let decoded = [];
        while (offset < target) {
            decoded.push([view.getUint8(offset, offset), view.getUint8(offset + 1, offset), view.getUint8(offset + 2, offset)]);
            offset += 3;
        }
        console.assert(offset === target);
        return decoded;
    }
}

class OffsetGridData extends NetData {
    /**
     * @param {{offset: Number[], dim: Number[], grid: Number[]}} data
     */
    constructor(data) {
        super(data.dim[0] * data.dim[1] + 8, OFFSET_GRID_FLAG);
        this.data = data;
    }

    /**
     * @param {Number} offset 
     * @param {DataView} view
     */
    write(offset, view) {
        offset = super.write(offset, view);

        view.setUint16(offset, this.data.offset[0]);
        offset += 2;
        view.setUint16(offset, this.data.offset[1]);
        offset += 2;

        view.setUint16(offset, this.data.dim[0]);
        offset += 2;
        view.setUint16(offset, this.data.dim[1]);
        offset += 2;

        for (let pid of this.data.grid) view.setUint8(offset++, pid);
        
        return offset;
    }

    /**
     * @param {Number} offset 
     * @param {DataView} view 
     * @returns {{grid_offset: Number, dim: Number, grid_array: Number[]}}
     */
    static decode(offset, size, view) {
        let target = offset + size;
        let decoded = [];

        let grid_offset = [view.getUint16(offset), view.getUint16(offset + 2)];
        offset += 4;

        let dim = [view.getUint16(offset), view.getUint16(offset + 2)];
        offset += 4;

        while (offset < target) {
            decoded.push(view.getUint8(offset++));
        }

        console.assert(offset === target);
        return {
            grid_offset: grid_offset,
            dim: dim,
            grid_array: decoded
        }
    }
}

class ArrayGridData extends NetData {
    /**
     * @param {Number[][]} data
     */
    constructor(data) {
        super(data.length * 5, ARRAY_GRID_FLAG);
        this.data = data;
    }

    /**
     * @param {Number} offset 
     * @param {DataView} view
     */
    write(offset, view) {
        offset = super.write(offset, view);

        for (let d of this.data) {
            view.setUint8(offset++, ~~d[0]);
            view.setUint16(offset, d[1]);
            offset += 2;
            view.setUint16(offset, d[2]);
            offset += 2;
        }
        
        return offset;
    }

    /**
     * @param {Number} offset 
     * @param {DataView} view 
     * @returns {[][]}
     */
    static decode(offset, size, view) {
        let target = offset + size;
        let decoded = [];

        while (offset < target) {
            decoded.push([view.getUint8(offset), view.getUint16(offset + 1), view.getUint16(offset + 3)]);
            offset += 5;
        }

        console.assert(offset === target);
        return decoded;
    }
}

/**
 * @param {Number} event
 * @param {Number} pid
 * @param {NetData[]} dataArray
 * @param {Number} time
 */
const BuildBuffer = (pid, time, stats, ...dataArray) => {

    // Event -> 2, PID -> 1, Time -> 4, Stats -> 6
    let size = 13;
    dataArray.forEach(data => size += data.byteLength);

    let buffer = new ArrayBuffer(size);
    let view = new DataView(buffer);

    let offset = 0;

    view.setUint16(offset, NetEventCode.GAME_DATA);
    offset += 2;

    view.setUint8(offset++, pid);

    view.setUint32(offset, time);
    offset += 4;

    dataArray.forEach(data => {
        offset = data.write(offset, view);
    });

    console.assert(stats.length === 3, "stats length check");

    stats.forEach(n => {
        view.setUint16(offset, n);
        offset += 2;
    });

    console.assert(offset === size, "checking bytes");

    return buffer;
}

/**
 * @param {ArrayBuffer} buffer
 */
const ReadBuffer = buffer => {

    let parsedArray = {};

    let view = new DataView(buffer);
    let offset = 2;

    parsedArray.mypid = view.getUint8(offset++);

    parsedArray.time = view.getUint32(offset);
    offset += 4;

    while(offset < view.byteLength - 6) {
        let flag = view.getUint16(offset);
        offset += 2;
        let size = view.getUint16(offset);
        offset += 2;
        switch (flag) {

            case DELTA_FLAG:
                parsedArray.delta = DeltaData.decode(offset, size, view);
            break;

            case GRID_FLAG:
                parsedArray.gridInfo = GridData.decode(offset, size, view);
            break;

            case KILL_FLAG:
                parsedArray.killed = KillData.decode(offset, size, view);
            break;

            case OFFSET_GRID_FLAG:
                parsedArray.offsetGrid = OffsetGridData.decode(offset, size, view);
            break;

            case ARRAY_GRID_FLAG:
                parsedArray.arrayGrid = ArrayGridData.decode(offset, size, view);
            break;

            case ALL_TAILS_FLAG:
                parsedArray.tails = TailsData.decode(offset, size, view);
            break;

            default:
                console.error("Unknown flag", flag);
        }
        offset += size;
    }

    let stats = [view.getUint16(offset), view.getUint16(offset + 2), view.getUint16(offset + 4)];
    if (stats[0] === 65535 && stats[1] === 65535 && stats[0] === 65535) {

    } else {
        parsedArray.stats = stats;
    }
    offset += 6;

    console.assert(offset === view.byteLength, "parsing bytes");

    return parsedArray;
}

module.exports = {
    NetErrorEvent,
    KillData,
    DeltaData,
    GridData,
    TailsData,
    OffsetGridData,
    ArrayGridData,
    ErrorCode,
    NetEventCode,
    write: BuildBuffer,
    read: ReadBuffer
}

// node apps/games/yummy/server/netEvent.js

// let data = [];
// data.push(new TailsData({'1': [[1, 2], [3, 4]], '2': [[5, 6], [7, 8]]}));
// data.push(new KillData([[1, 5, 0], [5, 1, 0]]));
// data.push(new OffsetGridData({offset: [99, 6969], dim: [3, 3], grid: [1, 2, 3, 4, 5, 6, 7, 8, 9]}));
// data.push(new ArrayGridData([[1, 5, 6], [2, 60, 40], [8, 2993, 9999]]));
// data.push(new GridData([[1, 2, 3], [4, 5, 6], [7, 8, 9]], 3, 1333));
// data.push(new DeltaData({"1": [[6666, 9999], [1234, 4321]], "45": [[1,4], [5, 9]]}));

// let buffer = BuildBuffer(3, 489141829, [99, 78, 42189], ...data);
// console.log(JSON.stringify(ReadBuffer(buffer), null, 4));

// console.log(NetErrorEvent.decode(NetErrorEvent.SEVER_FULL))