const express = require("express");
const userRouter = require("../routers/users");

const app = express();

app.get("/", (req, res) => {
  res.send("hello world");
});

module.exports = app;
