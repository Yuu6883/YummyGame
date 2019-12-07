
const mongoose = require("mongoose");

const express = require("express");

const Logger = require("./Logger");

// Routers
const AuthRouter = require("../routers/auth");
const Cors = require("./Cors");
const IP = require("./IP");
const ExpressLogger = require("./ExpressLogger");
const OAuth2 = require("../routers/auth/endpoints/oauth2");

// Collections
const UserCollection = require("../database/Users");
const StateCollection = require("../database/State");

module.exports = class APIServer {

    /** @param {Config} config */
    constructor(config) {
        this.config = config;
        this.logger = new Logger();
        this.OAuth2 = OAuth2(this);

        this.logger.info("Config and logger loaded");
    }

    async init() {

        this.logger.info("API server init");

        await mongoose.connect(
            `${this.config.API.DBPath}/${this.config.API.DBName}`,
            {
                useUnifiedTopology: true,
                useNewUrlParser: true,
                useCreateIndex: true
            });

        this.users = new UserCollection(this);
        this.state = new StateCollection(this);
        this.logger.info(`Connected to MongoDB "${this.config.API.DBName}"`);

        return this;
    }

    /** @returns {Promise.<void>} */
    async startServer() {

        const app = express()
            .disable("x-powered-by")
            .set("trust proxy", 1)
            .use(IP.bind(this))
            .use(ExpressLogger(this.logger))
            .use(Cors.bind(this))
            .get("/tracker", (_, res) => {
                res.send(this.config.Game.map(config => config.url))
            })
            .use(this.router);

        await this.init();

        this.logger.debug("Webserver opening @", this.config.API.Port);
        
        await new Promise((resolve, reject) => {
            this.webserver = app.listen(this.config.API.Port, err => {

                if (err) return void reject(err);
                this.logger.info("Webserver opened @", this.config.API.Port);
                resolve();
            });
        });
    }

    /** @returns {Promise.<boolean>} */
    stopServer() {
        if (this.webserver.listening) {

            return new Promise((resolve, reject) => {

                this.webserver.close(err => {

                    if (err) return void reject(err);

                    this.logger.info("Webserver closed");
                    resolve(true);
                });

                this.webserver = null;
            });

        } else {
            return Promise.resolve(false);
        }
    }

    /** @returns {express.Router} */
    get router() { return AuthRouter.bind(this)(); }
}
