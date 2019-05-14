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