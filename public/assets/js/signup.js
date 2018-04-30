$(document).ready(function() {
    // Getting references to our form and input
    var signUpForm = $("form.signup");
    var usernameInput = $("input#username");
    var passwordInput = $("input#password");
  
    // When the signup button is clicked, we validate the username and password are not blank
    signUpForm.on("submit", function(event) {
      event.preventDefault();
      var userData = {
        username: usernameInput.val().trim(),
        password: passwordInput.val().trim()
      };
  
      if (!userData.username || !userData.password) {
        return;
      }
      // If we have an username and password, run the signUpUser function
      signUpUser(userData.username, userData.password);
      usernameInput.val("");
      passwordInput.val("");
    });
  
    // Does a post to the signup route. If successful, we are redirected to the members page
    // Otherwise we log any errors
    function signUpUser(username, password) {
      $.post("/api/signup", {
        username: username,
        password: password
      }).then(function(data) {
        if(data !== "/") handleLoginErr();
        else window.location.replace(data);
        // If there's an error, handle it by throwing up a boostrap alert
      });
    }
  
    function handleLoginErr() {
        var notification = $(`<div class="notification">A User with that name already exists!</div>`)
        $("body").append(notification);
        setTimeout(function() {
            $(".notification").remove();
        }, 3000);
    }
  });
  