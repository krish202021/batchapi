const express = require('express');
const connect = require('../connection/db_connect');
const connection = connect.con;
var jwt = require('jsonwebtoken');
const jwt_verify = require('../jwt/jwt_helper');
const fs = require('fs')

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

exports.get_student_image = function (req, res, next) {
  res.setHeader('Content-Type', 'application/json');
  console.log('hello', jwt_verify.verifys(req.headers['authorization']));
  console.log('hello', req.body);
  
      //var sql = `SELECT user.image, user.full_name, user.id, notification.status, notification.sender_id, notification.receiver_id FROM user left join notification on notification.receiver_id = user.id  where school_collage='${req.body.school_collage}' AND batch_year='${req.body.batch_year}' AND school_area_pin='${req.body.school_area_pin}'  LIMIT 0, 9`;
      var sql = `SELECT user.image, user.full_name, user.id, user.gender FROM user  where school_collage='${req.body.school_collage}' AND batch_year='${req.body.batch_year}' AND school_area_pin='${req.body.school_area_pin}'   LIMIT 0, 9`;
      console.log(sql);
      connection.query(sql, function (err, result, fields) {
          if (err) {
          throw err;
          } else {
          res.send(JSON.stringify({ result }));
          }
      })
  
};

exports.get_school = function(req, res, next){
  res.setHeader('Content-Type', 'application/json');
  var sql = `SELECT * FROM school where school_area_pin LIKE '%${req.body.pinCode}%' `;
  //console.log(req.body.pinCode)
  connection.query(sql, function (err, result, fields) {
      if (err) {
      throw err;
      } else {
      res.send(JSON.stringify({ result }));
      }
  })
}

exports.get_register_student = function(req, res, next){
  res.setHeader('Content-Type', 'application/json');
  var sql = `SELECT * FROM user where verify = 1 ORDER BY RAND ( ) LIMIT 12 `;
  //console.log(req.body.pinCode)
  connection.query(sql, function (err, result, fields) {
      if (err) {
      throw err;
      } else {
      res.send(JSON.stringify({ result }));
      }
  })
}

exports.get_post = function(req, res, next){
  res.setHeader('Content-Type', 'application/json');
  var sql = `SELECT * FROM post where user_id = '${req.body.user_id}' order by created_at DESC`;
  //console.log(req.body.pinCode)
  connection.query(sql, function (err, result, fields) {
      if (err) {
      throw err;
      } else {
      res.send(JSON.stringify({ result }));
      }
  })
}


exports.edit_post = function(req, res, next){
  res.setHeader('Content-Type', 'application/json');
  var sql = `SELECT * FROM post where user_id = '${req.body.user_id}' and post_id='${req.body.post_id}' `;
  //console.log(req.body.pinCode)
  connection.query(sql, function (err, result, fields) {
      if (err) {
      throw err;
      } else {
      res.send(JSON.stringify({ result }));
      }
  })
}

exports.update_post = function(req, res, next){
  res.setHeader('Content-Type', 'application/json');
  var desc = mysql_real_escape_string(req.body.post_description);
  var sql = `update post set post_description = '${desc}',post_image='${req.body.post_image}' where user_id = '${req.body.user_id}' and post_id = '${req.body.post_id}'`;
  connection.query(sql, function (err, result, fields) {
      if (err) {
        throw err;
      } else {
          if(req.body.prev_img!==req.body.post_image){
              var fs = require('fs');
              var filePath = `../public_html/mybatch.club/post_image/${req.body.prev_img}`; 
          }
          fs.unlinkSync(filePath);
        res.send(JSON.stringify({result})); 
      }
  })
} 

exports.delete_post = function(req, res, next){
  res.setHeader('Content-Type', 'application/json');
  var sql = `delete FROM post where user_id = '${req.body.user_id}' and post_id='${req.body.post_id}' `;
  //console.log(req.body.pinCode)
  connection.query(sql, function (err, result, fields) {
      if (err) {
      throw err;
      } else {
          var fs = require('fs');
          var filePath = `../public_html/mybatch.club/post_image/${req.body.img_name}`; 
          fs.unlinkSync(filePath);
          var sql = `delete FROM post_comment where user_id = '${req.body.user_id}' and post_id='${req.body.post_id}' `;
          connection.query(sql, function (err, result, fields) {
              if (err) {
              throw err;
              } else {
                  res.send(JSON.stringify({ result }));
              }
          })
          
      }
  })
}

