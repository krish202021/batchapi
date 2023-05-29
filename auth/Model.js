const express = require('express');
const connect = require('../connection/db_connect');
const connection = connect.con;
var jwt = require('jsonwebtoken');
var md5 = require('md5');
const jwt_verify = require('../jwt/jwt_helper');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
//Email process
const sendmail = require('sendmail')();
var transporter = nodemailer.createTransport({
service: 'gmail',
host: 'smtp.gmail.com',
  auth: {
    user: 'pathakvikash826@gmail.com',
    pass: 'Vikash@123'
  }
});


exports.login = function (req, res, next) {
  res.setHeader('Content-Type', 'application/json');
  
  var password = md5(req.body.password);
  var sql = `SELECT user.*, school.collage_slug as school_slug FROM user inner join school on school.id=user.school_id where email='${req.body.email}' AND password='${password}'`;
  console.log(sql);
  connection.query(sql, function (err, result, fields) {
    if (err) {
      throw err;
    } else {
      var token = jwt.sign({
      }, 'secret', { expiresIn: '12h' });
      res.send(JSON.stringify({ result, "token": token }));
    }
  })
};

function mysql_real_escape_string (str) {
    return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
        switch (char) {
            case "\0":
                return "\\0";
            case "\x08":
                return "\\b";
            case "\x09":
                return "\\t";
            case "\x1a":
                return "\\z";
            case "\n":
                return "\\n";
            case "\r":
                return "\\r";
            case "\"":
            case "'":
            case "\\":
            case "%":
                return "\\"+char; // prepends a backslash to backslash, percent,
                                  // and double/single quotes
        }
    });
}


exports.register = function (req, res, next) {
  res.setHeader('Content-Type', 'application/json');
  console.log('hello', jwt_verify.verifys(req.headers['authorization']));
  const password = md5(req.body.password);
  var sql = `select * from user where email='${req.body.email}' AND otp='${req.body.emailotp}'`;
  connection.query(sql, function(err, result){
      var school_name = '';
      var last_id = '';
    if(result.length>0){
      if(req.body.school_collage=='other'){
          school_name = mysql_real_escape_string(req.body.new_school);
          var insert = `insert into school (school_name, school_area_pin, collage_slug) values('${school_name}','${req.body.school_area_pin}','${req.body.school_slug}')`;
              console.log(insert)
                connection.query(insert, function (err, result) {
                  last_id = result.insertId;
                  var sql = `update user set school_id='${last_id}',school_collage='${school_name}',verify=1 where email='${req.body.email}'`;
                  connection.query(sql, function (err, result) {
                    
                  })
                })
      }else{
          var checkSchool = `select * from school where id='${req.body.school_collage}'`;
          
          school_name = req.body.school_collage;
          connection.query(checkSchool, function (err, resultschool) {
            if(resultschool.length>0){
                 school_name = mysql_real_escape_string(resultschool[0]['school_name']);
                var sql = `update user set school_id='${req.body.school_collage}',school_collage='${school_name}',verify=1 where email='${req.body.email}'`;
                  connection.query(sql, function (err, result) {
                    //res.send(JSON.stringify(sql))
                })
                //res.send(JSON.stringify(resultschool))
            }
          })
      }
      

      var sql = `update user set full_name='${req.body.full_name}', gender='${req.body.gender}', degree='${req.body.degree}', school_area_pin='${req.body.school_area_pin}' ,batch_year='${req.body.batch_year}',password='${password}',verify=1 where email='${req.body.email}'`;
      connection.query(sql, function (err, result) {
        if (err) {
          throw err;
        } else {
          console.log('success')
          res.send(JSON.stringify({
            message: "success"
          }))
        }

      })
    }else{
      res.send(JSON.stringify({
        message: "OTP Invalid"
      }))
    }
  })
}


  exports.email_verification = function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');

    var sql = `select * from user where email='${req.body.email}' AND verify=0`;
    console.log(sql)
    connection.query(sql, function(err, result){
      console.log('1',result.length)
      if(result.length!==0){
        console.log('1',result.length)
        //var name = capitalizeFirstLetter(result[0].full_name)
        const response = sendmail({
            from: 'info@mybatch.club',
            to: `${req.body.email}`,
            subject: 'Your OTP for mybatch.club Registration',
            html: `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Otp Email</title></head><body><div style="min-width:1000px;overflow:auto;line-height:2;"><div style="margin:50px auto;width:70%;padding:20px;box-shadow: 0 0 3px rgb(0 0 0 / 20%);"><div class="brand-logo" style="text-align: center;"> <a href="http://mybatch.club/" title="logo" target="_blank"> <img width="120" src="https://mybatch.club/images/logo/logo.png" title="logo" alt="logo"> </a> </div><div style="border-top:1px solid #eee"> </div><p style="font-size:1.1em;margin-bottom: 0;">Hi,</p><p style="margin-top: 0;">Thank you for registering with mybatch.club. Your OTP to confirm your registration is:</p><h2 style="background: #a50b2e;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px; line-height: 1.5;">${req.body.otp}</h2> <p>Please login <a href="http://mybatch.club/">here</a> after confirming your OTP verification.</p><p style="font-size:0.9em;">Thanks & Regards,<br/>Mybatch.club Support</p></div></div></body></html>`,
          }, function(err, reply) {
            console.log(err && err.stack);
            console.dir(reply);
        });
        var sql = `update user set otp = '${req.body.otp}' where email = '${req.body.email}'`;
          connection.query(sql, function (err, result) {
            if (err) {
              throw err;
            } else {
              res.send(JSON.stringify({
                message: "success"
              }))
            }

        })
        
        }else{
          var sql = `select * from user where email='${req.body.email}' AND verify=1`;
          connection.query(sql, function(err, result){
            
            if(result.length!=0){
              console.log('2')
                  res.send(JSON.stringify({
                    message: "Email Allready Exist!"
                  }))
              }else{
                const response = sendmail({
                        from: 'info@mybatch.club',
                        to: `${req.body.email}`,
                        subject: 'Your OTP for mybatch.club Registration',
                        html: `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Otp Email</title></head><body><div style="min-width:1000px;overflow:auto;line-height:2;"><div style="margin:50px auto;width:70%;padding:20px;box-shadow: 0 0 3px rgb(0 0 0 / 20%);"><div class="brand-logo" style="text-align: center;"> <a href="http://mybatch.club/" title="logo" target="_blank"> <img width="120" src="https://mybatch.club/images/logo/logo.png" title="logo" alt="logo"> </a> </div><div style="border-top:1px solid #eee"> </div><p style="font-size:1.1em;margin-bottom: 0;">Hi,</p><p style="margin-top: 0;">Thank you for registering with mybatch.club. Your OTP to confirm your registration is:</p><h2 style="background: #a50b2e;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px; line-height: 1.5;">${req.body.otp}</h2> <p>Please login <a href="http://mybatch.club/">here</a> after confirming your OTP verification.</p><p style="font-size:0.9em;">Thanks & Regards,<br/>Mybatch.club Support</p></div></div></body></html>`,
                        }, function(err, reply) {
                        console.log(err && err.stack);
                        console.dir(reply);
                  });
                console.log('3')
                var sql = `insert into user (otp, email) values('${req.body.otp}','${req.body.email}')`;
                    connection.query(sql, function (err, result) {
                      if (err) {
                        throw err;
                      } else {
                        res.send(JSON.stringify({
                          message: "success"
                        }))
                      }

                  })
                }
          })
        }
      })
    }
    
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

