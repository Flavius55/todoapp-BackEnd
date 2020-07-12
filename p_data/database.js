
const Pool = require("pg").Pool;
require("dotenv").config();

const pool = new Pool({
    user:"postgres",
    password:process.env.PASSWORD,
    database:"todo",
    port:"5432"
});

module.exports = pool;