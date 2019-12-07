module.exports = class LoginManager{

    constructor() {
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
        if (!localStorage.login || !["discord", "facebook", "google"].includes(localStorage.login)) return;
        this.logging_in = true;
        $(window).trigger("loggingIn");
        try {
            $.ajax({
                url: `/api/${localStorage.login}/login`,
                type: "POST",
                crossDomain: true,
                data: "",
                dataType: "json",
                xhrFields: {
                    withCredentials: true
                },
                success: res => {
                    console.log(res);
                    this.info = res;
                    this.loginSucceed();
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
        localStorage.login = media;
        window.location.href = `/api/${media}/login?redirect=${encodeURIComponent(window.location.href)}`;
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
        this.logging_in = false;
        this.logged_in = true;
        $(window).trigger("loginSucceed", this.getLoginInfo());
    }

    throwError(msg){
        $(window).trigger("loginError", msg);
    }
}