exports.forgot_password = function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');

    var sql = `select * from user where email='${req.body.email}'`;
    console.log(sql)
    var user_id = '';
    
    connection.query(sql, function(err, result){
      console.log('1',result)
      for (var i in result) {
        user_id = result[i].id;
      }
      var name = capitalizeFirstLetter(result[0].full_name);
      var html_val = `<!DOCTYPE html><html><head> <meta charset="utf-8"> <meta name="viewport" content="width=device-width, initial-scale=1"> <title>OTP for your Forgot Password</title></head><body> <div style="min-width:1000px;overflow:auto;line-height:2;"> <div style="margin:50px auto;width:70%;padding:20px;box-shadow: 0 0 3px rgb(0 0 0 / 20%);"> <div class="brand-logo" style="text-align: center;"> <a href="http://mybatch.club/" title="logo" target="_blank"> <img width="120" src="https://mybatch.club/images/logo/logo.png" title="logo" alt="logo"> </a> </div><div style="border-top:1px solid #eee"> </div><p style="font-size:1.1em;margin-bottom: 0;">Dear ${name},</p><p style="margin-top: 0;">You have sent a request to reset your password. Your OTP to reset a new Password is:</p><h2 style="background: #a50b2e;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px; line-height: 1.5;">${req.body.otp}</h2> <p>Note: If it is not you requesting the password change, then please ignore this email. You can continue using your old password as your password will remain unchanged unless you reset it using the above shared OTP.</p><p style="font-size:0.9em;">Thanks & Regards,<br/>Mybatch.club Support</p></div></div></body></html>`
      if(result.length!==0){

        console.log('1',result.length)
        const response = sendmail({
            from: 'no-reply@theartandfashion.in',
            to: `${req.body.email}`,
            subject: `OTP for your Forgot Password`,
            html: html_val,
          }, function(err, reply) {
            console.log(err && err.stack);
            console.dir(reply);
        });
        var sql = `update user set otp = '${req.body.otp}' where email = '${req.body.email}'`;
          connection.query(sql, function (err, result) {
            if (err) {
              throw err;
            } else {
              res.send(JSON.stringify({
                message: 'success'
              }))
            }

        })
        
        }else{
          res.send(JSON.stringify({
                message: "err"
              }))
        }
      })
    }
    
    
