const APIServer = require("../src/servers/api");

APIServer.init().then(() => {
    APIServer.startServer();
});