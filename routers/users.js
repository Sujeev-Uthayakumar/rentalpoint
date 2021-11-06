const express = require("express");

const app = express.Router();

app.use("/", (req, res) => {
  res.render("index1", {
    text1: "hello world test",
  });
});

app.get("/users", (req, res) => {
  res.send("signup");
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