exports.friend_request = function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    var data = req.body;
    var name = capitalizeFirstLetter(data.name);
    var html_val = `<!DOCTYPE html><html><head> <meta charset="utf-8"> <meta name="viewport" content="width=device-width, initial-scale=1"> <title>Invite your Batchmate</title></head><body> <div style="font-family: 'Alegreya', serif;min-width:1000px;overflow:auto;line-height:2;"> <div style="margin:50px auto;width:70%;padding:20px;box-shadow: 0 0 3px rgb(0 0 0 / 20%);"> <div class="brand-logo" style="text-align: center;"> <a href="http://mybatch.club/" title="logo" target="_blank"> <img width="120" src="https://mybatch.club/images/logo/logo.png" title="logo" alt="logo"> </a> </div><div style="border-top:1px solid #eee"> </div><p style="font-size:1.1em;">Hi,</p><p style="margin-top: 0;">Your batchmate ${name} have invited you to join mybatch.club. You can interact with your batchmates, check what past memories they have shared and like and comment on those memories. You can also shared any past memories that you have in the form of some pictures etc.</p><p style="margin-bottom: 0;line-height: 1;">Please sign up by clicking on the Sign Up Button on this page : </p><a target="_blank" href="http://mybatch.club/" style="text-decoration: none;font-size: 14px;color: #3877c5;">http://mybatch.club/batch/${data.collage_slug}/${data.batch_year}</a> <p>Happy exploring mybatch.club!</p><p style="font-size:0.9em;">Thanks & Regards,<br/>Mybatch.club Support</p></div></div></body></html>`
    
    const response = sendmail({
        from: 'no-reply@theartandfashion.in',
        to: `${req.body.email}`,
        subject: `${name}, one of your batchmate has sent an Invitation to Join!`,
        html: html_val,
      }, function(err, reply) {
        console.log(err && err.stack);
        console.dir(reply);
    });
     res.send(JSON.stringify({
            message: "success"
          }))
}

exports.reset_password = function (req, res, next) {
  res.setHeader('Content-Type', 'application/json');
  var sql = '';
  if(req.body.femail!==null){
      var sql = `select * from user where otp='${req.body.otp}' AND email = '${req.body.femail}'`;
  }else{
      var sql = `select * from user where otp='${req.body.otp}' AND id = '${req.body.fid}'`;
  }    
  connection.query(sql, function(err, result){
  console.log('1',result.length)
  if(result.length!==0){
    console.log('1',result.length)
    const password = md5(req.body.password);
    var sqlu = '';
      if(req.body.femail!==null){
          var sqlu = `update user set password = '${password}' where email = '${req.body.femail}'`;
      }else{
          var sqlu = `update user set password = '${password}' where id = '${req.body.fid}'`;
      }
      connection.query(sqlu, function (err, result) {
        if (err) {
          throw err;
        } else {
          res.send(JSON.stringify({
            message: 'success'
          }))
        }

    })
     
    }else{
      res.send(JSON.stringify({
            message: "err"
          }))
    }
  })
}


exports.change_password = function (req, res, next) {
  res.setHeader('Content-Type', 'application/json');
  const password = md5(req.body.password);
  var sql = `update user set password='${password}' where id='${req.body.user_id}'`;
  connection.query(sql, function(err, result){
  console.log('1',result.length)
  if(result){
    res.send(JSON.stringify({
            message: "success"
          }))
     
    }else{
      res.send(JSON.stringify({
            message: "err"
          }))
    }
  })
}

exports.update_email = function (req, res, next) {
  res.setHeader('Content-Type', 'application/json');
  
  var sql = `update user set email='${req.body.email}' where id='${req.body.user_id}' and otp='${req.body.otp}'`;
  connection.query(sql, function(err, result){
  console.log('1',result.length)
  if(result){
    res.send(JSON.stringify({
            message: "success"
          }))
     
    }else{
      res.send(JSON.stringify({
            message: "err"
          }))
    }
  })
}

exports.change_email = function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');

    var sql = `select * from user where id='${req.body.user_id}'`;
    console.log(sql)
    var user_id = '';
    var email = '';
    connection.query(sql, function(err, result){
      console.log('1',result)
      for (var i in result) {
        user_id = result[i].id;
      }
      var html_val = `Your One Time Password is : ${req.body.otp}`
      if(result.length!==0){

        console.log('1',result.length)
        const response = sendmail({
            from: 'no-reply@theartandfashion.in',
            to: `${req.body.email}`,
            subject: 'OTP for mybatch.club',
            html: html_val,
          }, function(err, reply) {
            console.log(err && err.stack);
            console.dir(reply);
        });
        var sql = `update user set otp = '${req.body.otp}' where id = '${user_id}'`;
          connection.query(sql, function (err, result) {
            if (err) {
              throw err;
            } else {
              res.send(JSON.stringify({
                message: 'success'
              }))
            }

        })
        
        }else{
          res.send(JSON.stringify({
                message: "err"
              }))
        }
      })
    }


