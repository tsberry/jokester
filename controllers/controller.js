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
    db.Joke.create({
        jokeText: req.body.text,
        UserId: req.body.id,
        category: req.body.category
    })
        .then(function (data) {
            res.end();
        })
});

router.put("/api/jokes/:jid/:uid/:vote", function (req, res) {
    var isUpvote;
    if (req.params.vote === "up") isUpvote = true;
    else if (req.params.vote === "down") isUpvote = false;
    db.jokes_lookup_table.findOne({
        where: {
            JokeId: parseInt(req.params.jid),
            UserId: parseInt(req.params.uid)
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
                    UserId: parseInt(req.params.uid),
                    isUpvote: isUpvote
                })
                    .then(function () {
                        addJokeCount(parseInt(req.params.jid), isUpvote, res);
                    });
            }
        });
});

router.post("/api/comments", function (req, res) {
    var body = req.body;
    var jid = body.jid;
    var uid = body.uid;
    var text = body.text;

    db.Comment.create({
        commentText: text,
        UserId: uid,
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

router.put("/api/comments/:cid/:uid/:vote", function (req, res) {
    var isUpvote;
    if (req.params.vote === "up") isUpvote = true;
    else if (req.params.vote === "down") isUpvote = false;
    db.comments_lookup_table.findOne({
        where: {
            CommentId: parseInt(req.params.cid),
            UserId: parseInt(req.params.uid)
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
                    UserId: parseInt(req.params.uid),
                    isUpvote: isUpvote
                })
                    .then(function () {
                        addCommentCount(parseInt(req.params.cid), isUpvote, res);
                    });
            }
        });
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

function vote(req, res, isJoke) {
    
}

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