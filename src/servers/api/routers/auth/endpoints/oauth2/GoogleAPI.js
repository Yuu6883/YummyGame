const fetch = require("node-fetch");

const OAuth2 = "https://www.googleapis.com/oauth2/v4/";
const RevokeEndpoint = "https://accounts.google.com/o/oauth2/revoke";
const UserEndpoint = "https://www.googleapis.com/oauth2/v2/userinfo";
const SCOPE = "https://www.googleapis.com/auth/userinfo.profile&approval_prompt=force&access_type=offline";

class GoogleAPI {
    
    /** @param {APIServer} app */
    constructor(app) {

        this.app = app;
        this.authURI = `&redirect_uri=${this.config.Redirect}` + 
                       `&client_id=${this.config.ID}` + 
                       `&client_secret=${this.config.Secret}`;

        this.redirect = `https://accounts.google.com/o/oauth2/auth?` + 
                        `client_id=${this.config.ID}&` + 
                        `redirect_uri=${this.config.Redirect}&` + 
                        `response_type=code&` + 
                        `scope=${SCOPE}`;
    }

    get config() { return this.app.config.Auth.Google; }
    get logger() { return this.app.logger; }

    /**
     * @param {String} code
     * @param {Boolean} refresh
     * @returns {}
     */
    async exchange(code, refresh) {

        const type = refresh ? "refresh_token" : "authorization_code";
        const codeType = refresh ? "refresh_token" : "code";

        const url = `${OAuth2}token?grant_type=${type}&${codeType}=${code}${this.authURI}`;

        const response = await fetch(url, {
            method: "POST",
            headers: { "content-type": "application/x-www-form-urlencoded" }
        });

        return await response.json();
    }

    /**
     * @param {String} googleAccessToken
     * @returns {}
     */
    async fetchUserInfo(googleAccessToken) {

        const response = await fetch(UserEndpoint, {
            method: "GET",
            headers: { Authorization : `Bearer ${googleAccessToken}` }
        });
        return await response.json();
    }

    /**
     * @param {String} googleAccessToken
     * @returns {}
     */
    async revoke(googleAccessToken) {

        /** @type {Response} */
        const response = await fetch(`${RevokeEndpoint}?token=${googleAccessToken}`, {
            method: "GET",
            headers: { "Content-type" :"application/x-www-form-urlencoded" }
        });

        return response.status === 200;
    }
}

module.exports = GoogleAPI;