exports.delete_file = function(req, res, next){
  res.setHeader('Content-Type', 'application/json');
    var fs = require('fs');
    var filePath = '../public_html/mybatch.club/post_image/banner1.jpg'; 
    fs.unlinkSync(filePath);
  //console.log(req.body.pinCode)
//   fs.unlink('./del.txts', (err) => {
//           if (err) {
//             res.send(JSON.stringify(err));
//           }else{
//               res.send(JSON.stringify({ result }));
//           }
//   })
}

exports.get_student_detail = function(req, res, next){
  res.setHeader('Content-Type', 'application/json');
  var sql = `SELECT user.*, state.state_name FROM user left join state on user.state=state.id where user.id=${req.body.id} `;
  console.log(req.body)
  connection.query(sql, function (err, result, fields) {
      if (err) {
        throw err;
      } else {
        res.send(JSON.stringify({ result })); 
      }
  })
} 

exports.update_student_detail = function(req, res, next){
  res.setHeader('Content-Type', 'application/json');
  
  console.log(req.body);
  var data = req.body;
  console.log('image',data.image)
  if(data.image!=''){
    // if(data.privious_image!==''){
    //     var fs = require('fs');
    //     var filePath = `../public_html/mybatch.club/images/${req.body.privious_image}`; 
    //     fs.unlinkSync(filePath);
    // }
    
    var sql = `UPDATE user set full_name='${data.full_name}',gender='${data.gender}',dob='${data.dob}',address = '${data.address}',school_area_pin='${data.pin_code}', phone_no = '${data.phone_no}', school_collage='${data.school_collage}', city='${data.city}', state='${data.state}', country='${data.country}',
    image	='${data.image}', profesion	='${data.profesion}', company_name = '${data.company_name}', job_position	='${data.job_position}' where id = '${data.id}'`;
    
  }else{
    var sql = `UPDATE user set full_name='${data.full_name}',gender='${data.gender}',dob='${data.dob}',address = '${data.address}',school_area_pin='${data.pin_code}', phone_no = '${data.phone_no}', school_collage='${data.school_collage}', city='${data.city}', country='${data.country}',
    profesion	='${data.profesion}', company_name = '${data.company_name}',state='${data.state}', job_position	='${data.job_position}' where id = '${data.id}'`;
  }
  console.log(sql);
    connection.query(sql, function (err, result, fields) {
        if (err) {
        throw err;
        } else {
        res.send(JSON.stringify({ result }));
        }
    })
}

exports.get_school_name = function(req, res, next){
  res.setHeader('Content-Type', 'application/json');
  console.log(req.body);
  var data = req.body;
  var sql = `select * from school where school_area_pin = '${req.body.school_area_pin}'`;
    console.log(sql);
    connection.query(sql, function (err, result, fields) {
        if (err) {
        throw err;
        } else {
        res.send(JSON.stringify({ result }));
        }
    })
}

exports.get_state = function(req, res, next){
  res.setHeader('Content-Type', 'application/json');
  var sql = `SELECT * FROM state`;
  console.log(req.body)
  connection.query(sql, function (err, result, fields) {
      if (err) {
        throw err;
      } else {
        res.send(JSON.stringify({ result })); 
      }
  })
} 



exports.get_city = function(req, res, next){
  res.setHeader('Content-Type', 'application/json');
  var sql = `SELECT * FROM city where state_id = ${req.body.id} ORDER BY city_name ASC`;
  console.log(req.body)
  connection.query(sql, function (err, result, fields) {
      if (err) {
        throw err;
      } else {
        res.send(JSON.stringify({ result })); 
      }
  })
} 

exports.get_city_all = function(req, res, next){
  res.setHeader('Content-Type', 'application/json');
  var sql = `SELECT * FROM city`;
  console.log(req.body)
  connection.query(sql, function (err, result, fields) {
      if (err) {
        throw err;
      } else {
        res.send(JSON.stringify({ result })); 
      }
  })
} 

