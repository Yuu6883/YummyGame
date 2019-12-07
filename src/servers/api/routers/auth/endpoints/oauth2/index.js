/** @param {APIServer} app */
module.exports = app => ({
    Discord: new (require("./DiscordAPI"))(app),
    Google: new (require("./GoogleAPI"))(app),
    Facebook: new (require("./FacebookAPI"))(app),
});
