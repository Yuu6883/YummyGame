const db = require("../../../../database/db");
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
    let token = req.cookies.token;
    let validToken = true;

    // if (!origin.match(/^https?:\/\/alis.io$/)) {
    //     logger.verbose("Ws connection rejected from " + origin + " Reason: CORS");
    //     throwError(ws);
    //     return;
    // }

    if (!token || !token.match(/^[0-9a-zA-Z]{128}$/)){
        validToken = false;
    }
    logger.verbose(`Received incoming connection from ${origin}`);
    let userinfo = validToken ? await loadInfo(token): await loadInfo();
    ws.binaryType = "arraybuffer";
    new Player(ws, userinfo);
}