exports.send_request = function(req, res, next){
  res.setHeader('Content-Type', 'application/json');
  var sql = `insert into notification (sender_id,receiver_id) values('${req.body.sender_id}', '${req.body.receiver_id}')`;
  console.log(req.body)
  connection.query(sql, function (err, result, fields) {
      if (err) {
        throw err;
      } else {
        res.send(JSON.stringify({
            message: "success" 
          }))
      }
  })
} 


exports.save_post = function(req, res, next){
  res.setHeader('Content-Type', 'application/json');
    if(req.body.postImageBase){
        if(req.body.postImageBase){
            const base64Data = req.body.postImageBase.replace(/^data:image\/png;base64,/, "");
            const fs = require("fs")
            fs.writeFile("../public_html/mybatch.club/post_image/"+req.body.post_image, base64Data, 'base64', (err) => {
              //res.send(JSON.stringify(err));
            });
        }
        
    }
    var desc = mysql_real_escape_string(req.body.post_description);
    var sql = `insert into post (user_id,post_description, post_image) values('${req.body.user_id}', '${desc}', '${req.body.post_image}')`;
    console.log(req.body)
    connection.query(sql, function (err, result, fields) {
      if (err) {
        throw err;
      } else {
        res.send(JSON.stringify({
            message: "success" 
          }))
      }
  })
} 

exports.check_send_request = function(req, res, next){
  res.setHeader('Content-Type', 'application/json');
  var sql = `SELECT * FROM notification where receiver_id = '${req.body.receiver_id}' AND sender_id = '${req.body.sender_id}'`;
  connection.query(sql, function (err, result, fields) {
      if (err) {
        throw err;
      } else {
        var length = result.length;
        res.send(JSON.stringify(length)); 
      }
  })
} 

exports.get_request = function(req, res, next){
  res.setHeader('Content-Type', 'application/json');
  var sql = `SELECT notification.*, user.* FROM notification inner join user on user.id=notification.sender_id where notification.receiver_id = '${req.body.id}' AND notification.status=''`;
  connection.query(sql, function (err, result, fields) {
      if (err) {
        throw err;
      } else {
        var length = result.length;
        res.send(JSON.stringify({result})); 
      }
  })
}

exports.get_personal_info = function(req, res, next){
  res.setHeader('Content-Type', 'application/json');
  var sql = `SELECT notification.*, user.* FROM notification inner join user on user.id=notification.sender_id where notification.receiver_id = '${req.body.reciver_id}' AND notification.sender_id = '${req.body.sender_id}' AND notification.status='accept'`;
  connection.query(sql, function (err, result, fields) {
      if (err) {
        throw err;
      } else {
        var length = result.length;
        if(length>0){
            res.send(JSON.stringify({result})); 
        }else{
            var sql = `SELECT notification.*, user.* FROM notification inner join user on user.id=notification.sender_id where notification.sender_id = '${req.body.reciver_id}' AND notification.receiver_id = '${req.body.sender_id}' AND notification.status='accept'`;
              connection.query(sql, function (err, result, fields) {
                  if (err) {
                    throw err;
                  } else {
                    res.send(JSON.stringify({result})); 
                  }
              })
        }
      }
  })
} 

exports.get_personal_info_single = function(req, res, next){
  res.setHeader('Content-Type', 'application/json');
  var sql = `SELECT notification.*, user.* FROM notification inner join user on user.id=notification.sender_id where notification.receiver_id = '${req.body.reciver_id}' AND notification.sender_id = '${req.body.sender_id}' `;
  connection.query(sql, function (err, result, fields) {
      if (err) {
        throw err;
      } else {
        var length = result.length;
        if(length>0){
            res.send(JSON.stringify({result})); 
        }else{
            var sql = `SELECT notification.*, user.* FROM notification inner join user on user.id=notification.sender_id where notification.sender_id = '${req.body.reciver_id}' AND notification.receiver_id = '${req.body.sender_id}' `;
              connection.query(sql, function (err, result, fields) {
                  if (err) {
                    throw err;
                  } else {
                    res.send(JSON.stringify({result})); 
                  }
              })
        }
      }
  })
} 

