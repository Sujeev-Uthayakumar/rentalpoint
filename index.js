const express = require("express");
const userRouter = require("./routers/users");
const listingRouter = require("./routers/listings");
const basicRouter = require("./routers/basic");
const path = require("path");
const hbs = require("express-handlebars");
const fileUpload = require("express-fileupload");
const busboy = require("connect-busboy");

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

app.use(express.static(__dirname + "/public"));
app.use(express.json()); // support json encoded bodies
app.use(express.urlencoded({ extended: false }));
app.use(busboy());

app.use(userRouter);
app.use(listingRouter);
app.use(basicRouter);
app.use(fileUpload());

app.get("/", (req, res) => {
  res.redirect("/home");
});

app.listen(port, () => {
  console.log("Server is up on port " + port);
});

module.exports = app;
