const express = require("express");
const userRouter = require("./routers/users");
const path = require("path");
const hbs = require("hbs");

const app = express();
const port = process.env.PORT || 3000;

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "../", "/templates/views"));

hbs.registerPartials(path.join(__dirname, "../", "/templates/partials"));

app.use(express.static(path.join(__dirname, "../", "/public")));
app.use(userRouter);

app.listen(port, () => {
  console.log("Server is up on port " + port);
});

module.exports = app;

console.log(path.join(__dirname, "../", "/public"));
