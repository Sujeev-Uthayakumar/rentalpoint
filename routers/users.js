const express = require("express");
const session = require("express-session");
const relativeTime = require("dayjs/plugin/relativeTime");
const dayjs = require("dayjs");

const connection = require("../helpers/database");
const { default: flatpickr } = require("flatpickr");
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
  res.render("login", { loggedIn: req.session.loggedin });
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
          req.session.userid = results[0].id;
          res.redirect("/");
        } else {
          res.render("login", {
            errorMessage: "No account can be found matching your credentials",
            loggedIn: req.session.loggedin,
          });
        }
      }
    );
  } else {
    res.render("login", {
      errorMessage: "Please fill in all login details",
      loggedIn: req.session.loggedin,
    });
  }
});

router.get("/register", (req, res) => {
  res.render("register", {
    loggedIn: req.session.loggedin,
  });
});

router.post("/register", (req, res) => {
  if (
    req.body.fname &&
    req.body.lname &&
    req.body.country !== "None" &&
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
            loggedIn: req.session.loggedin,
          });
        } else if (req.body.password !== req.body.confirm) {
          res.render("register", {
            errorMessage: "The passwords don't match, please try again",
            loggedIn: req.session.loggedin,
          });
        } else if (
          req.body.password.length < 8 ||
          req.body.confirm.length < 8
        ) {
          res.render("register", {
            errorMessage: "Chosen password must be at least 8 characters",
            loggedIn: req.session.loggedin,
          });
        } else if (parseFloat(dayjs(req.body.date).toNow(true)) < 18) {
          res.render("register", {
            errorMessage:
              "You need to be at least 18 years old to make an account",
            loggedIn: req.session.loggedin,
          });
        } else if (req.session.loggedIn) {
          res.render("register", {
            errorMessage:
              "You are already logged in, please logout before proceeding",
            loggedIn: req.session.loggedin,
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
                loggedIn: req.session.loggedin,
              });
            }
          );
        }
      }
    );
  } else {
    res.render("register", {
      errorMessage: "All input fields must be filled in",
      loggedIn: req.session.loggedin,
    });
  }
});

router.get("/seller", (req, res) => {
  res.render("register-seller", {
    loggedIn: req.session.loggedin,
  });
});

router.post("/seller", (req, res) => {
  if (
    req.body.fname &&
    req.body.lname &&
    req.body.country !== "None" &&
    req.body.date &&
    req.body.email &&
    req.body.password &&
    req.body.confirm &&
    req.body.phone &&
    req.body.license
  ) {
    connection().query(
      "SELECT * FROM accounts WHERE email=?",
      [req.body.email],
      function (error, results, fields) {
        if (results.length > 0) {
          res.render("register-seller", {
            errorMessage: "The email is already taken, try another one",
            loggedIn: req.session.loggedin,
          });
        } else if (req.body.password !== req.body.confirm) {
          res.render("register-seller", {
            errorMessage: "The passwords don't match, please try again",
            loggedIn: req.session.loggedin,
          });
        } else if (
          req.body.password.length < 8 ||
          req.body.confirm.length < 8
        ) {
          res.render("register-seller", {
            errorMessage: "Chosen password must be at least 8 characters",
            loggedIn: req.session.loggedin,
          });
        } else if (parseFloat(dayjs(req.body.date).toNow(true)) < 18) {
          res.render("register-seller", {
            errorMessage:
              "You need to be at least 18 years old to make an account",
            loggedIn: req.session.loggedin,
          });
        } else if (req.session.loggedIn) {
          res.render("register", {
            errorMessage:
              "You are already logged in, please logout before proceeding",
            loggedIn: req.session.loggedin,
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
                  "Congratulations, you have registered as a seller. Log in below",
                loggedIn: req.session.loggedin,
              });
              connection().query(
                "INSERT INTO verified_accounts(user_id, license, isSeller, phone) VALUES(?, ?, ?, ?)",
                [results.insertId, req.body.license, 1, req.body.phone]
              );
            }
          );
        }
      }
    );
  } else {
    res.render("register-seller", {
      errorMessage: "All input fields must be filled in",
      loggedIn: req.session.loggedin,
    });
  }
});

router.get("/account", (req, res) => {
  if (req.session.loggedin) {
    const queries = [
      "SELECT fname, lname, country, email, DATE_FORMAT(birthdate, '%Y/%m/%d') AS birthdate  FROM accounts WHERE email=?",
      "SELECT isSeller FROM verified_accounts, accounts WHERE verified_accounts.user_id = accounts.id AND accounts.email = ?",
      "SELECT * FROM listings WHERE host_id IN (SELECT user_id FROM verified_accounts,accounts WHERE accounts.email=? AND verified_accounts.user_id = accounts.id)",
    ];
    connection().query(
      queries.join(";"),
      [req.session.username, req.session.username, req.session.username],
      function (error, results, fields) {
        res.render("account", {
          loggedIn: req.session.loggedin,
          accountDetails: results[0][0],
          registeredSeller: true ? results[1].length > 0 : false,
        });
      }
    );
  } else {
    res.redirect("/login");
  }
});

router.post("/account", (req, res) => {
  if (req.session.loggedin) {
    console.log(req.body);
    if (req.body.changeLocation && req.body.changeLocation !== "None") {
      // connection().query()
      res.redirect("/account");
    } else {
      res.redirect("/account");
    }
  } else {
    res.redirect("/login");
  }
});

module.exports = router;
