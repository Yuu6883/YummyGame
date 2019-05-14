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