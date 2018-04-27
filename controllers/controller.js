var express = require("express");
var db = require("../models");
var passport = require("../config/passport");

var router = express.Router();

router.get("/", function (req, res) {
    var loggedIn;
    if(req.user) loggedIn = true;
    else loggedIn = false;
    db.Joke.findAll({
        limit: 10,
        order: [["jokeUpvoteCount", "DESC"]],
        include: [{model: db.User}, {model: db.Comment}]
    })
        .then(function (data) {
            var jokes = [];
            for(var i = 0; i < data.length; i++) {
                var joke = {
                    text: data[i].jokeText,
                    jokeId: data[i].id,
                    username: data[i].User.username,
                    score: data[i].jokeUpvoteCount - data[i].jokeDownvoteCount,
                    comments: data[i].Comments.length
                }
                jokes.push(joke);
            }
            res.render("index", {jokes: jokes});
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

router.get("/singlejoke", function (req, res) {
    res.render("singlejoke")
});

router.get("/api/jokes", function (req, res) {
    db.Joke.findAll({ include: [{ model: db.User }, { model: db.Comment }] })
        .then(function (data) {
            res.json(data);
        });
});

router.post("/api/jokes", function (req, res) {
    if(!req.user) return res.end();
    db.Joke.create({
        jokeText: req.body.text,
        UserId: req.user.id,
        category: req.body.category
    })
        .then(function (data) {
            res.end();
        })
});

router.put("/api/jokes/:jid/:vote", function (req, res) {
    if(!req.user) return res.end();
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
    if(!req.user) return res.end();
    var body = req.body;
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
    if(!req.user) return res.end();
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
        // res.status(422).json(err.errors[0].message);
    });
});

router.post("/api/login", passport.authenticate("local"), function (req, res) {
    // Since we're doing a POST with javascript, we can't actually redirect that post into a GET request
    // So we're sending the user back the route to the members page because the redirect will happen on the front end
    // They won't get this or even be able to access this page if they aren't authed
    res.json("/joketopics");
});

// Route for logging user out
router.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
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
                        res.end();
                    });
            }
            else {
                newCount = data.dataValues.jokeDownvoteCount + 1;
                db.Joke.update({ jokeDownvoteCount: newCount }, { where: { id: jid } })
                    .then(function () {
                        res.end();
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
                    res.end();
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
                        res.end();
                    });
            }
            else {
                newCount = data.dataValues.commentDownvoteCount + 1;
                db.Comment.update({ commentDownvoteCount: newCount }, { where: { id: cid } })
                    .then(function () {
                        res.end();
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
                    res.end();
                });
        });
}

module.exports = router;