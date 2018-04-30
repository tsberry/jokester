$(document).ready(function () {
    // Getting references to our form and inputs
    var commentForm = $("form.commentForm");

    commentForm.on("submit", function (event) {
        event.preventDefault();
        var commentText = $("input#commenttext");
        var userData = {
            commenttext: commentText.val().trim(),
        };

        console.log(userData);
        if (!userData.commenttext) {
            return;
        }

        submitComment(userData.joketext, commentForm.data("id"));
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