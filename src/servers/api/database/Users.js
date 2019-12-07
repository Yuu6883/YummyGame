const mongoose = require("mongoose");
const uid = require("uid-safe");

/** @type {mongoose.Schema<UserEntry>} */
const UserSchema = new mongoose.Schema({
    UserID:        { type: String, required: true  },
    UserInfo:      { type: Map,    of: String      },
    UserInfoCache: { type: Date,   required: false },
    OAuth2ID:      { type: String, required: true  },
    OAuth2Type:    { type: String, required: true, enum: [ "discord", "google", "facebook" ] },
    OAuth2Token:   { type: String, required: false },
    OAuth2Refresh: { type: String, required: false },
    CookieToken:   { type: String, required: false },
    bannedUntil:   { type: Date,   required: false },
    permission:    { type: Number, required: false },
});

UserSchema.index({ UserID:      1 }, { unique: true });
UserSchema.index({ OAuth2ID:    1 }, { unique: true });
UserSchema.index({ CookieToken: 1 }, { unique: true, sparse: true });

/** @type {mongoose.Model<UserDocument, {}>} */
const UserModel = mongoose.model("users", UserSchema);

module.exports = class UserCollection {

    /** @param {APIServer} app */
    constructor(app) {
        this.app = app;
        this.IDRegex = new RegExp(`^[0-9a-zA-Z\-_]{${
            Math.ceil(this.app.config.API.CookieLength * 4 / 3)}}$`);
    }

    /**
     * @param {string} OAuth2ID
     */
    async findByOAuth2ID(OAuth2ID) {
        return await UserModel.findOne({ OAuth2ID });
    }

    /**
     * @param {string} UserID
     */
    async findByUserID(UserID) {
        return await UserModel.findOne({ UserID });
    }

    /** @param {string} token */
    confirmToken(token) {
        return this.IDRegex.test(token);
    }
    
    /**
     * @param {string} CookieToken
     * @param {OAuth2Type} OAuth2Type
     */
    async findByAuthedToken(CookieToken, OAuth2Type) {
        return OAuth2Type ? await UserModel.findOne({ CookieToken, OAuth2Type }) :
                            await UserModel.findOne({ CookieToken });
    }

    /**
     * @param {string} OAuth2ID 
     * @param {OAuth2Type} OAuth2Type 
     */
    async create(OAuth2ID, OAuth2Type) {
        return await UserModel.create({
            UserID: await uid(this.app.config.API.UserIDLength),
            OAuth2ID,
            OAuth2Type
        });
    }

    /**
     * @param {UserDocument} user
     * @param {string} OAuth2Token
     * @param {string} OAuth2Refresh
     * @param {Map<string, string>} UserInfo
     */
    async authorize(user, OAuth2Token, OAuth2Refresh, UserInfo) {

        let token = await uid(this.app.config.API.CookieLength);

        user.OAuth2Token = OAuth2Token;
        user.OAuth2Refresh = OAuth2Refresh;
        user.UserInfo = UserInfo;
        user.UserInfoCache = new Date(Date.now() + this.app.config.API.InfoCache);
        user.CookieToken = token;
        
        await user.save();
        return token;
    }

    /** @param {UserDocument} user */
    async deauthorize(user) {

        user.OAuth2Token   = undefined;
        user.OAuth2Refresh = undefined;
        user.CookieToken   = undefined;

        await user.save();
    }

    /** @param {UserDocument} user */
    async renewToken(user) {

        let token = await uid(this.app.config.API.CookieLength);
        user.CookieToken = token;

        await user.save();
        return token;
    }
}
