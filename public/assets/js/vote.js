$(document).ready(function() {
    $(".vote-button").on("click", function(event) {
        var id = $(this).data("id");
        var vote = $(this).data("vote");
        var type = $(this).data("type");
        $.ajax(`/api/${type}/${id}/${vote}`, {type: "PUT"})
        .then(function (data) {
            if(data.added) location.reload();
            else {
                var notification = $(`<div class="notification">${data.message}</div>`)
                $("body").append(notification);
                setTimeout(function() {
                    $(".notification").remove();
                }, 3000);
            }
        })
    });
});