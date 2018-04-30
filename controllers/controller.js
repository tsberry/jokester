var express = require("express");
var db = require("../models");
var passport = require("../config/passport");
var validateCategory = require("./category");
var isAuthenticated = require("../config/middleware/isAuthenticated");
var notAuthenticated = require("../config/middleware/notAuthenticated");
var router = express.Router();

router.get("/", function (req, res) {
    var loggedIn;
    if (req.user) loggedIn = true;
    else loggedIn = false;
    db.Joke.findAll({
        limit: 10,
        order: [["jokeUpvoteCount", "DESC"]],
        include: [{ model: db.User }, { model: db.Comment }]
    })
        .then(function (data) {
            var jokes = [];
            for (var i = 0; i < data.length; i++) {
                var joke = {
                    text: data[i].jokeText,
                    jokeId: data[i].id,
                    username: data[i].User.username,
                    score: data[i].jokeUpvoteCount - data[i].jokeDownvoteCount,
                    comments: data[i].Comments.length
                }
                jokes.push(joke);
            }
            res.render("index", { jokes: jokes });
        });
});

router.get("/joketopics/:category", function (req, res) {
    if (validateCategory(req.params.category)) {
        db.Joke.findAll({
            order: [["jokeUpvoteCount", "DESC"]],
            include: [{ model: db.User }, { model: db.Comment }],
            where: { category: req.params.category }
        })
            .then(function (data) {
                var jokes = [];
                for (var i = 0; i < data.length; i++) {
                    var joke = {
                        text: data[i].jokeText,
                        jokeId: data[i].id,
                        username: data[i].User.username,
                        score: data[i].jokeUpvoteCount - data[i].jokeDownvoteCount,
                        comments: data[i].Comments.length
                    }
                    jokes.push(joke);
                }
                res.render("joketopics", { category: req.params.category, jokes: jokes });
            });
    }
    else res.status(404).send("<h1>404</h1> <p>No such category.</p>");
});

router.get("/login", notAuthenticated, function (req, res) {
    res.render("login")
});

router.get("/search", function (req, res) {
    res.render("search")
});

router.get("/signup", notAuthenticated, function (req, res) {
    res.render("signup")
});

router.get("/jokes/:jid", function (req, res) {
    db.Joke.findOne({
        include: [{ model: db.User }],
        where: { id: req.params.jid }
    })
        .then(function (data) {
            if (data === null) return res.status(404).send("<h1>404</h1> <p>No such joke.</p>")
            var joke = {
                text: data.jokeText,
                jokeId: data.id,
                username: data.User.username,
                score: data.jokeUpvoteCount - data.jokeDownvoteCount,
            }
            data.getComments({ include: [{ model: db.User }] })
                .then(function (comments) {
                    var commentArray = [];
                    for (var i = 0; i < comments.length; i++) {
                        var comment = {
                            text: comments[i].commentText,
                            commentId: comments[i].id,
                            username: comments[i].User.username,
                            score: comments[i].commentUpvoteCount - comments[i].commentDownvoteCount
                        }
                        commentArray.push(comment);
                    }
                    joke.comments = commentArray;
                    res.render("singlejoke", joke);
                });
        });
});


router.get("/submitjoke", isAuthenticated, function (req, res) {
    res.render("submitjoke")
});

router.get("/api/jokes", function (req, res) {
    db.Joke.findAll({ include: [{ model: db.User }, { model: db.Comment }] })
        .then(function (data) {
            res.json(data);
        });
});

router.post("/api/jokes", function (req, res) {
    if (!req.user) return res.end();
    db.Joke.create({
        jokeText: req.body.text,
        UserId: req.user.id,
        category: req.body.category
    })
        .then(function (data) {
            res.json(`/jokes/${data.id}`);
        })
});

router.put("/api/jokes/:jid/:vote", function (req, res) {
    if (!req.user) return res.json({ added: false, message: "Log In or Sign Up to Vote!" });
    var isUpvote;
    if (req.params.vote === "up") isUpvote = true;
    else if (req.params.vote === "down") isUpvote = false;
    db.jokes_lookup_table.findOne({
        where: {
            JokeId: parseInt(req.params.jid),
            UserId: req.user.id
        }
    })
        .then(function (data) {
            if (data !== null) {
                if (isUpvote !== data.dataValues.isUpvote) {
                    db.jokes_lookup_table.update({
                        isUpvote: isUpvote
                    }, { where: { id: data.dataValues.id } })
                        .then(function () {
                            swapJokeVote(parseInt(req.params.jid), isUpvote, res);
                        });
                }
                else {
                    res.status(400).end();
                }
            }
            else {
                db.jokes_lookup_table.create({
                    JokeId: parseInt(req.params.jid),
                    UserId: req.user.id,
                    isUpvote: isUpvote
                })
                    .then(function () {
                        addJokeCount(parseInt(req.params.jid), isUpvote, res);
                    });
            }
        });
});

