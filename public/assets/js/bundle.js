(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
},{}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
module.exports = class GameManager {
    constructor() {
        this.initEvent();
    }

    initEvent() {
        
    }
}
},{}],4:[function(require,module,exports){
const mobilecheck = () => /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test((navigator.userAgent||navigator.vendor||window.opera).substr(0, 4))||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test((navigator.userAgent||navigator.vendor||window.opera).substr(0, 4));

/** 
 * @type {import("sweetalert2").default} 
 */
const Swal = window.Swal;
const MobileManager = require("./mobile");

module.exports = class InputManager{

    /**
     * @param {import("./login")} loginManager 
     */
    constructor(loginManager) {
        this.loginManager = loginManager;
        this.isMobile = mobilecheck();
        this.mobileManager = this.mobileManager ? new MobileManager() : undefined;
        this.tick = 200;
        this.serverList = [];
        this.initEvents();
        setTimeout(() => {
            if (!this.loginManager.logged_in) this.showLogin(true);
            this.loginManager.loginCancel();
        }, 500);
    }

    initEvents() {

        $(window).on('touchmove', e => {
            e.preventDefault();
            window.scrollTo(0, 0);
        });
        
        $(window).on('touchstart', e => {
            if (e.target.nodeName !== 'INPUT') {
                e.preventDefault();
                window.scrollTo(0, 0);
            }
        });

        $(window).on("gameTick", (event, tick) => this.tick = tick);

        $(window).on("stats", (event, ...stats) => {
            this.show({
                title: '<h1>Gameover...</h1>',
                html: `<p><h2>Suirvive time: <strong>${(stats[0] * stats[3] / 1000).toFixed(1)}</strong> seconds</h2></p>
                        <p><h2>Highscore: <strong>${stats[1]}</strong></h2></p>
                        <p><h2>Player killed: <strong>${stats[2]}</strong></h2></p>`,
                showCancelButton: false,
                confirmButtonText: 'Try Again',
            }, true).then(result => {
                this.showPlayerProfile();
            });
        });

        let keys = {};

        $("#chat").keydown(e => {
            let key = e.which || e.keyCode;
            if (key === 13) {
                let chat = $("#chat").val().trim();
                if (chat) $(window).trigger("sendChat", chat);
                $("#chat").val("").hide();
            }
        });

        $(document.body).keydown(b => {
            if($("#chat").is(":focus")) return;
            let key = b.which || b.keyCode;
            if (keys[key]) return;
            keys[key] = true;
            if (key === 13) {
                if ($("#chat").is(":hidden")) {
                    $("#chat").show();
                }
                if (!$("#chat").is(":focus")) {
                    $("#chat").focus();
                }
            } else {
                if (key === 87 || key === 38)  $(window).trigger("move:up")
                else if (key === 65 || key === 37) $(window).trigger("move:left")
                else if (key === 68 || key === 39) $(window).trigger("move:right")
                else if (key === 83 || key === 40) $(window).trigger("move:down")
            }
        });

        $(document.body).keyup(b => {
            let key = b.which || b.keyCode;
            keys[key] = false;
        });

        $(window).resize(() => this.resizeToWindow(document.getElementById("canvas")));
        this.resizeToWindow(document.getElementById("canvas"));

        $(window).on("loginSucceed", (event, info) => {
            if (!info.data) return this.loginManager.logout();
            let pfpURL;
            let username;
            switch (info.data.type) {
                case "discord":
                    pfpURL = `https://cdn.discordapp.com/avatars/${info.data.id}/${info.data.avatar}.png`;
                    username = info.data.user;
                break;
                case "google":
                    pfpURL = info.data.avatar;
                    username = info.data.name;
                break;
                case "facebook":
                    pfpURL = `http://graph.facebook.com/${info.data.id}/picture?type=large`;
                    username = info.data.name.split(" ")[0];
                break;
                case "guest":
                    pfpURL = info.data.avatar;
                    username = info.data.name;
                    $("#logout_button").hide();
                break;
                default:
                    console.error("Unknown Account Type!!");
            }
            this.pfpURL = pfpURL;
            this.username = username;
            this.showPlayerProfile();
        });

        $(window).on("loggingIn", () => {
            Swal.fire({
                title: "Logging In",
                onOpen: () => Swal.showLoading(),
                showConfirmButton: false,
                showCancelButton: true,
                allowOutsideClick: false,
            }).then(result => {
                this.loginManager.logout();
            });
        });

        $(window).on("err", (event, err) => {
            this.err(err);
        });

        $(window).on("loginCancel", () => Swal.hideLoading());

        $(window).on("serverList", (event, ...serverList) => {
            this.serverList = serverList;
        });

        window.s = () => $(window).trigger("stop");
    }

    showPlayerProfile(){
        this.show({
            title: "Player Info",
            html:  `<img src="${this.pfpURL}" class="pfp rounded-circle"><br><p><h2 id="playerName">${this.username}</h2>
                    <h3>Choose a Server</h3>
                    <select class="uk-select" id="serverList"></select>
                    <br><br><br>
                    </p>`,
            showConfirmButton: true,
            showCancelButton: true,
            confirmButtonText: 'Play',
            cancelButtonText: "Log out",
            cancelButtonColor: "#d10000",
            allowOutsideClick: false,
            onOpen: async () => {
                Swal.showLoading();
                await InputManager.refreshServerList(this);
                Swal.hideLoading();
                $("#serverList").innerHTML = "";
                this.serverList.forEach(name => {
                    $("#serverList").append(`<option>${name}</option>`)
                });
            }
        }, true).then(result => {
            if (result.value === true) {
                
                let name = $("#serverList").val();
                if (!name || !this.serverList.includes(name)) {
                    this.err("Unknown Server")
                        .then(() => this.showPlayerProfile());
                } else {
                    $(window).trigger("join", [this.username, name]);
                }
            } else if (result.dismiss === "cancel"){
                this.loginManager.logout();
            } else {
            }
        });
    }
    
    err(err) {
        return this.show({
            type: "error",
            title: "Ops...",
            text: err.message || String(err) || "Unknown Error" + (err.stack || ""),
            showConfirmButton: false,
            showCancelButton: true,
            cancelButtonColor: "#d10000"
        }, true);
    }

    /**
     * 
     * @param {InputManager} self 
     */
    static refreshServerList(self) {
        return new Promise(async (resolve, reject) => {
            if (self.serverList.length) {
                resolve();
            }else {
                setTimeout(async () => {
                    resolve(await InputManager.refreshServerList(self))
                }, 1000);
            }
        })
    }

    /**
     * @param {import("sweetalert2").SweetAlertOptions} option 
     */
    async show(option, force) {
        if (!force && Swal.isVisible()) return;
        return Swal.fire(option).catch(e => $(window).trigger("err", e));
    }

    animateButton(element, oof) {
        let elements = $(element);
        if (elements[0] && elements[0].firstChild) {
            elements[0].firstChild.src = `assets/img/${oof}_normal.png`;
            elements.hover(() => {
                elements[0].firstChild.src = `assets/img/${oof}_hover.png`;
            }).mouseout(() => {
                elements[0].firstChild.src = `assets/img/${oof}_normal.png`;
            }).mousedown(() => {
                elements[0].firstChild.src = `assets/img/${oof}_press.png`;
            }).mouseup(() => {
                elements[0].firstChild.src = `assets/img/${oof}_normal.png`;
            });
        }
    }

    showLogin(force) {
        this.show({
            title: 'Yummy Game',
            html: "<h3>You can login with " +
            "<span class='google-color4 font-md'>G</span>" + 
            "<span class='google-color2 font-md'>o</span>" + 
            "<span class='google-color3 font-md'>o</span>" + 
            "<span class='google-color4 font-md'>g</span>" + 
            "<span class='google-color1 font-md'>l</span>" + 
            "<span class='google-color2 font-md'>e</span>, <span class='discord-color font-md'>Discord</span>, <span class='facebook-color font-md'>Facebook</span>, or play as a <span class='guest-color'>guest</span></h3>",
            showConfirmButton: true,
            confirmButtonText: 'Continue',
            confirmButtonColor: '#6d00c1',
            allowOutsideClick: false,
        }, force).then(result => {
            this.mediaLoginCard(force);
        });
    }

    mediaLoginCard(force) {
        const handleClick = (type, rem) => {
            if (type == "guest") {
                this.loginManager.playerAsGuest();
            } else {
                this.loginManager.remember(rem || false);
                Swal.getContent().remove();
                Swal.showLoading();
                this.loginManager.loginWithMedia(type);
            }
        }
        this.show({
            html: "<p><a id='discord_login_button'><img class='login-buttons'></a>" +
            "<a id='facebook_login_button'><img class='login-buttons'></a>" + 
            "<a id='google_login_button'><img class='login-buttons'></a>" +
            "<a id='guest_login_button'><img class='login-buttons'></a></p>" + 
            '<label id="remember"><input class="uk-checkbox" type="checkbox" id="remember_box"> &nbsp;remember me</label>',
            showConfirmButton: false,
            showCancelButton: false,
            allowOutsideClick: false,
            onOpen: () => {
                let buttons = [
                    $("#discord_login_button").click(() => handleClick("discord", $("#remember_box").is(":checked"))),
                    $("#facebook_login_button").click(() => handleClick("facebook", $("#remember_box").is(":checked"))),
                    $("#google_login_button").click(() => handleClick("google", $("#remember_box").is(":checked"))),
                    $("#guest_login_button").click(() => handleClick("guest"))];
                buttons.forEach((button, index) => this.animateButton(button, ["discord", "facebook", "google", "guest"][index]));
            }
        }, force);
    }

    /**
     * 
     * @param {HTMLElement} element 
     */
    resizeToWindow(element) {

        if (!element) return;
        if (this.isMobile) {
            element.width = screen.width;
            element.height = screen.height;
            element.style.width = screen.width;
            element.style.height = screen.height;
        } else {
            element.width = window.innerWidth;
            element.height = window.innerHeight;
            element.style.width = window.innerWidth;
            element.style.height = window.innerHeight;
        }
        window.scrollTo(0, 0);
    }
}
},{"./mobile":7}],5:[function(require,module,exports){
const parseJwt = token => {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
};

module.exports = class LoginManager{

    constructor(auth_path){
        console.log(`Initializing Login Manager`, `Auth Path: ${auth_path}`)
        this.auth_path = auth_path;
        this.logging_in = false;
        this.logged_in = false;

        let onetime_login = localStorage.getItem("login");
        let auto_login = localStorage.getItem("auto_login");

        setTimeout(() => {
            if (onetime_login === "off") {
                this.logging_in = false;
                this.loginCancel();
            } else if (onetime_login === "on"){
                this.login();
                localStorage.setItem("login","");
            }
            if (auto_login === "on" && onetime_login !== "off") {
                this.remember(true);
                this.login();
            } else {
                this.logging_in = false;
                this.loginCancel();
            }
        }, 500);
    }

    login(){
        if (this.logging_in || this.logged_in) return;
        this.logging_in = true;
        $(window).trigger("loggingIn");
        try {
            $.ajax({
                url: `${this.auth_path}/login`,
                type: "POST",
                crossDomain: true,
                data: "",
                dataType: "json",
                xhrFields: {
                    withCredentials: true
                },
                success: response => {
                    if (response.jwt){
                        this.logJWT(response.jwt);
                        this.info = parseJwt(response.jwt);
                        this.loginSucceed();
                    } else {
                        this.loginCancel();
                        this.throwError(response.error || "No JWT received from server");
                    }
                },
                error: err => {
                    this.logging_in = false;
                    this.throwError("Login Error: " + err.responseText || "Unknown Error");
                    this.loginCancel();
                }
            });
        } catch (e) {
            this.loginCancel();
            this.throwError(e.message || "No JWT received from server");
        }
    }

    loginWithMedia(media){
        if(!["discord", "facebook", "google"].includes(media)) return;
        localStorage.setItem("login","on");
        window.location.href = `${this.auth_path}/${media}/login?redirect=${encodeURIComponent(window.location.href)}`;
    }

    playerAsGuest(){
        this.info = {
            type: "guest",
            name: "Guest",
            avatar: "https://i.stack.imgur.com/34AD2.jpg"
        }
        this.loginSucceed();
    }

    logout(){
        $.ajax({
            url: `${this.auth_path}/logout`,
            type: "POST",
            data: "",
            dataType: "json",
            xhrFields: {
                withCredentials: true
            },
            success: response => {
                if (response.success){
                    localStorage.setItem("login","off");
                    window.location.reload();
                } else {
                    this.throwError(response.error || "Unknown logout error");
                }
            },
            error: err => {
                this.throwError("Logout Error: " + err.responseText || "Unknown Error");
            }
        });
    }

    logJWT(jwt){
        let jwt2 = jwt.split(/[.]/);
        console.log("%cJWT:", "font-weight:bold;");
        console.log("%c" + jwt2[0] + ".%c" + jwt2[1] + ".%c" + jwt2[2], "font-size:10px;color:#fb015b;", "font-size:10px;color:#d63aff;", "font-size:10px;color:#00b9f1;", '');
    }

    remember(me){
        localStorage.setItem("auto_login", me ? "on" : "off");
    }

    getLoginInfo(){
        return {
            logged_in: this.logged_in,
            logging_in: this.logging_in,
            data: this.info
        }
    }

    loginCancel(msg){
        if(this.logging_in || this.logged_in) return;
        this.logging_in = false;
        this.logged_in = false;
        if (msg) $(window).trigger("err", new Error(msg || "Unknown Error"));
        $(window).trigger("loginCancel");
    }

    loginSucceed(){
        this.logged_in = true;
        $(window).trigger("loginSucceed", this.getLoginInfo());
    }

    throwError(msg){
        $(window).trigger("loginError", msg);
    }
}
},{}],6:[function(require,module,exports){
const SocketPath = window.location.href.replace("http", "ws").replace(/#|_|=/g, "");
const AuthPath = window.location.href.replace("yummy", "api/auth").replace(/#|_|=/g, "");

const LoginManager = require("./login");
const Renderer = require("./renderer");
const InputManager = require("./input");
const SocketClient = require("./socket");
const GameManager = require("./game");

const onload = () => {
    let loginManger = new LoginManager(AuthPath);
    Renderer.start();
    new InputManager(loginManger);
    new SocketClient(SocketPath);
    new GameManager();
}

$(document.body).ready(onload);

// browserify apps/games/yummy/client/main.js -o apps/games/yummy/public/assets/js/bundle.js
},{"./game":3,"./input":4,"./login":5,"./renderer":8,"./socket":9}],7:[function(require,module,exports){
const nipplejs = require("nipplejs");

module.exports = class MobileManager {
    
    constructor() {
        this.initEvents();
    }

    initEvents() {
        $(window).on("join", this.onJoin);
    }

    onJoin() {
        this.manager = nipplejs.create({
            mode: "static",
            position: {
                bottom: "20%",
                left: "20%"
            },
            size: 250                
        });
        manager.on("dir:down", $(window).trigger("move:down"));
        manager.on("dir:up", () => $(window).trigger("move:up"));
        manager.on("dir:right", () => $(window).trigger("move:right"));
        manager.on("dir:left", () => $(window).trigger("move:left"));
    }
}
},{"nipplejs":11}],8:[function(require,module,exports){

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
         * @param {{time: Number, mypid: Number, delta: Number[][][], arrayGrid: Number[][], offsetGrid: {grid_offset: Number[], dim: Number[], grid_array: Number[]}, gridInfo: {grid: Number[][], size: number, tick: number}, killed: [][], stats: number[], tails: [][][]}} data
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
                for (let pid in data.tails) {
                    this.players[pid].tails = data.tails[pid];
                }
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
},{"./colors":2}],9:[function(require,module,exports){
const RATE_LIMIT = 60;
const { ToString, ToBuffer } = require("../bufferUtil");
const { read, NetErrorEvent, NetEventCode } = require("../server/netEvent");

module.exports = class SocketManager {

    constructor(socket_path) {
        this.path = socket_path;
        this.initEvents();
    }

    initSocket() {
        if (this.socket && this.socket.readyState === 1) return $(window).trigger("err", new Error("Can't init socket when it's already connected!!"));
        this.socket = new WebSocket(this.path);
        this.socket.binaryType = "arraybuffer";
        this.socket.onopen = () => {
            console.log("Connected");
            $(window).trigger("connected");
        }
        this.socket.onmessage = message => {
            let view = new DataView(message.data);
            let event = view.getUint16(0);
            try {
                switch (event) {

                    case NetEventCode.CHAT:
                        $(window).trigger("chat", JSON.parse(ToString(message.data)));
                        break;
                    
                    case NetEventCode.PING:
                        $(window).trigger("rtt", Date.now() - this.lastPing);
                        setTimeout(this.ping, 1000);
                        break;
    
                    case NetEventCode.GAME_DATA:
                        this.process(read(message.data));
                        break;
    
                    case NetEventCode.INFO:
                        $(window).trigger("playerInfo", JSON.parse(ToString(message.data)));
                        break;
                    
                    case NetEventCode.SERVER_LIST:
                        $(window).trigger("serverList", JSON.parse(ToString(message.data)));
                        break;
    
                    case NetErrorEvent.CODE:
                        throw new Error(NetErrorEvent.decode(view));
    
                    default:
                        throw new Error(`Unknown event: ${event}, data length: ${view.byteLength - 2} bytes, toString: ${ToString(message.data)}`);
                }
            } catch (e) {
                $(window).trigger("err", e);
            }
        }
        this.socket.onclose = this.socket.onerror = () => setTimeout(this.reconnect, 5000, this);
        this.lastSent = 0;
        return true;
    }

    initEvents() {
        $(window).on("loginSucceed", (event, info) => this.initSocket());
        $(window).on("join", (event, name, server) => this.join(name, server));
        $(window).on("sendChat", (event, chat) => this.sendChat(chat));
        $(window).on("move:up", () => this.send(ToBuffer(NetEventCode.MOVE, 1)));
        $(window).on("move:down", () => this.send(ToBuffer(NetEventCode.MOVE, 0)));
        $(window).on("move:right", () => this.send(ToBuffer(NetEventCode.MOVE, 2)));
        $(window).on("move:left", () => this.send(ToBuffer(NetEventCode.MOVE, 3)));
    }

    /**
     * @param {{time: Number, mypid: Number, delta: Number[][][], arrayGrid: Number[][], offsetGrid: {grid_offset: Number[], dim: Number[], grid_array: Number[]}, gridInfo: {grid: Number[][], size: number, tick: number}, killed: [][], stats: number[]}} data
     */
    process (data) {
        $(window).trigger("gameData", data);
        // console.log(`Surivive Time: ${(data.stats[0] * tick / 1000).toFixed(1)} Seconds, HighScore: ${data.stats[1]}, Enemy Killed: ${data.stats[2]}`);
        if (data.killed && data.killed.some(a => a[0] == data.mypid)) $(window).trigger("dead", data);
    }

    join(name, server) {
        name = name.slice(0, 16);
        if (name.length < 16) name += " ".repeat(16 - name.length);
        this.send(ToBuffer(NetEventCode.JOIN, name.slice(0, 16) + server), true);
        localStorage.setItem("nick", name);
    }

    send(data, force) {
        if (!force && Date.now() - this.lastSent < 1000 / RATE_LIMIT) return;
        if(this.socket && this.socket.readyState === 1) {
            this.lastSent = Date.now();
            this.socket.send(data);
        }
    }

    sendChat(chat) {
        this.send(ToBuffer(NetEventCode.CHAT, chat.slice(0, 200)));
    }
    
    /** @param {SocketManager} self */
    reconnect(self) {
        self.socket.close();
        self.initSocket();
        $(window).trigger("reconnecting");
    }

    ping() {
        this.lastPing = Date.now();
        this.send(ToBuffer(NetEventCode.PING));
    }
}
},{"../bufferUtil":1,"../server/netEvent":10}],10:[function(require,module,exports){
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
    SERVER_LIST: 12
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
},{}],11:[function(require,module,exports){
!function(t,i){"object"==typeof exports&&"object"==typeof module?module.exports=i():"function"==typeof define&&define.amd?define("nipplejs",[],i):"object"==typeof exports?exports.nipplejs=i():t.nipplejs=i()}(window,function(){return function(t){var i={};function e(o){if(i[o])return i[o].exports;var n=i[o]={i:o,l:!1,exports:{}};return t[o].call(n.exports,n,n.exports,e),n.l=!0,n.exports}return e.m=t,e.c=i,e.d=function(t,i,o){e.o(t,i)||Object.defineProperty(t,i,{enumerable:!0,get:o})},e.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},e.t=function(t,i){if(1&i&&(t=e(t)),8&i)return t;if(4&i&&"object"==typeof t&&t&&t.__esModule)return t;var o=Object.create(null);if(e.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:t}),2&i&&"string"!=typeof t)for(var n in t)e.d(o,n,function(i){return t[i]}.bind(null,n));return o},e.n=function(t){var i=t&&t.__esModule?function(){return t.default}:function(){return t};return e.d(i,"a",i),i},e.o=function(t,i){return Object.prototype.hasOwnProperty.call(t,i)},e.p="",e(e.s=0)}([function(t,i,e){"use strict";e.r(i);var o,n=function(t,i){var e=i.x-t.x,o=i.y-t.y;return Math.sqrt(e*e+o*o)},s=function(t){return t*(Math.PI/180)},r=function(t){return t*(180/Math.PI)},d=function(t,i,e){for(var o,n=i.split(/[ ,]+/g),s=0;s<n.length;s+=1)o=n[s],t.addEventListener?t.addEventListener(o,e,!1):t.attachEvent&&t.attachEvent(o,e)},p=function(t,i,e){for(var o,n=i.split(/[ ,]+/g),s=0;s<n.length;s+=1)o=n[s],t.removeEventListener?t.removeEventListener(o,e):t.detachEvent&&t.detachEvent(o,e)},a=function(t){return t.preventDefault(),t.type.match(/^touch/)?t.changedTouches:t},c=function(){return{x:void 0!==window.pageXOffset?window.pageXOffset:(document.documentElement||document.body.parentNode||document.body).scrollLeft,y:void 0!==window.pageYOffset?window.pageYOffset:(document.documentElement||document.body.parentNode||document.body).scrollTop}},h=function(t,i){i.top||i.right||i.bottom||i.left?(t.style.top=i.top,t.style.right=i.right,t.style.bottom=i.bottom,t.style.left=i.left):(t.style.left=i.x+"px",t.style.top=i.y+"px")},l=function(t,i,e){var o=u(t);for(var n in o)if(o.hasOwnProperty(n))if("string"==typeof i)o[n]=i+" "+e;else{for(var s="",r=0,d=i.length;r<d;r+=1)s+=i[r]+" "+e+", ";o[n]=s.slice(0,-2)}return o},u=function(t){var i={};i[t]="";return["webkit","Moz","o"].forEach(function(e){i[e+t.charAt(0).toUpperCase()+t.slice(1)]=""}),i},f=function(t,i){for(var e in i)i.hasOwnProperty(e)&&(t[e]=i[e]);return t},y=function(t,i){if(t.length)for(var e=0,o=t.length;e<o;e+=1)i(t[e]);else i(t)},m=!!("ontouchstart"in window),v=!!window.PointerEvent,g=!!window.MSPointerEvent,b={start:"mousedown",move:"mousemove",end:"mouseup"},x={};function O(){}v?o={start:"pointerdown",move:"pointermove",end:"pointerup, pointercancel"}:g?o={start:"MSPointerDown",move:"MSPointerMove",end:"MSPointerUp"}:m?(o={start:"touchstart",move:"touchmove",end:"touchend, touchcancel"},x=b):o=b,O.prototype.on=function(t,i){var e,o=t.split(/[ ,]+/g);this._handlers_=this._handlers_||{};for(var n=0;n<o.length;n+=1)e=o[n],this._handlers_[e]=this._handlers_[e]||[],this._handlers_[e].push(i);return this},O.prototype.off=function(t,i){return this._handlers_=this._handlers_||{},void 0===t?this._handlers_={}:void 0===i?this._handlers_[t]=null:this._handlers_[t]&&this._handlers_[t].indexOf(i)>=0&&this._handlers_[t].splice(this._handlers_[t].indexOf(i),1),this},O.prototype.trigger=function(t,i){var e,o=this,n=t.split(/[ ,]+/g);o._handlers_=o._handlers_||{};for(var s=0;s<n.length;s+=1)e=n[s],o._handlers_[e]&&o._handlers_[e].length&&o._handlers_[e].forEach(function(t){t.call(o,{type:e,target:o},i)})},O.prototype.config=function(t){this.options=this.defaults||{},t&&(this.options=function(t,i){var e={};for(var o in t)t.hasOwnProperty(o)&&i.hasOwnProperty(o)?e[o]=i[o]:t.hasOwnProperty(o)&&(e[o]=t[o]);return e}(this.options,t))},O.prototype.bindEvt=function(t,i){var e=this;return e._domHandlers_=e._domHandlers_||{},e._domHandlers_[i]=function(){"function"==typeof e["on"+i]?e["on"+i].apply(e,arguments):console.warn('[WARNING] : Missing "on'+i+'" handler.')},d(t,o[i],e._domHandlers_[i]),x[i]&&d(t,x[i],e._domHandlers_[i]),e},O.prototype.unbindEvt=function(t,i){return this._domHandlers_=this._domHandlers_||{},p(t,o[i],this._domHandlers_[i]),x[i]&&p(t,x[i],this._domHandlers_[i]),delete this._domHandlers_[i],this};var _=O;function w(t,i){return this.identifier=i.identifier,this.position=i.position,this.frontPosition=i.frontPosition,this.collection=t,this.defaults={size:100,threshold:.1,color:"white",fadeTime:250,dataOnly:!1,restJoystick:!0,restOpacity:.5,mode:"dynamic",zone:document.body,lockX:!1,lockY:!1},this.config(i),"dynamic"===this.options.mode&&(this.options.restOpacity=0),this.id=w.id,w.id+=1,this.buildEl().stylize(),this.instance={el:this.ui.el,on:this.on.bind(this),off:this.off.bind(this),show:this.show.bind(this),hide:this.hide.bind(this),add:this.addToDom.bind(this),remove:this.removeFromDom.bind(this),destroy:this.destroy.bind(this),resetDirection:this.resetDirection.bind(this),computeDirection:this.computeDirection.bind(this),trigger:this.trigger.bind(this),position:this.position,frontPosition:this.frontPosition,ui:this.ui,identifier:this.identifier,id:this.id,options:this.options},this.instance}w.prototype=new _,w.constructor=w,w.id=0,w.prototype.buildEl=function(t){return this.ui={},this.options.dataOnly?this:(this.ui.el=document.createElement("div"),this.ui.back=document.createElement("div"),this.ui.front=document.createElement("div"),this.ui.el.className="nipple collection_"+this.collection.id,this.ui.back.className="back",this.ui.front.className="front",this.ui.el.setAttribute("id","nipple_"+this.collection.id+"_"+this.id),this.ui.el.appendChild(this.ui.back),this.ui.el.appendChild(this.ui.front),this)},w.prototype.stylize=function(){if(this.options.dataOnly)return this;var t=this.options.fadeTime+"ms",i=function(t,i){var e=u(t);for(var o in e)e.hasOwnProperty(o)&&(e[o]=i);return e}("borderRadius","50%"),e=l("transition","opacity",t),o={};return o.el={position:"absolute",opacity:this.options.restOpacity,display:"block",zIndex:999},o.back={position:"absolute",display:"block",width:this.options.size+"px",height:this.options.size+"px",marginLeft:-this.options.size/2+"px",marginTop:-this.options.size/2+"px",background:this.options.color,opacity:".5"},o.front={width:this.options.size/2+"px",height:this.options.size/2+"px",position:"absolute",display:"block",marginLeft:-this.options.size/4+"px",marginTop:-this.options.size/4+"px",background:this.options.color,opacity:".5"},f(o.el,e),f(o.back,i),f(o.front,i),this.applyStyles(o),this},w.prototype.applyStyles=function(t){for(var i in this.ui)if(this.ui.hasOwnProperty(i))for(var e in t[i])this.ui[i].style[e]=t[i][e];return this},w.prototype.addToDom=function(){return this.options.dataOnly||document.body.contains(this.ui.el)?this:(this.options.zone.appendChild(this.ui.el),this)},w.prototype.removeFromDom=function(){return this.options.dataOnly||!document.body.contains(this.ui.el)?this:(this.options.zone.removeChild(this.ui.el),this)},w.prototype.destroy=function(){clearTimeout(this.removeTimeout),clearTimeout(this.showTimeout),clearTimeout(this.restTimeout),this.trigger("destroyed",this.instance),this.removeFromDom(),this.off()},w.prototype.show=function(t){var i=this;return i.options.dataOnly?i:(clearTimeout(i.removeTimeout),clearTimeout(i.showTimeout),clearTimeout(i.restTimeout),i.addToDom(),i.restCallback(),setTimeout(function(){i.ui.el.style.opacity=1},0),i.showTimeout=setTimeout(function(){i.trigger("shown",i.instance),"function"==typeof t&&t.call(this)},i.options.fadeTime),i)},w.prototype.hide=function(t){var i=this;return i.options.dataOnly?i:(i.ui.el.style.opacity=i.options.restOpacity,clearTimeout(i.removeTimeout),clearTimeout(i.showTimeout),clearTimeout(i.restTimeout),i.removeTimeout=setTimeout(function(){var e="dynamic"===i.options.mode?"none":"block";i.ui.el.style.display=e,"function"==typeof t&&t.call(i),i.trigger("hidden",i.instance)},i.options.fadeTime),i.options.restJoystick&&i.restPosition(),i)},w.prototype.restPosition=function(t){var i=this;i.frontPosition={x:0,y:0};var e=i.options.fadeTime+"ms",o={};o.front=l("transition",["top","left"],e);var n={front:{}};n.front={left:i.frontPosition.x+"px",top:i.frontPosition.y+"px"},i.applyStyles(o),i.applyStyles(n),i.restTimeout=setTimeout(function(){"function"==typeof t&&t.call(i),i.restCallback()},i.options.fadeTime)},w.prototype.restCallback=function(){var t={};t.front=l("transition","none",""),this.applyStyles(t),this.trigger("rested",this.instance)},w.prototype.resetDirection=function(){this.direction={x:!1,y:!1,angle:!1}},w.prototype.computeDirection=function(t){var i,e,o,n=t.angle.radian,s=Math.PI/4,r=Math.PI/2;if(n>s&&n<3*s&&!t.lockX?i="up":n>-s&&n<=s&&!t.lockY?i="left":n>3*-s&&n<=-s&&!t.lockX?i="down":t.lockY||(i="right"),t.lockY||(e=n>-r&&n<r?"left":"right"),t.lockX||(o=n>0?"up":"down"),t.force>this.options.threshold){var d,p={};for(d in this.direction)this.direction.hasOwnProperty(d)&&(p[d]=this.direction[d]);var a={};for(d in this.direction={x:e,y:o,angle:i},t.direction=this.direction,p)p[d]===this.direction[d]&&(a[d]=!0);if(a.x&&a.y&&a.angle)return t;a.x&&a.y||this.trigger("plain",t),a.x||this.trigger("plain:"+e,t),a.y||this.trigger("plain:"+o,t),a.angle||this.trigger("dir dir:"+i,t)}return t};var T=w;function k(t,i){return this.nipples=[],this.idles=[],this.actives=[],this.ids=[],this.pressureIntervals={},this.manager=t,this.id=k.id,k.id+=1,this.defaults={zone:document.body,multitouch:!1,maxNumberOfNipples:10,mode:"dynamic",position:{top:0,left:0},catchDistance:200,size:100,threshold:.1,color:"white",fadeTime:250,dataOnly:!1,restJoystick:!0,restOpacity:.5,lockX:!1,lockY:!1},this.config(i),"static"!==this.options.mode&&"semi"!==this.options.mode||(this.options.multitouch=!1),this.options.multitouch||(this.options.maxNumberOfNipples=1),this.updateBox(),this.prepareNipples(),this.bindings(),this.begin(),this.nipples}k.prototype=new _,k.constructor=k,k.id=0,k.prototype.prepareNipples=function(){var t=this.nipples;t.on=this.on.bind(this),t.off=this.off.bind(this),t.options=this.options,t.destroy=this.destroy.bind(this),t.ids=this.ids,t.id=this.id,t.processOnMove=this.processOnMove.bind(this),t.processOnEnd=this.processOnEnd.bind(this),t.get=function(i){if(void 0===i)return t[0];for(var e=0,o=t.length;e<o;e+=1)if(t[e].identifier===i)return t[e];return!1}},k.prototype.bindings=function(){this.bindEvt(this.options.zone,"start"),this.options.zone.style.touchAction="none",this.options.zone.style.msTouchAction="none"},k.prototype.begin=function(){var t=this.options;if("static"===t.mode){var i=this.createNipple(t.position,this.manager.getIdentifier());i.add(),this.idles.push(i)}},k.prototype.createNipple=function(t,i){var e=c(),o={},n=this.options;if(t.x&&t.y)o={x:t.x-(e.x+this.box.left),y:t.y-(e.y+this.box.top)};else if(t.top||t.right||t.bottom||t.left){var s=document.createElement("DIV");s.style.display="hidden",s.style.top=t.top,s.style.right=t.right,s.style.bottom=t.bottom,s.style.left=t.left,s.style.position="absolute",n.zone.appendChild(s);var r=s.getBoundingClientRect();n.zone.removeChild(s),o=t,t={x:r.left+e.x,y:r.top+e.y}}var d=new T(this,{color:n.color,size:n.size,threshold:n.threshold,fadeTime:n.fadeTime,dataOnly:n.dataOnly,restJoystick:n.restJoystick,restOpacity:n.restOpacity,mode:n.mode,identifier:i,position:t,zone:n.zone,frontPosition:{x:0,y:0}});return n.dataOnly||(h(d.ui.el,o),h(d.ui.front,d.frontPosition)),this.nipples.push(d),this.trigger("added "+d.identifier+":added",d),this.manager.trigger("added "+d.identifier+":added",d),this.bindNipple(d),d},k.prototype.updateBox=function(){this.box=this.options.zone.getBoundingClientRect()},k.prototype.bindNipple=function(t){var i,e=this,o=function(t,o){i=t.type+" "+o.id+":"+t.type,e.trigger(i,o)};t.on("destroyed",e.onDestroyed.bind(e)),t.on("shown hidden rested dir plain",o),t.on("dir:up dir:right dir:down dir:left",o),t.on("plain:up plain:right plain:down plain:left",o)},k.prototype.pressureFn=function(t,i,e){var o=this,n=0;clearInterval(o.pressureIntervals[e]),o.pressureIntervals[e]=setInterval(function(){var e=t.force||t.pressure||t.webkitForce||0;e!==n&&(i.trigger("pressure",e),o.trigger("pressure "+i.identifier+":pressure",e),n=e)}.bind(o),100)},k.prototype.onstart=function(t){var i=this,e=i.options;t=a(t),i.updateBox();return y(t,function(t){i.actives.length<e.maxNumberOfNipples&&i.processOnStart(t)}),i.manager.bindDocument(),!1},k.prototype.processOnStart=function(t){var i,e=this,o=e.options,s=e.manager.getIdentifier(t),r=t.force||t.pressure||t.webkitForce||0,d={x:t.pageX,y:t.pageY},p=e.getOrCreate(s,d);p.identifier!==s&&e.manager.removeIdentifier(p.identifier),p.identifier=s;var a=function(i){i.trigger("start",i),e.trigger("start "+i.id+":start",i),i.show(),r>0&&e.pressureFn(t,i,i.identifier),e.processOnMove(t)};if((i=e.idles.indexOf(p))>=0&&e.idles.splice(i,1),e.actives.push(p),e.ids.push(p.identifier),"semi"!==o.mode)a(p);else{if(!(n(d,p.position)<=o.catchDistance))return p.destroy(),void e.processOnStart(t);a(p)}return p},k.prototype.getOrCreate=function(t,i){var e,o=this.options;return/(semi|static)/.test(o.mode)?(e=this.idles[0])?(this.idles.splice(0,1),e):"semi"===o.mode?this.createNipple(i,t):(console.warn("Coudln't find the needed nipple."),!1):e=this.createNipple(i,t)},k.prototype.processOnMove=function(t){var i=this.options,e=this.manager.getIdentifier(t),o=this.nipples.get(e);if(!o)return console.error("Found zombie joystick with ID "+e),void this.manager.removeIdentifier(e);o.identifier=e;var d,p,a,c,l,u,f,y,m=o.options.size/2,v={x:t.pageX,y:t.pageY},g=n(v,o.position),b=(d=v,p=o.position,a=p.x-d.x,c=p.y-d.y,r(Math.atan2(c,a))),x=s(b),O=g/m;g>m&&(g=m,l=o.position,u=g,y={x:0,y:0},f=s(f=b),y.x=l.x-u*Math.cos(f),y.y=l.y-u*Math.sin(f),v=y);var _=v.x-o.position.x,w=v.y-o.position.y;i.lockX&&(w=0),i.lockY&&(_=0),o.frontPosition={x:_,y:w},i.dataOnly||h(o.ui.front,o.frontPosition);var T={identifier:o.identifier,position:v,force:O,pressure:t.force||t.pressure||t.webkitForce||0,distance:g,angle:{radian:x,degree:b},instance:o,lockX:i.lockX,lockY:i.lockY};(T=o.computeDirection(T)).angle={radian:s(180-b),degree:180-b},o.trigger("move",T),this.trigger("move "+o.id+":move",T)},k.prototype.processOnEnd=function(t){var i=this,e=i.options,o=i.manager.getIdentifier(t),n=i.nipples.get(o),s=i.manager.removeIdentifier(n.identifier);n&&(e.dataOnly||n.hide(function(){"dynamic"===e.mode&&(n.trigger("removed",n),i.trigger("removed "+n.id+":removed",n),i.manager.trigger("removed "+n.id+":removed",n),n.destroy())}),clearInterval(i.pressureIntervals[n.identifier]),n.resetDirection(),n.trigger("end",n),i.trigger("end "+n.id+":end",n),i.ids.indexOf(n.identifier)>=0&&i.ids.splice(i.ids.indexOf(n.identifier),1),i.actives.indexOf(n)>=0&&i.actives.splice(i.actives.indexOf(n),1),/(semi|static)/.test(e.mode)?i.idles.push(n):i.nipples.indexOf(n)>=0&&i.nipples.splice(i.nipples.indexOf(n),1),i.manager.unbindDocument(),/(semi|static)/.test(e.mode)&&(i.manager.ids[s.id]=s.identifier))},k.prototype.onDestroyed=function(t,i){this.nipples.indexOf(i)>=0&&this.nipples.splice(this.nipples.indexOf(i),1),this.actives.indexOf(i)>=0&&this.actives.splice(this.actives.indexOf(i),1),this.idles.indexOf(i)>=0&&this.idles.splice(this.idles.indexOf(i),1),this.ids.indexOf(i.identifier)>=0&&this.ids.splice(this.ids.indexOf(i.identifier),1),this.manager.removeIdentifier(i.identifier),this.manager.unbindDocument()},k.prototype.destroy=function(){for(var t in this.unbindEvt(this.options.zone,"start"),this.nipples.forEach(function(t){t.destroy()}),this.pressureIntervals)this.pressureIntervals.hasOwnProperty(t)&&clearInterval(this.pressureIntervals[t]);this.trigger("destroyed",this.nipples),this.manager.unbindDocument(),this.off()};var P=k;function E(t){var i,e=this;return e.ids={},e.index=0,e.collections=[],e.config(t),e.prepareCollections(),d(window,"resize",function(t){clearTimeout(i),i=setTimeout(function(){var t,i=c();e.collections.forEach(function(e){e.forEach(function(e){t=e.el.getBoundingClientRect(),e.position={x:i.x+t.left,y:i.y+t.top}})})},100)}),e.collections}E.prototype=new _,E.constructor=E,E.prototype.prepareCollections=function(){var t=this;t.collections.create=t.create.bind(t),t.collections.on=t.on.bind(t),t.collections.off=t.off.bind(t),t.collections.destroy=t.destroy.bind(t),t.collections.get=function(i){var e;return t.collections.every(function(t){return!(e=t.get(i))}),e}},E.prototype.create=function(t){return this.createCollection(t)},E.prototype.createCollection=function(t){var i=new P(this,t);return this.bindCollection(i),this.collections.push(i),i},E.prototype.bindCollection=function(t){var i,e=this,o=function(t,o){i=t.type+" "+o.id+":"+t.type,e.trigger(i,o)};t.on("destroyed",e.onDestroyed.bind(e)),t.on("shown hidden rested dir plain",o),t.on("dir:up dir:right dir:down dir:left",o),t.on("plain:up plain:right plain:down plain:left",o)},E.prototype.bindDocument=function(){this.binded||(this.bindEvt(document,"move").bindEvt(document,"end"),this.binded=!0)},E.prototype.unbindDocument=function(t){Object.keys(this.ids).length&&!0!==t||(this.unbindEvt(document,"move").unbindEvt(document,"end"),this.binded=!1)},E.prototype.getIdentifier=function(t){var i;return t?void 0===(i=void 0===t.identifier?t.pointerId:t.identifier)&&(i=this.latest||0):i=this.index,void 0===this.ids[i]&&(this.ids[i]=this.index,this.index+=1),this.latest=i,this.ids[i]},E.prototype.removeIdentifier=function(t){var i={};for(var e in this.ids)if(this.ids[e]===t){i.id=e,i.identifier=this.ids[e],delete this.ids[e];break}return i},E.prototype.onmove=function(t){return this.onAny("move",t),!1},E.prototype.onend=function(t){return this.onAny("end",t),!1},E.prototype.oncancel=function(t){return this.onAny("end",t),!1},E.prototype.onAny=function(t,i){var e,o=this,n="processOn"+t.charAt(0).toUpperCase()+t.slice(1);i=a(i);return y(i,function(t){e=o.getIdentifier(t),y(o.collections,function(t,i,e){e.ids.indexOf(i)>=0&&(e[n](t),t._found_=!0)}.bind(null,t,e)),t._found_||o.removeIdentifier(e)}),!1},E.prototype.destroy=function(){this.unbindDocument(!0),this.ids={},this.index=0,this.collections.forEach(function(t){t.destroy()}),this.off()},E.prototype.onDestroyed=function(t,i){if(this.collections.indexOf(i)<0)return!1;this.collections.splice(this.collections.indexOf(i),1)};var z=new E;i.default={create:function(t){return z.create(t)},factory:z}}]).default});
},{}]},{},[6]);
