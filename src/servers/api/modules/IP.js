/** @type {APIEndpoint} */
module.exports = function(req, _, next) {
    req.ip = req.header("x-real-ip") || req.header("x-forwarded-for") || req.ip;
    next();
}