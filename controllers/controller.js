var express = require("express");
var db = require("../models");

var router = express.Router();

router.get("/", function (req, res) {
    db.Joke.findAll({
        limit: 10
        // order: "jokeUpvoteCount DESC"
    })
    .then(function (data) {
        res.render("index", data);
    })
});

router.get("/api/jokes", function(req, res) {
    db.Joke.findAll({include: [{model: db.User}]})
    .then(function (data) {
        res.json(data);
    });
});

router.post("/api/jokes", function (req, res) {
    db.Joke.create({
        jokeText: req.body.text,
        UserId: req.body.id
    })
    .then(function (data) {
        res.end();
    })
});

router.post("/users", function (req, res) {
    db.User.create({
        username: "Thomas",
        password: "hello"
    })
    .then(function (data) {
        res.end();
    })
});

router.get("/users", function (req, res) {
    db.User.findAll()
    .then(function (data) {
        res.json(data);
    });
})

module.exports = router;