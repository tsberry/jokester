// This is middleware for restricting routes a user is not allowed to visit if they are logged in
module.exports = function(req, res, next) {
    // If the user is not logged in, continue with the request to the restricted route
    if (!req.user) {
      return next();
    }
  
    // If the user is logged in, redirect them to the home page
    return res.redirect("/");
  };