router.post("/api/comments", function (req, res) {
    if (!req.user) return res.end();
    var body = req.body;
    console.log(body);
    var jid = body.jid;
    var text = body.text;

    db.Comment.create({
        commentText: text,
        UserId: req.user.id,
        JokeId: jid
    })
        .then(function () {
            res.end();
        })
});

router.get("/api/comments", function (req, res) {
    db.Comment.findAll()
        .then(function (data) {
            res.json(data);
        });
});

router.put("/api/comments/:cid/:vote", function (req, res) {
    if (!req.user) return res.json({ added: false, message: "Log In or Sign Up to Vote!" });
    var isUpvote;
    if (req.params.vote === "up") isUpvote = true;
    else if (req.params.vote === "down") isUpvote = false;
    db.comments_lookup_table.findOne({
        where: {
            CommentId: parseInt(req.params.cid),
            UserId: req.user.id
        }
    })
        .then(function (data) {
            if (data !== null) {
                if (isUpvote !== data.dataValues.isUpvote) {
                    db.comments_lookup_table.update({
                        isUpvote: isUpvote
                    }, { where: { id: data.dataValues.id } })
                        .then(function () {
                            swapCommentVote(parseInt(req.params.cid), isUpvote, res);
                        });
                }
                else {
                    res.status(400).end();
                }
            }
            else {
                db.comments_lookup_table.create({
                    CommentId: parseInt(req.params.cid),
                    UserId: req.user.id,
                    isUpvote: isUpvote
                })
                    .then(function () {
                        addCommentCount(parseInt(req.params.cid), isUpvote, res);
                    });
            }
        });
});

router.post("/api/signup", function (req, res) {
    console.log(req.body);
    db.User.create({
        username: req.body.username,
        password: req.body.password
    }).then(function () {
        res.redirect(307, "/api/login");
    }).catch(function (err) {
        console.log(err);
        res.json(err);
    });
});

router.post("/api/login", passport.authenticate("local"), function (req, res) {
    console.log(req);
    res.json("/");
});

// Route for logging user out
router.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
});

router.get("/loggedin", function (req, res) {
    var data = {};
    var loggedIn;
    if (req.user) {
        loggedIn = true;
        data.username = req.user.username;
    }
    else loggedIn = false;
    data.loggedIn = loggedIn;
    res.json(data);
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

function addJokeCount(jid, isUpvote, res) {
    db.Joke.findOne({ where: { id: jid } })
        .then(function (data) {
            var newCount;
            if (isUpvote) {
                newCount = data.dataValues.jokeUpvoteCount + 1;
                db.Joke.update({ jokeUpvoteCount: newCount }, { where: { id: jid } })
                    .then(function () {
                        res.json({ added: true, message: "Vote Added!" });
                    });
            }
            else {
                newCount = data.dataValues.jokeDownvoteCount + 1;
                db.Joke.update({ jokeDownvoteCount: newCount }, { where: { id: jid } })
                    .then(function () {
                        res.json({ added: true, message: "Vote Added!" });
                    });
            }
        });
}

function swapJokeVote(jid, isUpvote, res) {
    db.Joke.findOne({ where: { id: jid } })
        .then(function (data) {
            var newCount;
            if (isUpvote) {
                newUpvote = data.dataValues.jokeUpvoteCount + 1;
                newDownvote = data.dataValues.jokeDownvoteCount - 1;
            }
            else {
                newUpvote = data.dataValues.jokeUpvoteCount - 1;
                newDownvote = data.dataValues.jokeDownvoteCount + 1;
            }
            db.Joke.update({ jokeUpvoteCount: newUpvote, jokeDownvoteCount: newDownvote }, { where: { id: jid } })
                .then(function () {
                    res.json({ added: true, message: "Vote Added!" });
                });
        });
}

function addCommentCount(cid, isUpvote, res) {
    db.Comment.findOne({ where: { id: cid } })
        .then(function (data) {
            var newCount;
            if (isUpvote) {
                newCount = data.dataValues.commentUpvoteCount + 1;
                db.Comment.update({ commentUpvoteCount: newCount }, { where: { id: cid } })
                    .then(function () {
                        res.json({ added: true, message: "Vote Added!" });
                    });
            }
            else {
                newCount = data.dataValues.commentDownvoteCount + 1;
                db.Comment.update({ commentDownvoteCount: newCount }, { where: { id: cid } })
                    .then(function () {
                        res.json({ added: true, message: "Vote Added!" });
                    });
            }
        });
}

function swapCommentVote(cid, isUpvote, res) {
    db.Comment.findOne({ where: { id: cid } })
        .then(function (data) {
            var newCount;
            if (isUpvote) {
                newUpvote = data.dataValues.commentUpvoteCount + 1;
                newDownvote = data.dataValues.commentDownvoteCount - 1;
            }
            else {
                newUpvote = data.dataValues.commentUpvoteCount - 1;
                newDownvote = data.dataValues.commentDownvoteCount + 1;
            }
            db.Comment.update({ commentUpvoteCount: newUpvote, commentDownvoteCount: newDownvote }, { where: { id: cid } })
                .then(function () {
                    res.json({ added: true, message: "Vote Added!" });
                });
        });
}

module.exports = router;