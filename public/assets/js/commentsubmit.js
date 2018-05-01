$(document).ready(function () {
    // Getting references to our form and inputs
    var commentForm = $("form#comment-form");

    commentForm.on("submit", function (event) {
        event.preventDefault();
        var commentText = $("textarea#singlejoketextarea");
        var userData = {
            commenttext: commentText.val().trim(),
            jid: commentForm.data("id")
        };

        console.log(userData);
        if (!userData.commenttext) {
            return;
        }

        submitComment(userData.commenttext, userData.jid);
        commentText.val("");
    });

    function submitComment(commenttext, jokeId) {
        $.post("/api/comments", {
            text: commenttext,
            jid: jokeId
        }).then(function (data) {
            window.location.reload();
        });
    }

});