// exports.get_personal_info_single = function(req, res, next){
//   res.setHeader('Content-Type', 'application/json');
//   var sql = `SELECT * FROM notification where (notification.receiver_id = '${req.body.user_id}' OR notification.sender_id = '${req.body.user_id}')`;
//   connection.query(sql, function (err, result, fields) {
//       if (err) {
//         throw err;
//       } else {
//         var length = result.length; 
//         if(length>0){
//             res.send(JSON.stringify({result})); 
//         }
//       }
//   })
// } 

exports.update_request = function(req, res, next){
  res.setHeader('Content-Type', 'application/json');
  var sql = `update notification set status = '${req.body.stat}' where notification_id = '${req.body.id}'`;
  connection.query(sql, function (err, result, fields) {
      if (err) {
        throw err;
      } else {
        res.send(JSON.stringify({result})); 
      }
  })
} 

exports.get_collage_student = function(req, res, next){
  res.setHeader('Content-Type', 'application/json');
  var sql = `select id from school where collage_slug = '${req.body.collage_slug}'`;
  connection.query(sql, function (err, result, fields) {
      if (err) {
        throw err;
      } else {
          var sql = `select * from user where school_id = '${result[0].id}' AND batch_year = '${req.body.batch_year}'`;
          connection.query(sql, function (err, result, fields) {
              if (err) {
                throw err;
              } else {
                res.send(JSON.stringify({result})); 
              }
          })
        
      }
  })
}

exports.get_school_post = function(req, res, next){
  res.setHeader('Content-Type', 'application/json');
  var sql = `select id from school where collage_slug = '${req.body.collage_slug}'`;
  connection.query(sql, function (err, result, fields) {
      if (err) {
        throw err;
      } else {
          var sql = `SELECT user.*, post.* from post INNER JOIN user on post.user_id = user.id where school_id='${result[0].id}' ORDER BY RAND ( ) limit 3`;
          connection.query(sql, function (err, result, fields) {
              if (err) {
                throw err;
              } else {
                res.send(JSON.stringify({result})); 
              }
          })
        
      }
  })
} 

// exports.get_collage_student = function(req, res, next){
//   res.setHeader('Content-Type', 'application/json');
//   var sql = `select id from school where collage_slug = '${req.body.collage_slug}'`;
//   connection.query(sql, function (err, result, fields) {
//       if (err) {
//         throw err;
//       } else {
//           var sql = `select * from user where school_id = '${result[0].id}' AND batch_year = '${req.body.batch_year}'`;
//           connection.query(sql, function (err, result, fields) {
//               if (err) {
//                 throw err;
//               } else {
//                 res.send(JSON.stringify({result})); 
//               }
//           })
        
//       }
//   })
// }

exports.batch_post = function(req, res, next){
  res.setHeader('Content-Type', 'application/json');
  var sql = `SELECT post.*, user.*, post.created_at as post_time from user INNER JOIN post ON post.user_id = user.id where user.school_id = '${req.body.school_id}' order by post.created_at DESC`;
  connection.query(sql, function (err, result, fields) {
      if (err) {
        throw err;
      } else {
        res.send(JSON.stringify({result})); 
      }
  })
} 

exports.batch_post_detail = function(req, res, next){
  res.setHeader('Content-Type', 'application/json');
  var sql = `SELECT post.*, user.*, post.created_at as post_time from user INNER JOIN post ON post.user_id = user.id where post.post_id='${req.body.post_id}' order by post.created_at DESC`;
  connection.query(sql, function (err, result, fields) {
      if (err) {
        throw err;
      } else {
        res.send(JSON.stringify({result})); 
      }
  })
} 

exports.get_like_post = function(req, res, next){
  res.setHeader('Content-Type', 'application/json');
  var sql = `SELECT * from post_like  where post_id = '${req.body.post_id}' AND user_id='${req.body.user_id}'`;
  connection.query(sql, function (err, result, fields) {
      if (err) {
        throw err;
      } else {
        res.send(JSON.stringify({result})); 
      }
  })
} 


exports.get_comment = function(req, res, next){
  res.setHeader('Content-Type', 'application/json');
  var sql = `SELECT user.*, post_comment.* from post_comment inner join user on user.id=post_comment.user_id  where post_comment.post_id = '${req.body.post_id}' order by post_comment.comment_id DESC`;
  connection.query(sql, function (err, result, fields) {
      if (err) {
        throw err;
      } else {
        res.send(JSON.stringify({result})); 
      }
  })
} 

