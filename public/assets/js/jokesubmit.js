$(document).ready(function () {
    // Getting references to our form and inputs
    var jokeForm = $("form.jokeform");

    jokeForm.on("submit", function (event) {
        event.preventDefault();
        var jokeText = $("textarea#jokeinputtext");
        var category = $("select#category option:selected");
        var userData = {
            joketext: jokeText.val().trim(),
            category: category.text().substring(0, category.text().length - 6)
        };

        console.log(userData);
        if (!userData.joketext || !userData.category) {
            return;
        }

        submitJoke(userData.joketext, userData.category);
        jokeText.val("");
        category.val("");
    });

    function submitJoke(joketext, category) {
        $.post("/api/jokes", {
            text: joketext,
            category: category
        }).then(function (data) {
            window.location.replace(data);
        });
    }

});
