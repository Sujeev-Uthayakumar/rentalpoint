const express = require("express");
const session = require("express-session");

const connection = require("../config/database");
const router = express.Router();

router.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/auth", (req, res) => {
  if (req.body.username && req.body.password) {
    console.log(req.body);
    connection().query(
      "SELECT * FROM accounts WHERE email = ? AND password = ?",
      [req.body.username, req.body.password],
      function (error, results, fields) {
        if (results.length > 0) {
          req.session.loggedin = true;
          req.session.username = req.body.username;
          res.redirect("/");
        } else {
          res.send("Please enter Username and Password!");
        }
      }
    );
  }
});

router.get("/register", (req, res) => {
  res.render("register");
});

router.post("/register", (req, res) => {
  const userDate = new Date(req.body.date);
  const currentDate = new Date();
  if (
    req.body.fname &&
    req.body.lname &&
    req.body.country &&
    req.body.date &&
    req.body.email &&
    req.body.password &&
    req.body.confirm
  ) {
    connection().query(
      "SELECT * FROM accounts WHERE email=?",
      [req.body.email],
      function (error, results, fields) {
        if (results.length > 0) {
          res.render("register", {
            errorMessage: "The email is already taken, try another one",
          });
        } else if (req.body.password !== req.body.confirm) {
          res.render("register", {
            errorMessage: "The passwords don't match, please try again",
          });
        } else if (
          req.body.password.length < 8 ||
          req.body.confirm.length < 8
        ) {
          res.render("register", {
            errorMessage: "Chosen password must be at least 7 characters ",
          });
        } else {
          connection().query(
            "INSERT INTO accounts(fname, lname, email, country, birthdate, password) VALUES(?,?,?,?,?,?)",
            [
              req.body.fname,
              req.body.lname,
              req.body.email,
              req.body.country,
              req.body.date,
              req.body.password,
            ]
          ),
            function (error, results, fields) {
              if (error) {
                res.render("register", {
                  errorMessage: "Something went wrong, try again later",
                });
              } else {
                res.render("register", {
                  successMessage: "You have successfully registered",
                });
              }
            };
        }
      }
    );
  } else {
    res.render("register", {
      errorMessage: "All input fields must be filled in",
    });
  }
});

router.get("/account", (req, res) => {
  console.log(req.session);
});

router.get("/logout", (req, res) => {
  res.send("logout");
});

module.exports = router;
