const btoa = require("btoa");
const fetch = require("node-fetch");

const OAuth2 = "https://discordapp.com/api/oauth2/";
const UserEndpoint = "http://discordapp.com/api/v6/users/@me";

class DiscordAPI {
    
    /** @param {APIServer} app */
    constructor(app) {

        this.app = app;
        this.authorization = "Basic " + 
            btoa(`${this.config.ID}:${this.config.Secret}`);
    }

    get config() { return this.app.config.Auth.Discord; }
    get logger() { return this.app.logger; }

    get redirect() {
        return `${OAuth2}authorize?` + 
                `client_id=${this.config.ID}&` + 
                `scope=identify&response_type=code&` + 
                `redirect_uri=${this.config.Redirect}`;
    }

    /**
     * @param {String} code
     * @param {Boolean} refresh
     * @returns {DiscordResponse & DiscordAuthorization}
     */
    async exchange(code, refresh) {

        const type = refresh ? "refresh_token" : "authorization_code";
        const codeType = refresh ? "refresh_token" : "code";

        const url = `${OAuth2}token?grant_type=${type}&${codeType}=${code}&` +
                    `redirect_uri=${this.config.Redirect}`;

        const response = await fetch(url, {
            method: "POST",
            headers: { Authorization: this.authorization }
        });

        return await response.json();
    }

    /**
     * @param {String} discordAccessToken
     * @returns {DiscordResponse & DiscordUser}
     */
    async fetchUserInfo(discordAccessToken) {

        const response = await fetch(UserEndpoint, {
            method: "GET",
            headers: { Authorization : `Bearer ${discordAccessToken}` }
        });
        return await response.json();
    }

    /**
     * @param {String} discordAccessToken
     */
    async revoke(discordAccessToken) {

        const response = await fetch(`${OAuth2}token/revoke?token=${discordAccessToken}`, {
            method: "POST",
            headers: { Authorization: this.authorization }
        });
        return response.status === 200;
    }
}

module.exports = DiscordAPI;
