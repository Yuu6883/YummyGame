const Game = require("../src/servers/game/Server");
const API  = require("../config").API;

Game.config.key = API.JWTCookieName;
Game.config.secret = API.JWTSecret;

Game.init();