module.exports = {
    ToString: buf => {
        let arr = [];
        let view = new DataView(buf);
        for(let i = 2; i < view.byteLength; i += 4) {
            arr.push(view.getUint32(i));
        }
        return String.fromCharCode(...arr);
    },
    ToBuffer: (event, data) => {
        let buf;
        if (typeof(data) == 'string') {
            let str = data;
            buf = new ArrayBuffer(str.length * 4 + 2);
            let bufView = new DataView(buf);
            bufView.setUint16(0, event);
            for (let i = 0, strLen = str.length; i < strLen; i++) {
                bufView.setUint32(4 * i + 2, str.charCodeAt(i));
            }
        } else if (typeof(data) == 'number') {
            buf = new ArrayBuffer(4);
            let bufView = new DataView(buf);
            bufView.setUint16(0, event);
            bufView.setUint16(2, data);
        } else if (Array.isArray(data)) {
            buf = new ArrayBuffer(2 + data.length * 4);
            let bufView = new DataView(buf);
            bufView.setUint16(0, event);
            let offset = 2;
            data.forEach(num => {
                bufView.setFloat32(offset, num);
                offset += 4;
            });
        } else {
            buf = new ArrayBuffer(2);
            let bufView = new DataView(buf);
            bufView.setUint16(0, event);
        }
        return buf;
    },
    ToUint16Array: buffer => {
        let view = new DataView(buffer);
        let arr = [];
        for (let i = 0; i < view.byteLength; i += 2) {
            arr.push(view.getUint16(i));
        }
        return arr;
    },
    ToFloat32Array: buffer => {
        let view = new DataView(buffer);
        let arr = [];
        for (let i = 2; i < view.byteLength; i += 4) {
            arr.push(view.getFloat32(i));
        }
        return arr;
    }
}