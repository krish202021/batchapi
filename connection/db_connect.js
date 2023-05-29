var mysql = require("mysql");

const con = mysql.createConnection({
    host:"nodeapi.cvz5julykbwk.ap-northeast-1.rds.amazonaws.com",
    user:"admin",
    password:"testing123",
    database: "ztrxwlrp_batchmates"
});
module.exports = {con}