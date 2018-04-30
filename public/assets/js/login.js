$(document).ready(function() {
    // Getting references to our form and inputs
    var loginForm = $("form.login");
    var usernameInput = $("input#username");
    var passwordInput = $("input#password");
  
    // When the form is submitted, we validate there's an username and password entered
    loginForm.on("submit", function(event) {
      event.preventDefault();
      var userData = {
        username: usernameInput.val().trim(),
        password: passwordInput.val().trim()
      };
  
      if (!userData.username || !userData.password) {
        return;
      }
  
      // If we have an username and password we run the loginUser function and clear the form
      loginUser(userData.username, userData.password);
      usernameInput.val("");
      passwordInput.val("");
    });
  
    // loginUser does a post to our "api/login" route and if successful, redirects us the the members page
    function loginUser(username, password) {
      $.post("/api/login", {
        username: username,
        password: password
      }).done(function(data) {
        // If there's an error, log the error
        console.log(data);
        window.location.replace(data);
      }).fail(function(error) {
        var notification = $(`<div class="notification">Bad Login Details</div>`)
        $("body").append(notification);
        setTimeout(function() {
            $(".notification").remove();
        }, 3000);
      });
    }
  
  });
  