$(document).ready(function() {
    $(".vote-button").on("click", function(event) {
        var id = $(this).data("id");
        var vote = $(this).data("vote");
        $.ajax(`/api/jokes/${id}/${vote}`, {type: "PUT"})
        .then(function () {
            location.reload();
        })
    });
});