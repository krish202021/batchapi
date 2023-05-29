const express = require('express');
const app = express();
const router = express.Router();
const connect = require('../connection/db_connect');
const connection = connect.con;
var bodyParser = require('body-parser');
//const { Socket } = require('socket.io');
app.use(bodyParser.json())
const http = require('http').createServer(app);
app.use(express.static(__dirname + '/public'));

module.exports = router.get('/chate',(req,res)=>{
    res.sendFile(__dirname+'/index.html');
});

const io = require('socket.io')(http)

io.on('connection',(Socket)=>{
    console.log('connect....')
})