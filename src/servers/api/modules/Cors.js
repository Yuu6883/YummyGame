/** @type {APIEndpoint} */
module.exports = function(req, res, next) {
    
    const origin = req.get("origin");

    if (this.config.API.AllowedOrigin && 
        !this.config.API.AllowedOrigin.includes(origin))
        return void res.sendStatus(403);

    res.header("Access-Control-Allow-Origin", origin || "*");
    res.header("Access-Control-Allow-Credentials", "true");
    
    req.origin = origin;
    next();
}