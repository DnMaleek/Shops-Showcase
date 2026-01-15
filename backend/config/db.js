const mysql = require("mysql2");

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "7890",
  database: "shop_platform"
});

module.exports = db.promise();
