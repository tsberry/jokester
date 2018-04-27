$(document).ready(function() {
    // Getting references to our form and inputs
    var jokeForm = $("form.joke");
    var jokeText = $("input#joketext");
    var category = $("input#category");
  

    jokeForm.on("submit", function(event) {
      event.preventDefault();
      var userData = {
        joketext: jokeText.val().trim(),
        category: category.val().trim()
      };
  
      if (!userData.joketext || !userData.category) {
        return;
      }
  
      submitJoke(userData.joketext, userData.category);
      jokeText.val("");
      category.val("");
    });
  
    // loginUser does a post to our "api/login" route and if successful, redirects us the the members page
    function submitJoke(joketext, category) {
      $.post("/api/jokes", {
        joketext: joketext,
        category: category
      }).then(function(data) {
        window.location.replace(data);
        // If there's an error, log the error
      }).catch(function(err) {
        console.log(err);
      });
    }
  
  });
  