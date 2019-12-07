const fs = require("fs");
const configPath = __dirname + "/api-config.json";

let DefaultAPIConfig = {
    DBPath: "mongodb://localhost:27017",
    DBName: "default-database",
    AllowedOrigin: null,
    CookieName: "default-cookie",
    JWTCookieName: "default-jwt-cookie",
    JWTExpire: "1h",
    JWTSecret: "blablabla",
    UserIDLength: 12,
    InfoCache: 60 * 60 * 1000, // 1 hour
    CookieAge: 10 * 24 * 60 * 60 * 1000, // 10 days
    Port: 3000,
    CheckIP: false
}

if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify(DefaultAPIConfig, null, 4));
} else {
    let existingConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    DefaultAPIConfig = Object.assign(DefaultAPIConfig, existingConfig);
}

module.exports = DefaultAPIConfig;