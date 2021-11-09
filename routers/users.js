const express = require("express");

const app = express.Router();

app.get("/", (req, res) => {
  res.render("main", {
    text: "kuygiuhiuhiuiu",
  });
});

app.get("/users", (req, res) => {
  res.send("login");
});

app.post("/users/login", (req, res) => {
  res.send("login");
});

app.get("/users/account", (req, res) => {
  res.send("account");
});

app.get("/users/logout", (req, res) => {
  res.send("logout");
});

module.exports = app;
