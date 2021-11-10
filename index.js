const express = require("express");
const userRouter = require("./routers/users");
const listingRouter = require("./routers/listings");
const otherRouter = require("./routers/other");
const path = require("path");
const hbs = require("express-handlebars");

const app = express();
const port = process.env.PORT || 3000;

app.engine(
  "hbs",
  hbs({
    layoutsDir: __dirname + "/views/layouts/",
    extname: "hbs",
    partialsDir: __dirname + "/views/partials/",
    defaultLayout: "layout",
  })
);

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "../public")));
app.use(userRouter);
app.use(listingRouter);

app.listen(port, () => {
  console.log("Server is up on port " + port);
});

module.exports = app;
