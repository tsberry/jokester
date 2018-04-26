var express = require("express");
var bodyParser = require("body-parser");
var session = require("express-session");
var path = require("path");
// Requiring passport as we've configured it
var passport = require("./config/passport");

var app = express();
var PORT = process.env.PORT || 7000;
var db = require("./models");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static content for the app from the "public" directory in the application directory.
app.use(express.static('public'));

app.use(session({ secret: "keyboard cat", resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Set Handlebars.
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Import routes and give the server access to them.
var routes = require("./controllers/controller.js");

app.use(routes);

db.sequelize.sync()
    .then(function () {
        app.listen(PORT, function () {
            console.log("Server listening on: http://localhost:" + PORT);
        });
    });