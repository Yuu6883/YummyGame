const db = require("../../../../database/db");
const botdb = require("../../../../database/botdb");
const logger = require('../../../../util/logger');
const Player = require("./player");

const loadInfo = async token => {

    let dbuser;
    let userinfo;

    if (token) {
        dbuser = await db.login(token);
    }

    if (!dbuser) {
        userinfo = {
            id: -1,
            name: `Guest${Math.floor(Math.random() * 9000 + 1000)}`,
            avatar: "https://i.stack.imgur.com/34AD2.jpg"
        }
    } else {
        userinfo = {id: dbuser.user_id};
        let info = JSON.parse(dbuser.info);
        switch(dbuser.account_type){
            case "google":
                userinfo.name = info.given_name;
                userinfo.avatar = info.picture;
                break;
            case "discord":
                userinfo.name = info.username;
                userinfo.avatar = `https://cdn.discordapp.com/avatars/${dbuser.user}/${info.avatar}.png`;
                break;
            case "facebook":
                userinfo.name = info.split(" ")[0];
                userinfo.avatar = `http://graph.facebook.com/${dbuser.user}/picture?type=large`;
                break;  
        }
    }
    return userinfo;
}

/**
 * @param {WebSocket} ws
 * @param {import("express").Request} req
 */
module.exports = async (ws, req) => {
    
    let origin = req.headers.origin;
    logger.verbose(`Received incoming connection from ${origin}`);
    let token = req.cookies.token;
    let validToken = true;

    let bot = req.query.bot;
    let botToken = req.query.token;

    if (!token || !token.match(/^[0-9a-zA-Z]{128}$/)){
        validToken = false;
    }
    
    let userinfo = validToken ? await loadInfo(token): await loadInfo();
    
    if (bot && botToken && /^\w{12}$/.test(bot) && /^\w{30}$/.test(botToken)) {
        let result = await botdb.loginBot(bot, botToken, "yummy");
        if (result && result.owner) {
            let owner = await db.get(result.owner);
            userinfo = loadInfo(undefined, owner);
            userinfo.name += " Bot";
        } else {
            ws.close(4000, "Invalid Bot Login");
            return;
        }
    }
    ws.binaryType = "arraybuffer";
    new Player(ws, userinfo);
}
