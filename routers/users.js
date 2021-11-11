const express = require("express");
const session = require("express-session");

const connection = require("../config/database");
const router = express.Router();

router.use(express.urlencoded({ extended: true }));
router.use(express.json());

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

router.get("/users/account", (req, res) => {
  res.send("account");
});

router.get("/users/logout", (req, res) => {
  res.send("logout");
});

module.exports = router;
