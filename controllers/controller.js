var express = require("express");

var router = express.Router();

router.get("/", function (req, res) {
    res.render("index");
});

router.get("/joketopics", function (req, res) {
    res.render("joketopics")
});

router.get("/login", function (req, res) {
    res.render("login")
});

router.get("/search", function (req, res) {
    res.render("search")
});

router.get("/signup", function (req, res) {
    res.render("signup")
});

module.exports = router;