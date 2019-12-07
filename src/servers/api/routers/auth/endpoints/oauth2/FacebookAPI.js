const fetch = require("node-fetch");
const FB = require("fb");

const OAuth2 = "https://graph.facebook.com/v4.0/oauth/";

class FacebookAPI {
    
    /** @param {APIServer} app */
    constructor(app) {

        this.app = app;
        this.authorization = `client_id=${this.config.ID}&` +
                             `redirect_uri=${this.config.Redirect}&` +
                             `client_secret=${this.config.Secret}&`
    }

    get config() { return this.app.config.Auth.Facebook; }
    get logger() { return this.app.logger; }

    get redirect() {
        return `https://www.facebook.com/v4.0/dialog/oauth?` +
               `client_id=${this.config.ID}&` +
               `redirect_uri=${this.config.Redirect}`;
    }

    /**
     * @param {String} code
     * @returns {FacebookAuthorization}
     */
    async exchange(code) {

        const url = `${OAuth2}access_token?${this.authorization}code=${code}`;

        const response = await fetch(url, {
            method: "GET",
            headers: { Authorization: this.authorization }
        });

        return await response.json();
    }

    /**
     * @param {String} access_token
     * @returns {FacebookUser & FacebookError}
     */
    fetchUserInfo(access_token) {
        return new Promise(resolve => 
            FB.api('me', { fields: ['id', 'name'], access_token }, resolve));
    }

    /**
     * @param {String} userID
     * @param {String} fbAccessToken
     * @returns {FacebookError|{ success: true }}
     */
    async revoke(userID, fbAccessToken) {

        let res = await fetch(`https://graph.facebook.com/${userID}/permissions?access_token=${fbAccessToken}`, {
            method: "DELETE"
        });
        let resJson = await res.json();
        return resJson;
    }
}

module.exports = FacebookAPI;
