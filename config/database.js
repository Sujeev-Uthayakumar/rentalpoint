const mysql = require("mysql2");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_DATABASE,
});

connection.query("SELECT * FROM accounts", function (error, results, fields) {
  if (error) throw error;
  console.log("The solution is: ", results);
});

// module.exports = getConnection;
