const AuthPath = window.location.href.replace("yummy", "api").replace(/#|_|=/g, "");

const LoginManager = require("./login");
const Renderer = require("./renderer");
const InputManager = require("./input");
const SocketClient = require("./socket");
const GameManager = require("./game");

const onload = () => {
    let loginManger = new LoginManager(AuthPath);
    Renderer.start();
    new InputManager(loginManger);
    new SocketClient();
    new GameManager();
}

$(document.body).ready(onload);

// browserify apps/games/yummy/client/main.js -o apps/games/yummy/public/assets/js/bundle.js