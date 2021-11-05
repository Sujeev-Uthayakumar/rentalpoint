const mysql = require("mysql");

var connection = mysql.createConnection({
  host: "us-cdbr-east-04.cleardb.com",
  user: "b8dcb5dcedb32b",
  password: "47ec73a9",
  database: "heroku_3762f5bc041b015",
});

function getConnection() {
  return connection;
}

module.exports = getConnection;
