const mysql = require("mysql");
const app = require("./app");
const port = process.env.PORT || 3000;

var connection = mysql.createConnection({
  host: "us-cdbr-east-04.cleardb.com",
  user: "b8dcb5dcedb32b",
  password: "47ec73a9",
  database: "heroku_3762f5bc041b015",
});

app.listen(port, () => {
  console.log("Server is up on port " + port);
});
