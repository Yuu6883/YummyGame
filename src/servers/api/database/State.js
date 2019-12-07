const mongoose = require("mongoose");
const uid = require("uid-safe");

/** @type {mongoose.Schema<StateEntry>} */
const StateSchema = new mongoose.Schema({
    id:        { type: String, required: true },
    ip:        { type: String, required: true },
    redirect:  { type: String, required: true },
    validTill: { type: Date,   required: true }
});

StateSchema.index({ id: 1 }, { unique: true });

/** @type {mongoose.Model<StateDocument, {}>} */
const StateModel = mongoose.model("state", StateSchema);

module.exports = class StateCollection {

    /** @param {APIServer} app */
    constructor(app) {
        this.app = app;
        // byte length to string length, this is stupid
        this.IDRegex = new RegExp(`^[0-9a-zA-Z\-_]{${
            Math.ceil(this.app.config.Auth.StateLength * 4 / 3)}}$`);

        const interval = async () => {
            await this.cleanExpired();
            // Run every 10 minutes
            setTimeout(interval.bind(this), 10 * 60 * 1000);
        }
        interval();
    }

    /** @param {string} id */
    async retrieve(id) {
        return await StateModel.findOneAndDelete({ id, validTill: { $gte: new Date() } });
    }

    confirmID(id) {
        return this.IDRegex.test(id);
    }

    /** 
     * @param {string} ip
     * @param {string} redirect
     */
    async create(ip, redirect) {
        return await StateModel.create({
            id: await uid(this.app.config.Auth.StateLength),
            ip,
            redirect,
            validTill: new Date(Date.now() + this.app.config.Auth.StateExpire)
        });
    }

    async cleanExpired() {
        let result = await StateModel.deleteMany({ validTill: { $lt: new Date() } });

        if (result.deletedCount)
            this.app.logger.debug(`Removed ${result.deletedCount} expired OAuth2 state`);
    }
}