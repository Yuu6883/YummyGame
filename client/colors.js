const COLOR_MIN = 117;
const DARK_GREY = 30;

const getColor = index => {
    let rgb = index ? getRainbow(index % 6, index / 256) : [DARK_GREY, DARK_GREY, DARK_GREY];
    return `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
}

const lighten = c => ~~(255 - 0.5 * (255 - c));

const darken = c => c * 0.6;

const getLightColor = index => {
    let rgb = index ? getRainbow(index % 6, index / 256) : [COLOR_MIN, COLOR_MIN, COLOR_MIN];
    return `rgb(${lighten(rgb[0])},${lighten(rgb[1])},${lighten(rgb[2])})`;
}

const getDarkColor = index => {
    let rgb = index ? getRainbow(index % 6, index / 256) : [COLOR_MIN, COLOR_MIN, COLOR_MIN];
    return `rgb(${darken(rgb[0])},${darken(rgb[1])},${darken(rgb[2])})`;
}

const getRainbow = (index, percent) => {
    switch(index) {
        case 0:
            return [255, COLOR_MIN + ~~(percent * (255 - COLOR_MIN)), COLOR_MIN];
        case 1:
            return [255 - ~~(percent * (255 - COLOR_MIN)), 255, COLOR_MIN];
        case 2:
            return [COLOR_MIN, 255, COLOR_MIN + ~~(percent * (255 - COLOR_MIN))];
        case 3:
            return [COLOR_MIN, 255 - ~~(percent * (255 - COLOR_MIN)), 255];
        case 4:
            return [COLOR_MIN + ~~(percent * (255 - COLOR_MIN)), COLOR_MIN, 255];
        case 5:
            return [255, COLOR_MIN, 255 - ~~(percent * (255 - COLOR_MIN))];
        default:
            return [COLOR_MIN, COLOR_MIN, COLOR_MIN];
    }
}

module.exports = {getColor, getLightColor, getDarkColor};
