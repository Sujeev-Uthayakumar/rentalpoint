const express = require("express");
const session = require("express-session");
const relativeTime = require("dayjs/plugin/relativeTime");
const dayjs = require("dayjs");

const connection = require("../config/database");
const router = express.Router();
dayjs.extend(relativeTime);

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

router.post("/login", (req, res) => {
  if (req.body.username && req.body.password) {
    connection().query(
      "SELECT * FROM accounts WHERE email = ? AND password = ?",
      [req.body.username, req.body.password],
      function (error, results, fields) {
        if (results.length > 0) {
          req.session.loggedin = true;
          req.session.username = req.body.username;
          res.redirect("/");
        } else {
          res.render("login", {
            errorMessage: "No account can be found matching your input",
          });
        }
      }
    );
  } else {
    res.render("login", {
      errorMessage: "Please fill in all login details",
    });
  }
});

router.get("/register", (req, res, next) => {
  res.render("register");
});

router.post("/register", (req, res, next) => {
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
            errorMessage: "Chosen password must be at least 7 characters",
          });
        } else if (parseFloat(dayjs(req.body.date).toNow(true)) < 18) {
          res.render("register", {
            errorMessage:
              "You need to be at least 18 years old to make an account",
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
            ],
            function (error, results, fields) {
              res.render("login", {
                successMessage:
                  "Congratulations, you have registered. Log in below",
              });
            }
          );
        }
      }
    );
  } else {
    res.render("register", {
      errorMessage: "All input fields must be filled in",
    });
  }
});

router.get("/seller", (req, res) => {
  res.render("register-seller");
});

router.post("/seller", (req, res) => {
  res.send("Testing");
  console.log(req.body);
});

router.get("/account", (req, res) => {
  res.render("account");
});

router.get("/logout", (req, res) => {
  res.send("logout");
});

module.exports = router;
