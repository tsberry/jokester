var express = require("express");
var db = require("../models");

var router = express.Router();

router.get("/", function (req, res) {
    db.Joke.findAll({
        limit: 10,
        order: [["jokeUpvoteCount", "DESC"]]
    })
    .then(function (data) {
        res.render("index", data);
    });
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

router.put("/api/jokes/:jid/:uid/:vote", function (req, res) {
    
});

router.post("/api/users", function (req, res) {
    db.User.create({
        username: "Thomas",
        password: "hello"
    })
    .then(function (data) {
        res.end();
    })
});

router.get("/api/users", function (req, res) {
    db.User.findAll()
    .then(function (data) {
        res.json(data);
    });
});

module.exports = router;