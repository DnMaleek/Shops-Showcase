const mysql = require("mysql2");

const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "7890",
  database: process.env.DB_NAME || "shop_platform"
});

module.exports = db.promise();
