const fs = require("fs");
const configPath = __dirname + "/log-config.json";

let DefaultSettings = [{
    url:     "classic-1",
    port:    3001,
}];

if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify(DefaultSettings, null, 4));
} else {
    let existingConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    DefaultSettings = Object.assign(DefaultSettings, existingConfig);
}

module.exports = DefaultSettings;
