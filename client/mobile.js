const nipplejs = require("nipplejs");

module.exports = class MobileManager {
    
    constructor() {
        this.initEvents();
    }

    initEvents() {
        $(window).on("join", this.onJoin);
    }

    onJoin() {
        this.manager = nipplejs.create({
            mode: "static",
            position: {
                bottom: "20%",
                left: "20%"
            },
            size: 250                
        });
        manager.on("dir:down", $(window).trigger("move:down"));
        manager.on("dir:up", () => $(window).trigger("move:up"));
        manager.on("dir:right", () => $(window).trigger("move:right"));
        manager.on("dir:left", () => $(window).trigger("move:left"));
    }
}