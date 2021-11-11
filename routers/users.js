const express = require("express");
const mysql = require("mysql2");

const connection = require("../config/database");
const router = express.Router();

router.get("/login", (req, res) => {
  res.render("login", {
    text: "hello",
  });
});

router.post("/users/login", (req, res) => {
  res.send("login");
});

router.get("/users/account", (req, res) => {
  res.send("account");
});

router.get("/users/logout", (req, res) => {
  res.send("logout");
});

module.exports = router;
