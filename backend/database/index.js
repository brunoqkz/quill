const mysql = require("mysql2/promise");
const fs = require("fs");

/**
 * MySQL connection pool for database operations
 * @type {mysql.Pool}
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl:
    process.env.DB_SSL === "true"
      ? {
          ca: process.env.DB_SSL_CA
            ? fs.readFileSync(process.env.DB_SSL_CA)
            : undefined,
          rejectUnauthorized: true,
        }
      : false,
});

module.exports = pool;
