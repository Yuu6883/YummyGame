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