exports.post_like = function(req, res, next){
  res.setHeader('Content-Type', 'application/json');
  var checkSql =`select * from post_like where post_id='${req.body.post_id}' AND user_id='${req.body.user_id}'`;
  connection.query(checkSql, function(err, result, fields) {
      if(result.length>0){
          var sql = `update post_like set count ='${req.body.count}' where post_id='${req.body.post_id}' AND user_id='${req.body.user_id}' `;
          console.log(req.body)
          connection.query(sql, function (err, result, fields) {
              if (err) {
                throw err;
              } else {
                update_post_like(req.body.post_id , req.body.count==1?'add':'remove');
                res.send(JSON.stringify({
                    message: "success" 
                  }))
              }
          })
      }else{
          var sql = `insert into post_like (post_id,user_id,count) values('${req.body.post_id}', '${req.body.user_id}', '${req.body.count}')`;
          console.log(req.body)
          connection.query(sql, function (err, result, fields) {
              if (err) {
                throw err;
              } else {
                update_post_like(req.body.post_id , 'add');
                res.send(JSON.stringify({
                    message: "success" 
                  }))
              }
          })
      }
  })
  
} 

const update_post_like=(post_id , type)=>{
    if(type=='add'){
        var sql = `update post set total_like =total_like+1 where post_id=${post_id} `;
    }else{
        var sql = `update post set total_like =total_like-1 where post_id=${post_id} `;
    }
    connection.query(sql, function (err, result, fields) {
      if (err) {
        throw err;
      } else {
        console.log('updated');
      }
    })
}

exports.post_comment = function(req, res, nex){
    res.setHeader('Content-Type', 'application/json');
    var sql = `insert into post_comment (post_id,user_id,comments) values('${req.body.post_id}', '${req.body.user_id}', '${req.body.comments}')`;
    
    connection.query(sql, function (err, result, fields) {
        if (err) {
            throw err;
        } else {
        res.send(JSON.stringify({
            message: "success" 
          }))
        }
    })
}

exports.add_reply = function(req, res, nex){
    res.setHeader('Content-Type', 'application/json');
    var sql = `insert into comment_reply (comment_id,post_id,user_id,reply) values('${req.body.comment_id}','${req.body.post_id}', '${req.body.user_id}', '${req.body.reply}')`;
    
    connection.query(sql, function (err, result, fields) {
        if (err) {
            throw err;
        } else {
        res.send(JSON.stringify({
            message: "success" 
          }))
        }
    })
}

exports.get_reply = function(req, res, next){
  res.setHeader('Content-Type', 'application/json');
  var sql = `SELECT user.*, comment_reply.* from comment_reply inner join user on user.id=comment_reply.user_id  where comment_reply.post_id = '${req.body.post_id}' AND comment_reply.comment_id='${req.body.comment_id}' order by comment_reply.cr_id DESC`;
  connection.query(sql, function (err, result, fields) {
      if (err) {
        throw err;
      } else {
        res.send(JSON.stringify({result})); 
      }
  })
} 

exports.get_contact = function(req, res, next){
  res.setHeader('Content-Type', 'application/json');
  //var sql = `SELECT u.full_name,u.image as fimage, u2.image as simage, u2.full_name as second, u.id as f_id, u2.id as s_id, notification.status from user u join notification on u.id=notification.sender_id join user u2 on u2.id=notification.receiver_id and notification.status in('accept') where u.id='${req.body.user_id}' OR u2.id='${req.body.user_id}'`;
  var sql = `SELECT * from user where batch_year='${req.body.batch_year}' AND school_id='${req.body.school_id}'`;
  connection.query(sql, function (err, result, fields) {
      if (err) {
        throw err;
      } else {
        res.send(JSON.stringify({result})); 
      }
  })
} 

// function unique = (value, index, self) => {
//   return self.indexOf(value) === index
// }

exports.get_my_contact = function(req, res, next){
  res.setHeader('Content-Type', 'application/json');
  //const uniqueAges = req.body.users.filter(unique)
  res.send(JSON.stringify("hello"));

} 



exports.testing = function(req, res, next){
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify("testing"));
} 

