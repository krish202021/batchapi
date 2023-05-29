const { verify } = require('jsonwebtoken');
var jwt = require('jsonwebtoken');

module.exports.verifys = function (tokens) {
    if(tokens){
        const bearearToken = tokens.split(' ');
        return  bearearToken[1];
    }else{
        return false;
    }
}

