var mysql = require("mysql");

const con = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database: "ztrxwlrp_batchmates"
});
module.exports = {con}