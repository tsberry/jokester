$(document).ready(function () {
    $.get("/loggedin")
        .then(function (data) {
            console.log(data);
            if (!data.loggedIn) {
                $("#login").attr("style", "display:inline");
                $("#signup").attr("style", "display:inline");
            }
            else {
                $("#greeting-text").text(`Hello, ${data.username}!`);
                $("#greeting").attr("style", "display:inline");
                $("#logout").attr("style", "display:inline");
                $("#submitjoke").attr("style", "display:inline");
            }
        });
});