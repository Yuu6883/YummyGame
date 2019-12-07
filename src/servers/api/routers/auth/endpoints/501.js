/** @type {APIRouter} */
module.exports = {
    getLogin: function(_, res) {
        res.redirect("/501");
    },
    postLogin: function(_, res) {
        res.sendStatus(501);
    },
    getLogout: function(_, res) {
        res.redirect("/501");
    },
    postLogout: function(_, res) {
        res.sendStatus(501);
    },
    callback: function(_, res) {
        res.redirect("/501");
    }
}