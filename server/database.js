const Pool = require("pg").Pool;
require("dotenv").config();

// set up a pool to connect to database
const pool = new Pool({
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    host: process.env.HOST,
    port: process.env.PORT,
    database: process.env.DB
})

module.exports = pool;