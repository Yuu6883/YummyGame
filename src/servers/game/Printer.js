/**
 * @param {import("./Cell")[][]} board
 */
module.exports = board => {
    let str = "";
    for (let row of board) {
        for (let cell of row) {
            if (cell.isEmpty()) str += ". ";
            else if (cell.tail_pid) str += "+ ";
            else if (cell.head_pid) str += "H ";
            else str += "X ";
        }
        str += "\n";
    }
    console.log(str);
}